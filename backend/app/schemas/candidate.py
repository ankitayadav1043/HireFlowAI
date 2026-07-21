"""Validated API schemas for candidates."""

import uuid
from datetime import datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, HttpUrl, field_validator

CandidateStatus = Literal[
    "New", "Screening", "Shortlisted", "Interview", "Rejected", "Hired"
]


def normalize_skills(values: list[str]) -> list[str]:
    """Trim and de-duplicate skills while preserving their display casing."""

    result: list[str] = []
    seen: set[str] = set()
    for value in values:
        skill = " ".join(value.split())
        key = skill.casefold()
        if skill and key not in seen:
            seen.add(key)
            result.append(skill)
    return result


class CandidateCreate(BaseModel):
    """Fields accepted when adding a candidate."""

    full_name: str = Field(min_length=2, max_length=150)
    email: EmailStr
    phone: str | None = Field(default=None, max_length=30)
    location: str | None = Field(default=None, max_length=200)
    current_job_title: str | None = Field(default=None, max_length=200)
    experience_years: Decimal | None = Field(default=None, ge=0, le=99, decimal_places=1)
    skills: list[str] = Field(default_factory=list, max_length=100)
    education: str | None = Field(default=None, max_length=300)
    linkedin_url: HttpUrl | None = None
    portfolio_url: HttpUrl | None = None
    resume_filename: str | None = Field(default=None, max_length=255)
    resume_path: str | None = Field(default=None, max_length=1000)
    status: CandidateStatus = "New"
    applied_job_id: uuid.UUID

    @field_validator(
        "full_name", "phone", "location", "current_job_title", "education",
        "resume_filename", "resume_path",
    )
    @classmethod
    def clean_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        cleaned = " ".join(value.split())
        return cleaned or None

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: EmailStr) -> str:
        return str(value).strip().lower()

    @field_validator("skills")
    @classmethod
    def clean_skills(cls, values: list[str]) -> list[str]:
        return normalize_skills(values)


class CandidateUpdate(BaseModel):
    """Candidate fields that may be supplied during an update."""

    full_name: str | None = Field(default=None, min_length=2, max_length=150)
    email: EmailStr | None = None
    phone: str | None = Field(default=None, max_length=30)
    location: str | None = Field(default=None, max_length=200)
    current_job_title: str | None = Field(default=None, max_length=200)
    experience_years: Decimal | None = Field(default=None, ge=0, le=99, decimal_places=1)
    skills: list[str] | None = Field(default=None, max_length=100)
    education: str | None = Field(default=None, max_length=300)
    linkedin_url: HttpUrl | None = None
    portfolio_url: HttpUrl | None = None
    resume_filename: str | None = Field(default=None, max_length=255)
    resume_path: str | None = Field(default=None, max_length=1000)
    status: CandidateStatus | None = None
    applied_job_id: uuid.UUID | None = None

    @field_validator(
        "full_name", "phone", "location", "current_job_title", "education",
        "resume_filename", "resume_path",
    )
    @classmethod
    def clean_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        cleaned = " ".join(value.split())
        return cleaned or None

    @field_validator("email")
    @classmethod
    def normalize_optional_email(cls, value: EmailStr | None) -> str | None:
        return str(value).strip().lower() if value is not None else None

    @field_validator("skills")
    @classmethod
    def clean_optional_skills(cls, values: list[str] | None) -> list[str] | None:
        return normalize_skills(values) if values is not None else None


class CandidateResponse(BaseModel):
    """Complete candidate data returned to authenticated users."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    full_name: str
    email: EmailStr
    phone: str | None
    location: str | None
    current_job_title: str | None
    experience_years: Decimal | None
    skills: list[str]
    education: str | None
    linkedin_url: str | None
    portfolio_url: str | None
    resume_filename: str | None
    resume_path: str | None
    status: CandidateStatus
    applied_job_id: uuid.UUID
    created_by: uuid.UUID
    created_at: datetime
    updated_at: datetime


class CandidateListResponse(BaseModel):
    """Paginated candidate results and navigation metadata."""

    items: list[CandidateResponse]
    total: int
    page: int
    page_size: int
    pages: int
