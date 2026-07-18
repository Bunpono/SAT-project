"""One-time, idempotent migration from the retired local SQLite database.

Run from SAT/backend after SUPABASE_URL and SUPABASE_SECRET_KEY are configured:
    venv\\Scripts\\python migrations\\migrate_sqlite_to_supabase.py
"""

import json
import os
import sqlite3
from pathlib import Path

import httpx
from dotenv import load_dotenv


load_dotenv(Path(__file__).resolve().parents[1] / ".env")
BASE_URL = os.environ["SUPABASE_URL"].rstrip("/") + "/rest/v1"
KEY = os.environ["SUPABASE_SECRET_KEY"]
HEADERS = {"apikey": KEY, "Prefer": "return=representation"}
SQLITE_PATH = Path(__file__).resolve().parents[1] / "sat.db"


def request(client: httpx.Client, method: str, table: str, *, params=None, payload=None):
    response = client.request(
        method,
        f"{BASE_URL}/{table}",
        headers=HEADERS,
        params=params,
        json=payload,
    )
    response.raise_for_status()
    return response.json() if response.content else []


def main():
    local = sqlite3.connect(SQLITE_PATH)
    local.row_factory = sqlite3.Row
    with httpx.Client(timeout=30) as client:
        remote_users = {
            row["email"]: row
            for row in request(client, "GET", "users", params={"select": "id,email"})
        }
        user_id_map = {}
        for row in local.execute("select * from users order by id"):
            payload = dict(row)
            local_id = payload.pop("id")
            existing = remote_users.get(payload["email"])
            if existing:
                saved = request(
                    client,
                    "PATCH",
                    "users",
                    params={"id": f"eq.{existing['id']}"},
                    payload=payload,
                )[0]
            else:
                saved = request(client, "POST", "users", payload=payload)[0]
            user_id_map[local_id] = saved["id"]

        for table, result_field in (
            ("analysis_history", "tree_json"),
            ("error_reports", "analysis_result_json"),
        ):
            for row in local.execute(f"select * from {table} order by id"):
                payload = dict(row)
                local_id = payload.pop("id")
                payload["legacy_sqlite_id"] = local_id
                if payload.get("user_id") is not None:
                    payload["user_id"] = user_id_map[payload["user_id"]]
                if payload.get(result_field):
                    payload[result_field] = json.loads(payload[result_field])
                existing = request(
                    client,
                    "GET",
                    table,
                    params={"select": "id", "legacy_sqlite_id": f"eq.{local_id}", "limit": "1"},
                )
                if not existing:
                    request(client, "POST", table, payload=payload)

    print("SQLite data migration completed successfully.")


if __name__ == "__main__":
    main()
