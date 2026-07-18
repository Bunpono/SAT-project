"""API tests with an in-memory stand-in for the Supabase REST tables."""

import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient

import main
from app.auth import create_access_token, hash_password


class FakeSupabase:
    def __init__(self):
        self.users = []
        self.analyses = []
        self.reports = []
        self.next_ids = {"users": 1, "analysis_history": 1, "error_reports": 1}

    def reset(self):
        self.__init__()

    def request(self, method, table, *, params=None, json=None, prefer=None):
        params = params or {}
        rows = {"users": self.users, "analysis_history": self.analyses, "error_reports": self.reports}[table]

        def matches(row):
            for key, value in params.items():
                if key in {"order", "limit", "select"}:
                    continue
                if value.startswith("eq.") and str(row.get(key)) != value[3:]:
                    return False
            return True

        if method == "GET":
            result = [row.copy() for row in rows if matches(row)]
            if params.get("order") == "created_at.desc":
                result.reverse()
            return result[: int(params["limit"])] if "limit" in params else result
        if method == "POST":
            item = {
                "id": self.next_ids[table],
                "created_at": "2026-01-01T00:00:00+00:00",
                **json,
            }
            self.next_ids[table] += 1
            rows.append(item)
            return [item.copy()]
        if method == "PATCH":
            result = []
            for row in rows:
                if matches(row):
                    row.update(json)
                    result.append(row.copy())
            return result
        if method == "DELETE":
            rows[:] = [row for row in rows if not matches(row)]
            return None
        raise AssertionError(f"Unexpected request: {method} {table}")


class AuthenticationFlowTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.supabase = FakeSupabase()
        cls.supabase_patch = patch.object(main.supabase, "request", side_effect=cls.supabase.request)
        cls.supabase_patch.start()
        cls.client = TestClient(main.app)

    @classmethod
    def tearDownClass(cls):
        cls.supabase_patch.stop()

    def setUp(self):
        self.supabase.reset()
        self.user = self._add_user("Test User", "test-user@example.invalid", "user")
        self.admin = self._add_user("Test Admin", "test-admin@example.invalid", "admin")
        self.user_token = create_access_token(type("User", (), self.user)())
        self.admin_token = create_access_token(type("User", (), self.admin)())

    def _add_user(self, name, email, role):
        return main.supabase.request(
            "POST",
            "users",
            json={
                "name": name,
                "email": email,
                "password_hash": hash_password("password123"),
                "role": role,
            },
        )[0]

    @patch("main.predict_s_expression", return_value="(S (NP She) (VP is (NP a doctor)))")
    def test_guest_analyze_saves_null_user_id(self, _predict):
        response = self.client.post("/analyze", json={"sentence": "She is a doctor."})

        self.assertEqual(response.status_code, 200)
        self.assertIsNone(response.json()["user_id"])
        self.assertIsNone(self.supabase.analyses[0]["user_id"])

    @patch("main.predict_s_expression")
    def test_invalid_token_is_not_treated_as_guest(self, predict):
        response = self.client.post(
            "/analyze", json={"sentence": "She is a doctor."}, headers={"Authorization": "Bearer invalid-token"}
        )

        self.assertEqual(response.status_code, 401)
        predict.assert_not_called()

    @patch("main.predict_s_expression", return_value="(S (NP She) (VP is (NP a doctor)))")
    def test_logged_in_analyze_and_private_history(self, _predict):
        response = self.client.post(
            "/analyze", json={"sentence": "She is a doctor."}, headers={"Authorization": f"Bearer {self.user_token}"}
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["user_id"], self.user["id"])

        history_response = self.client.get("/history/my", headers={"Authorization": f"Bearer {self.user_token}"})
        self.assertEqual(history_response.status_code, 200)
        self.assertEqual(len(history_response.json()), 1)

    def test_register_and_login(self):
        registration = self.client.post(
            "/auth/register", json={"name": "New User", "email": "NEW@example.invalid", "password": "password123"}
        )
        self.assertEqual(registration.status_code, 201)
        login = self.client.post("/auth/login", json={"email": "new@example.invalid", "password": "password123"})
        self.assertEqual(login.status_code, 200)

    def test_guest_history_is_unauthorized(self):
        self.assertEqual(self.client.get("/history/my").status_code, 401)

    def test_health_and_openapi_are_available(self):
        self.assertEqual(self.client.get("/health").status_code, 200)
        self.assertIn("/analyze", self.client.get("/openapi.json").json()["paths"])

    @patch("main.predict_s_expression", return_value="(S (NP She) (VP is (NP a doctor)))")
    def test_admin_history_includes_guest_and_registered(self, _predict):
        self.client.post("/analyze", json={"sentence": "Guest sentence."})
        self.client.post("/analyze", json={"sentence": "User sentence."}, headers={"Authorization": f"Bearer {self.user_token}"})

        response = self.client.get("/admin/history", headers={"Authorization": f"Bearer {self.admin_token}"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 2)
        guest = next(item for item in response.json() if item["user_id"] is None)
        self.assertEqual(guest["user_label"], "Guest")
        registered = next(item for item in response.json() if item["user_id"] == self.user["id"])
        self.assertEqual(registered["user"]["name"], "Test User")


if __name__ == "__main__":
    unittest.main()
