"""JWT-protected CRUD endpoints for candidates."""

import uuid

from fastapi import APIRouter, HTTPException, Query, Response, status
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from app.models.candidate import Candidate
from app.routers.auth import CurrentUser, DatabaseSession
from app.schemas.candidate import (
    CandidateCreate,
    CandidateListResponse,
    CandidateResponse,
    CandidateStatus,
    CandidateUpdate,
)
from app.services import candidate_service

router = APIRouter(prefix="/candidates", tags=["Candidates"])


def find_candidate_or_404(
    database: DatabaseSession, candidate_id: uuid.UUID
) -> Candidate:
    """Load one candidate or return a consistent HTTP 404."""

    candidate = candidate_service.get_candidate(database, candidate_id)
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Candidate not found"
        )
    return candidate


def ensure_job_exists(database: DatabaseSession, job_id: uuid.UUID) -> None:
    """Reject candidate writes that reference a missing job."""

    if not candidate_service.job_exists(database, job_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")


@router.post("", response_model=CandidateResponse, status_code=status.HTTP_201_CREATED)
def create_candidate(
    payload: CandidateCreate,
    database: DatabaseSession,
    current_user: CurrentUser,
) -> Candidate:
    """Create a candidate linked to an existing job."""

    try:
        ensure_job_exists(database, payload.applied_job_id)
        return candidate_service.create_candidate(database, payload, current_user.id)
    except HTTPException:
        raise
    except (IntegrityError, SQLAlchemyError):
        database.rollback()
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to create candidate",
        ) from None


@router.get("", response_model=CandidateListResponse)
def read_candidates(
    database: DatabaseSession,
    current_user: CurrentUser,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    search: str | None = Query(default=None, max_length=320),
    candidate_status: CandidateStatus | None = Query(default=None, alias="status"),
    applied_job_id: uuid.UUID | None = None,
    location: str | None = Query(default=None, max_length=200),
) -> CandidateListResponse:
    """List candidates with pagination, search, filters, and newest-first order."""

    del current_user
    try:
        return candidate_service.list_candidates(
            database,
            page=page,
            page_size=page_size,
            search=search,
            status=candidate_status,
            applied_job_id=applied_job_id,
            location=location,
        )
    except SQLAlchemyError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to load candidates",
        ) from None


@router.get("/{candidate_id}", response_model=CandidateResponse)
def read_candidate(
    candidate_id: uuid.UUID,
    database: DatabaseSession,
    current_user: CurrentUser,
) -> Candidate:
    """Return one candidate to an authenticated user."""

    del current_user
    try:
        return find_candidate_or_404(database, candidate_id)
    except HTTPException:
        raise
    except SQLAlchemyError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to load candidate",
        ) from None


@router.put("/{candidate_id}", response_model=CandidateResponse)
def update_candidate(
    candidate_id: uuid.UUID,
    payload: CandidateUpdate,
    database: DatabaseSession,
    current_user: CurrentUser,
) -> Candidate:
    """Update a candidate and validate any changed job reference."""

    del current_user
    try:
        candidate = find_candidate_or_404(database, candidate_id)
        if payload.applied_job_id is not None:
            ensure_job_exists(database, payload.applied_job_id)
        return candidate_service.update_candidate(database, candidate, payload)
    except HTTPException:
        raise
    except (IntegrityError, SQLAlchemyError):
        database.rollback()
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to update candidate",
        ) from None


@router.delete("/{candidate_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_candidate(
    candidate_id: uuid.UUID,
    database: DatabaseSession,
    current_user: CurrentUser,
) -> Response:
    """Delete a candidate and return an empty HTTP 204 response."""

    del current_user
    try:
        candidate = find_candidate_or_404(database, candidate_id)
        candidate_service.delete_candidate(database, candidate)
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except HTTPException:
        raise
    except SQLAlchemyError:
        database.rollback()
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to delete candidate",
        ) from None
