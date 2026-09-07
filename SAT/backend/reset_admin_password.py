import argparse
from getpass import getpass

from app.auth import hash_password, verify_password
from app.supabase import supabase


def main():
    parser = argparse.ArgumentParser(description="Reset an existing SAT administrator password.")
    parser.add_argument("--email", required=True)
    args = parser.parse_args()

    email = args.email.strip().lower()
    users = supabase.request(
        "GET",
        "users",
        params={
            "select": "id,email,role",
            "email": f"eq.{email}",
            "limit": "1",
        },
    )
    if not users:
        raise SystemExit("Administrator account was not found.")

    user = users[0]
    if user.get("role") != "admin":
        raise SystemExit("The selected account is not an administrator.")

    password = getpass("New admin password (8-72 bytes): ")
    if len(password) < 8 or len(password.encode("utf-8")) > 72:
        raise SystemExit("Password must be 8-72 bytes long.")

    confirmation = getpass("Confirm new admin password: ")
    if password != confirmation:
        raise SystemExit("Passwords do not match. No changes were made.")

    new_hash = hash_password(password)
    supabase.request(
        "PATCH",
        "users",
        params={"id": f"eq.{user['id']}", "role": "eq.admin"},
        json={"password_hash": new_hash},
        prefer="return=representation",
    )

    updated = supabase.request(
        "GET",
        "users",
        params={
            "select": "password_hash",
            "id": f"eq.{user['id']}",
            "limit": "1",
        },
    )
    if not updated or not verify_password(password, updated[0].get("password_hash")):
        raise SystemExit("Password verification failed after the update.")

    print(f"Password reset completed for {email}.")


if __name__ == "__main__":
    main()
