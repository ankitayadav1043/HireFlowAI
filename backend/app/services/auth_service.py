"""Database operations for account registration and authentication."""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.user import UserCreate
from app.utils.auth import hash_password, verify_password


def get_user_by_email(database: Session, email: str) -> User | None:
    """Find a user by normalized email address."""

    statement = select(User).where(User.email == email.strip().lower())
    return database.scalar(statement)


def create_user(database: Session, payload: UserCreate) -> User:
    """Hash a password and persist a new user in one transaction."""

    user = User(
        full_name=payload.full_name,
        email=str(payload.email),
        password_hash=hash_password(payload.password),
        role=payload.role,
    )
    database.add(user)
    database.commit()
    database.refresh(user)
    return user


def authenticate_user(database: Session, email: str, password: str) -> User | None:
    """Return an active user only when both credentials are valid."""

    user = get_user_by_email(database, email)
    if not user or not user.is_active:
        return None
    return user if verify_password(password, user.password_hash) else None
