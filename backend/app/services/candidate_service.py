"""Database operations for candidates."""

import uuid
from math import ceil

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.models.candidate import Candidate
from app.models.job import Job
from app.schemas.candidate import CandidateCreate, CandidateListResponse, CandidateUpdate


def job_exists(database: Session, job_id: uuid.UUID) -> bool:
    """Check a job reference without loading its complete description."""

    return database.scalar(select(Job.id).where(Job.id == job_id)) is not None


def _database_values(values: dict) -> dict:
    """Convert URL objects to strings accepted by SQLAlchemy string columns."""

    for field in ("linkedin_url", "portfolio_url"):
        if values.get(field) is not None:
            values[field] = str(values[field])
    return values


def create_candidate(
    database: Session, payload: CandidateCreate, creator_id: uuid.UUID
) -> Candidate:
    """Persist a normalized candidate for an existing job."""

    values = _database_values(payload.model_dump())
    candidate = Candidate(**values, created_by=creator_id)
    database.add(candidate)
    database.commit()
    database.refresh(candidate)
    return candidate


def list_candidates(
    database: Session,
    *,
    page: int,
    page_size: int,
    search: str | None = None,
    status: str | None = None,
    applied_job_id: uuid.UUID | None = None,
    location: str | None = None,
) -> CandidateListResponse:
    """Return newest candidates matching optional filters."""

    filters = []
    if search:
        term = f"%{search.strip()}%"
        filters.append(or_(Candidate.full_name.ilike(term), Candidate.email.ilike(term)))
    if status:
        filters.append(Candidate.status == status)
    if applied_job_id:
        filters.append(Candidate.applied_job_id == applied_job_id)
    if location:
        filters.append(func.lower(Candidate.location) == location.strip().lower())

    total = database.scalar(select(func.count(Candidate.id)).where(*filters)) or 0
    statement = (
        select(Candidate)
        .where(*filters)
        .order_by(Candidate.created_at.desc(), Candidate.id.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    items = list(database.scalars(statement).all())
    return CandidateListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        pages=ceil(total / page_size) if total else 0,
    )


def get_candidate(database: Session, candidate_id: uuid.UUID) -> Candidate | None:
    """Find one candidate by UUID."""

    return database.get(Candidate, candidate_id)


def update_candidate(
    database: Session, candidate: Candidate, payload: CandidateUpdate
) -> Candidate:
    """Apply only fields supplied by the client."""

    values = _database_values(payload.model_dump(exclude_unset=True, exclude_none=True))
    for field, value in values.items():
        setattr(candidate, field, value)
    database.commit()
    database.refresh(candidate)
    return candidate


def delete_candidate(database: Session, candidate: Candidate) -> None:
    """Delete a candidate in a committed transaction."""

    database.delete(candidate)
    database.commit()
