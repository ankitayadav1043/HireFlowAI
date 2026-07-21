"""SQLAlchemy model for recruitment jobs."""

import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import ARRAY, CheckConstraint, DateTime, ForeignKey, Numeric, String, Text, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Job(Base):
    """A vacancy created by an authenticated recruiter or administrator."""

    __tablename__ = "jobs"
    __table_args__ = (
        CheckConstraint("status IN ('Open', 'Closed', 'Draft')", name="ck_jobs_status"),
        CheckConstraint("salary_min IS NULL OR salary_min >= 0", name="ck_jobs_salary_min"),
        CheckConstraint("salary_max IS NULL OR salary_max >= 0", name="ck_jobs_salary_max"),
        CheckConstraint(
            "salary_min IS NULL OR salary_max IS NULL OR salary_max >= salary_min",
            name="ck_jobs_salary_range",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    title: Mapped[str] = mapped_column(String(200), index=True, nullable=False)
    department: Mapped[str] = mapped_column(String(120), index=True, nullable=False)
    location: Mapped[str] = mapped_column(String(200), index=True, nullable=False)
    employment_type: Mapped[str] = mapped_column(String(80), nullable=False)
    experience_level: Mapped[str] = mapped_column(String(100), nullable=False)
    salary_min: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)
    salary_max: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    required_skills: Mapped[list[str]] = mapped_column(
        ARRAY(String(100)), default=list, nullable=False
    )
    status: Mapped[str] = mapped_column(
        String(20), default="Draft", index=True, nullable=False
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
