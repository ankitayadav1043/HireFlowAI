"""Validated API payloads for authentication and users."""

import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class UserCreate(BaseModel):
    """Payload accepted when creating a user account."""

    full_name: str = Field(min_length=2, max_length=150)
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)
    role: Literal["admin", "recruiter"] = "recruiter"

    @field_validator("full_name")
    @classmethod
    def clean_full_name(cls, value: str) -> str:
        """Remove accidental surrounding and repeated whitespace."""

        cleaned = " ".join(value.split())
        if len(cleaned) < 2:
            raise ValueError("Full name must contain at least 2 characters")
        return cleaned

    @field_validator("password")
    @classmethod
    def validate_bcrypt_length(cls, value: str) -> str:
        if len(value.encode("utf-8")) > 72:
            raise ValueError("Password must not exceed 72 UTF-8 bytes")
        return value

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: EmailStr) -> str:
        """Store emails in one canonical, case-insensitive format."""

        return str(value).strip().lower()


class UserLogin(BaseModel):
    """Email and password credentials used to sign in."""

    email: EmailStr
    password: str = Field(min_length=1, max_length=72)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: EmailStr) -> str:
        return str(value).strip().lower()


class UserResponse(BaseModel):
    """Safe public user representation; password hashes are never returned."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    full_name: str
    email: EmailStr
    role: Literal["admin", "recruiter"]
    is_active: bool
    created_at: datetime
    updated_at: datetime


class TokenResponse(BaseModel):
    """JWT returned after successful authentication."""

    access_token: str
    token_type: Literal["bearer"] = "bearer"
