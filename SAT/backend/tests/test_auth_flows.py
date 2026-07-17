import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import main
from app.auth import create_access_token
from app.database import Base, get_db
from app.db_models import AnalysisHistory, User


class AuthenticationFlowTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.engine = create_engine(
            "sqlite://",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        cls.Session = sessionmaker(bind=cls.engine, autoflush=False, autocommit=False)
        Base.metadata.create_all(cls.engine)

        with cls.Session() as db:
            cls.user = User(
                name="Test User",
                email="test-user@example.invalid",
                password_hash="not-used",
                role="user",
            )
            cls.admin = User(
                name="Test Admin",
                email="test-admin@example.invalid",
                password_hash="not-used",
                role="admin",
            )
            db.add_all([cls.user, cls.admin])
            db.commit()
            db.refresh(cls.user)
            db.refresh(cls.admin)
            cls.user_token = create_access_token(cls.user)
            cls.admin_token = create_access_token(cls.admin)

        def override_get_db():
            db = cls.Session()
            try:
                yield db
            finally:
                db.close()

        main.app.dependency_overrides[get_db] = override_get_db
        cls.client = TestClient(main.app)

    @classmethod
    def tearDownClass(cls):
        main.app.dependency_overrides.clear()
        cls.engine.dispose()

    def setUp(self):
        with self.Session() as db:
            db.query(AnalysisHistory).delete()
            db.commit()

    @patch("main.predict_s_expression", return_value="(S (NP She) (VP is (NP a doctor)))")
    def test_guest_analyze_saves_null_user_id(self, _predict):
        response = self.client.post("/analyze", json={"sentence": "She is a doctor."})

        self.assertEqual(response.status_code, 200)
        self.assertIsNone(response.json()["user_id"])
        with self.Session() as db:
            item = db.query(AnalysisHistory).one()
            self.assertIsNone(item.user_id)

    @patch("main.predict_s_expression")
    def test_invalid_token_is_not_treated_as_guest(self, predict):
        response = self.client.post(
            "/analyze",
            json={"sentence": "She is a doctor."},
            headers={"Authorization": "Bearer invalid-token"},
        )

        self.assertEqual(response.status_code, 401)
        predict.assert_not_called()

    @patch("main.predict_s_expression", return_value="(S (NP She) (VP is (NP a doctor)))")
    def test_logged_in_analyze_and_private_history(self, _predict):
        response = self.client.post(
            "/analyze",
            json={"sentence": "She is a doctor."},
            headers={"Authorization": f"Bearer {self.user_token}"},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["user_id"], self.user.id)

        guest_response = self.client.post(
            "/analyze", json={"sentence": "They work."}
        )
        self.assertEqual(guest_response.status_code, 200)

        history_response = self.client.get(
            "/history/my",
            headers={"Authorization": f"Bearer {self.user_token}"},
        )
        self.assertEqual(history_response.status_code, 200)
        self.assertEqual(len(history_response.json()), 1)
        self.assertEqual(history_response.json()[0]["user_id"], self.user.id)

    def test_guest_history_is_unauthorized(self):
        response = self.client.get("/history/my")
        self.assertEqual(response.status_code, 401)

    def test_health_and_openapi_are_available(self):
        health_response = self.client.get("/health")
        self.assertEqual(health_response.status_code, 200)
        self.assertEqual(health_response.json()["status"], "ok")

        openapi_response = self.client.get("/openapi.json")
        self.assertEqual(openapi_response.status_code, 200)
        self.assertIn("/analyze", openapi_response.json()["paths"])

    @patch("main.predict_s_expression", return_value="(S (NP She) (VP is (NP a doctor)))")
    def test_admin_history_includes_guest_and_registered(self, _predict):
        self.client.post("/analyze", json={"sentence": "Guest sentence."})
        self.client.post(
            "/analyze",
            json={"sentence": "User sentence."},
            headers={"Authorization": f"Bearer {self.user_token}"},
        )

        response = self.client.get(
            "/admin/history",
            headers={"Authorization": f"Bearer {self.admin_token}"},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 2)
        guest = next(item for item in response.json() if item["user_id"] is None)
        self.assertEqual(guest["user_label"], "Guest")
        self.assertIsNone(guest["user"])


if __name__ == "__main__":
    unittest.main()
