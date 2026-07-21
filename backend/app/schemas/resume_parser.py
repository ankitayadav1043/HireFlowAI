"""Response schemas for structured resume parsing results."""

import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class ResumeParsedData(BaseModel):
    """Extracted resume text and independently detected profile sections."""

    candidate_id: uuid.UUID
    full_text: str = Field(max_length=200_000)
    detected_name: str | None
    detected_email: str | None
    detected_phone: str | None
    detected_skills: list[str]
    detected_education: list[str]
    detected_experience: list[str]
    detected_projects: list[str]
    detected_certifications: list[str]
    resume_parsed_at: datetime

