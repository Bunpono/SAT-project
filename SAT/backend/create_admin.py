import argparse
from getpass import getpass

from sqlalchemy import select

from app.auth import hash_password
from app.database import Base, SessionLocal, engine
from app.db_models import User


def main():
    parser = argparse.ArgumentParser(description="Create or promote an administrator account.")
    parser.add_argument("--email", required=True)
    parser.add_argument("--name", default="Administrator")
    args = parser.parse_args()

    email = args.email.strip().lower()
    if "@" not in email:
        raise SystemExit("Enter a valid email address.")

    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        user = db.scalar(select(User).where(User.email == email))
        if user:
            user.role = "admin"
            db.commit()
            print(f"Promoted {email} to admin.")
            return

        password = getpass("Admin password (minimum 8 characters): ")
        if len(password) < 8 or len(password.encode("utf-8")) > 72:
            raise SystemExit("Password must be 8-72 bytes long.")

        db.add(
            User(
                name=args.name.strip() or "Administrator",
                email=email,
                password_hash=hash_password(password),
                role="admin",
            )
        )
        db.commit()
        print(f"Created admin account {email}.")


if __name__ == "__main__":
    main()
