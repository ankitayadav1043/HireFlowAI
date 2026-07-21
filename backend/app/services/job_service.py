"""Database queries and mutations for recruitment jobs."""

import uuid
from math import ceil

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.job import Job
from app.schemas.job import JobCreate, JobListResponse, JobUpdate


def create_job(database: Session, payload: JobCreate, creator_id: uuid.UUID) -> Job:
    """Persist a job belonging to the authenticated creator."""

    job = Job(**payload.model_dump(), created_by=creator_id)
    database.add(job)
    database.commit()
    database.refresh(job)
    return job


def list_jobs(
    database: Session,
    *,
    page: int,
    page_size: int,
    search: str | None = None,
    department: str | None = None,
    status: str | None = None,
    location: str | None = None,
) -> JobListResponse:
    """Return newest jobs matching optional case-insensitive filters."""

    filters = []
    if search:
        filters.append(Job.title.ilike(f"%{search.strip()}%"))
    if department:
        filters.append(func.lower(Job.department) == department.strip().lower())
    if status:
        filters.append(Job.status == status)
    if location:
        filters.append(func.lower(Job.location) == location.strip().lower())

    total = database.scalar(select(func.count(Job.id)).where(*filters)) or 0
    statement = (
        select(Job)
        .where(*filters)
        .order_by(Job.created_at.desc(), Job.id.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    items = list(database.scalars(statement).all())
    return JobListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        pages=ceil(total / page_size) if total else 0,
    )


def get_job(database: Session, job_id: uuid.UUID) -> Job | None:
    """Find one job by UUID."""

    return database.get(Job, job_id)


def update_job(database: Session, job: Job, payload: JobUpdate) -> Job:
    """Apply validated fields while preserving the job identity and creator."""

    updates = payload.model_dump(exclude_unset=True)
    salary_min = updates.get("salary_min", job.salary_min)
    salary_max = updates.get("salary_max", job.salary_max)
    if salary_min is not None and salary_max is not None and salary_max < salary_min:
        raise ValueError("salary_max must be greater than or equal to salary_min")
    for field, value in updates.items():
        setattr(job, field, value)
    database.commit()
    database.refresh(job)
    return job


def delete_job(database: Session, job: Job) -> None:
    """Delete a job in one committed transaction."""

    database.delete(job)
    database.commit()
