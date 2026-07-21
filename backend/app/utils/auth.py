"""Password and JWT helpers shared by authentication routes."""

from datetime import datetime, timedelta, timezone
from typing import Any

import bcrypt
from jose import JWTError, jwt

from app.config import settings


class InvalidTokenError(ValueError):
    """Raised when an access token is missing required or valid claims."""


def hash_password(password: str) -> str:
    """Hash a validated password using bcrypt with a random salt."""

    encoded = password.encode("utf-8")
    if len(encoded) > 72:
        raise ValueError("Password must not exceed 72 UTF-8 bytes")
    return bcrypt.hashpw(encoded, bcrypt.gensalt(rounds=12)).decode("utf-8")


def verify_password(plain_password: str, password_hash: str) -> bool:
    """Compare a password to its bcrypt hash without raising on bad input."""

    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"), password_hash.encode("utf-8")
        )
    except (TypeError, ValueError):
        return False


def create_access_token(subject: str, extra_claims: dict[str, Any] | None = None) -> str:
    """Create a signed, time-limited JWT for one user identifier."""

    now = datetime.now(timezone.utc)
    payload: dict[str, Any] = {
        "sub": subject,
        "iat": now,
        "exp": now + timedelta(minutes=settings.access_token_expire_minutes),
        "type": "access",
    }
    if extra_claims:
        payload.update(extra_claims)
    return jwt.encode(payload, settings.secret_key, algorithm=settings.jwt_algorithm)


def verify_access_token(token: str) -> dict[str, Any]:
    """Decode an access token and require its core security claims."""

    try:
        payload = jwt.decode(
            token,
            settings.secret_key,
            algorithms=[settings.jwt_algorithm],
            options={"require_sub": True, "require_exp": True},
        )
    except JWTError as exc:
        raise InvalidTokenError("Invalid or expired access token") from exc

    if payload.get("type") != "access" or not payload.get("sub"):
        raise InvalidTokenError("Invalid access token")
    return payload
