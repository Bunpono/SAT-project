"""Small server-side client for Supabase's PostgREST API.

The service-role key is deliberately kept on the backend.  It must never be
exposed as a Vite (``VITE_*``) variable or sent to a browser.
"""

import os
from typing import Any

import httpx
from fastapi import HTTPException


class SupabaseClient:
    def __init__(self) -> None:
        self.url = os.getenv("SUPABASE_URL", "").rstrip("/")
        # Supabase's current server-only key name is SUPABASE_SECRET_KEY.
        # Retain the legacy variable as a migration fallback.
        self.secret_key = os.getenv(
            "SUPABASE_SECRET_KEY", os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
        )

    @property
    def configured(self) -> bool:
        return bool(self.url and self.secret_key)

    def request(
        self,
        method: str,
        table: str,
        *,
        params: dict[str, str] | None = None,
        json: Any = None,
        prefer: str | None = None,
    ) -> Any:
        if not self.configured:
            raise HTTPException(
                status_code=503,
                detail=(
                    "Supabase is not configured. Set SUPABASE_URL and "
                    "SUPABASE_SECRET_KEY in the backend environment."
                ),
            )

        headers = {
            # The secret key is server-only. Supplying it as the API key lets
            # Supabase's gateway apply the service role without exposing it to
            # the browser.
            "apikey": self.secret_key,
        }
        if prefer:
            headers["Prefer"] = prefer

        try:
            response = httpx.request(
                method,
                f"{self.url}/rest/v1/{table}",
                headers=headers,
                params=params,
                json=json,
                timeout=15.0,
            )
        except httpx.RequestError as exc:
            raise HTTPException(
                status_code=502, detail="Unable to reach the Supabase API."
            ) from exc

        if response.is_error:
            raise HTTPException(
                status_code=502,
                detail="Supabase rejected the database request. Check its API settings and schema.",
            )
        return response.json() if response.content else None


supabase = SupabaseClient()
