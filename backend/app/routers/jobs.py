"""Authenticated CRUD endpoints for recruitment jobs."""

import uuid

from fastapi import APIRouter, HTTPException, Query, Response, status
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from app.models.job import Job
from app.routers.auth import CurrentUser, DatabaseSession
from app.schemas.job import JobCreate, JobListResponse, JobResponse, JobStatus, JobUpdate
from app.services import job_service

router = APIRouter(prefix="/jobs", tags=["Jobs"])


def require_job_manager(current_user: CurrentUser) -> None:
    """Allow only the two roles authorized to manage recruitment jobs."""

    if current_user.role not in {"admin", "recruiter"}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to manage jobs",
        )


def find_job_or_404(database: DatabaseSession, job_id: uuid.UUID) -> Job:
    """Return one job or a consistent not-found response."""

    job = job_service.get_job(database, job_id)
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    return job


@router.post("", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
def create_job(
    payload: JobCreate, database: DatabaseSession, current_user: CurrentUser
) -> Job:
    """Create a job for an authenticated recruiter or administrator."""

    require_job_manager(current_user)
    try:
        return job_service.create_job(database, payload, current_user.id)
    except (IntegrityError, SQLAlchemyError):
        database.rollback()
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to create job",
        ) from None


@router.get("", response_model=JobListResponse)
def read_jobs(
    database: DatabaseSession,
    current_user: CurrentUser,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    search: str | None = Query(default=None, max_length=200),
    department: str | None = Query(default=None, max_length=120),
    job_status: JobStatus | None = Query(default=None, alias="status"),
    location: str | None = Query(default=None, max_length=200),
) -> JobListResponse:
    """List newest jobs with pagination, title search, and filters."""

    del current_user  # The dependency enforces authentication before querying.
    try:
        return job_service.list_jobs(
            database,
            page=page,
            page_size=page_size,
            search=search,
            department=department,
            status=job_status,
            location=location,
        )
    except SQLAlchemyError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to load jobs",
        ) from None


@router.get("/{job_id}", response_model=JobResponse)
def read_job(
    job_id: uuid.UUID, database: DatabaseSession, current_user: CurrentUser
) -> Job:
    """Return one job to an authenticated user."""

    del current_user
    try:
        return find_job_or_404(database, job_id)
    except HTTPException:
        raise
    except SQLAlchemyError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to load job",
        ) from None


@router.put("/{job_id}", response_model=JobResponse)
def replace_job(
    job_id: uuid.UUID,
    payload: JobUpdate,
    database: DatabaseSession,
    current_user: CurrentUser,
) -> Job:
    """Update an existing job's editable fields."""

    require_job_manager(current_user)
    try:
        job = find_job_or_404(database, job_id)
        return job_service.update_job(database, job, payload)
    except HTTPException:
        raise
    except ValueError as exc:
        database.rollback()
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail=str(exc)
        ) from None
    except SQLAlchemyError:
        database.rollback()
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to update job",
        ) from None


@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_job(
    job_id: uuid.UUID,
    database: DatabaseSession,
    current_user: CurrentUser,
) -> Response:
    """Delete a job after authentication and role validation."""

    require_job_manager(current_user)
    try:
        job = find_job_or_404(database, job_id)
        job_service.delete_job(database, job)
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except HTTPException:
        raise
    except SQLAlchemyError:
        database.rollback()
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to delete job",
        ) from None
