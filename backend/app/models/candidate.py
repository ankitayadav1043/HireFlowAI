"""SQLAlchemy model for job candidates."""

import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import ARRAY, CheckConstraint, DateTime, ForeignKey, Numeric, String, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Candidate(Base):
    """A person submitted to a specific recruitment job."""

    __tablename__ = "candidates"
    __table_args__ = (
        CheckConstraint(
            "status IN ('New', 'Screening', 'Shortlisted', 'Interview', 'Rejected', 'Hired')",
            name="ck_candidates_status",
        ),
        CheckConstraint(
            "experience_years IS NULL OR experience_years >= 0",
            name="ck_candidates_experience_years",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    full_name: Mapped[str] = mapped_column(String(150), index=True, nullable=False)
    email: Mapped[str] = mapped_column(String(320), index=True, nullable=False)
    phone: Mapped[str | None] = mapped_column(String(30), nullable=True)
    location: Mapped[str | None] = mapped_column(String(200), index=True, nullable=True)
    current_job_title: Mapped[str | None] = mapped_column(String(200), nullable=True)
    experience_years: Mapped[Decimal | None] = mapped_column(Numeric(4, 1), nullable=True)
    skills: Mapped[list[str]] = mapped_column(ARRAY(String(100)), default=list, nullable=False)
    education: Mapped[str | None] = mapped_column(String(300), nullable=True)
    linkedin_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    portfolio_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    resume_filename: Mapped[str | None] = mapped_column(String(255), nullable=True)
    resume_path: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    status: Mapped[str] = mapped_column(String(30), default="New", index=True, nullable=False)
    applied_job_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("jobs.id", ondelete="RESTRICT"),
        index=True,
        nullable=False,
    )
    created_by: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="RESTRICT"),
        index=True,
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
