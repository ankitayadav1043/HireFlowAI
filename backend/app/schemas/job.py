"""Validated request and response schemas for jobs."""

import uuid
from datetime import datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

JobStatus = Literal["Open", "Closed", "Draft"]


class JobCreate(BaseModel):
    """Fields required to create a recruitment job."""

    title: str = Field(min_length=2, max_length=200)
    department: str = Field(min_length=2, max_length=120)
    location: str = Field(min_length=2, max_length=200)
    employment_type: str = Field(min_length=2, max_length=80)
    experience_level: str = Field(min_length=1, max_length=100)
    salary_min: Decimal | None = Field(default=None, ge=0, max_digits=12, decimal_places=2)
    salary_max: Decimal | None = Field(default=None, ge=0, max_digits=12, decimal_places=2)
    description: str = Field(min_length=30)
    required_skills: list[str] = Field(min_length=1, max_length=50)
    status: JobStatus = "Draft"

    @field_validator(
        "title", "department", "location", "employment_type", "experience_level"
    )
    @classmethod
    def clean_text(cls, value: str) -> str:
        return " ".join(value.split())

    @field_validator("description")
    @classmethod
    def clean_description(cls, value: str) -> str:
        return value.strip()

    @field_validator("required_skills")
    @classmethod
    def normalize_skills(cls, values: list[str]) -> list[str]:
        """Trim skills, remove empty values, and de-duplicate case-insensitively."""

        result: list[str] = []
        seen: set[str] = set()
        for value in values:
            skill = " ".join(value.split())
            key = skill.casefold()
            if skill and key not in seen:
                seen.add(key)
                result.append(skill)
        if not result:
            raise ValueError("At least one required skill is required")
        return result

    @model_validator(mode="after")
    def validate_salary_range(self) -> "JobCreate":
        if (
            self.salary_min is not None
            and self.salary_max is not None
            and self.salary_max < self.salary_min
        ):
            raise ValueError("salary_max must be greater than or equal to salary_min")
        return self


class JobUpdate(BaseModel):
    """Fields that may be changed on an existing job."""

    title: str | None = Field(default=None, min_length=2, max_length=200)
    department: str | None = Field(default=None, min_length=2, max_length=120)
    location: str | None = Field(default=None, min_length=2, max_length=200)
    employment_type: str | None = Field(default=None, min_length=2, max_length=80)
    experience_level: str | None = Field(default=None, min_length=1, max_length=100)
    salary_min: Decimal | None = Field(default=None, ge=0, max_digits=12, decimal_places=2)
    salary_max: Decimal | None = Field(default=None, ge=0, max_digits=12, decimal_places=2)
    description: str | None = Field(default=None, min_length=30)
    required_skills: list[str] | None = Field(default=None, min_length=1, max_length=50)
    status: JobStatus | None = None

    @field_validator(
        "title", "department", "location", "employment_type", "experience_level"
    )
    @classmethod
    def clean_optional_text(cls, value: str | None) -> str | None:
        return " ".join(value.split()) if value is not None else None

    @field_validator("description")
    @classmethod
    def clean_optional_description(cls, value: str | None) -> str | None:
        return value.strip() if value is not None else None

    @field_validator("required_skills")
    @classmethod
    def normalize_optional_skills(cls, values: list[str] | None) -> list[str] | None:
        return JobCreate.normalize_skills(values) if values is not None else None


class JobResponse(BaseModel):
    """Complete public representation of a recruitment job."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    department: str
    location: str
    employment_type: str
    experience_level: str
    salary_min: Decimal | None
    salary_max: Decimal | None
    description: str
    required_skills: list[str]
    status: JobStatus
    created_by: uuid.UUID
    created_at: datetime
    updated_at: datetime


class JobListResponse(BaseModel):
    """Paginated jobs and navigation metadata."""

    items: list[JobResponse]
    total: int
    page: int
    page_size: int
    pages: int
