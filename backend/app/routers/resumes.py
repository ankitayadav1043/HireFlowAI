"""Authenticated candidate resume upload, download, and deletion routes."""

import logging
import uuid

from fastapi import APIRouter, File, HTTPException, Response, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.exc import SQLAlchemyError

from app.models.candidate import Candidate
from app.routers.auth import CurrentUser, DatabaseSession
from app.schemas.candidate import CandidateResponse
from app.services import candidate_service, resume_service

router = APIRouter(prefix="/candidates", tags=["Candidate Resumes"])
logger = logging.getLogger(__name__)


def get_candidate_or_404(database: DatabaseSession, candidate_id: uuid.UUID) -> Candidate:
    """Load a candidate while keeping resume route errors consistent."""

    candidate = candidate_service.get_candidate(database, candidate_id)
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Candidate not found"
        )
    return candidate


@router.post("/{candidate_id}/resume", response_model=CandidateResponse)
async def upload_candidate_resume(
    candidate_id: uuid.UUID,
    database: DatabaseSession,
    current_user: CurrentUser,
    file: UploadFile = File(...),
) -> Candidate:
    """Validate and replace a candidate resume using safe local storage."""

    del current_user
    try:
        candidate = get_candidate_or_404(database, candidate_id)
    except HTTPException:
        raise
    except SQLAlchemyError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to load candidate",
        ) from None

    try:
        stored = await resume_service.store_resume(file)
    except resume_service.ResumeTooLargeError as exc:
        raise HTTPException(status_code=status.HTTP_413_CONTENT_TOO_LARGE, detail=str(exc)) from None
    except resume_service.UnsupportedResumeError as exc:
        raise HTTPException(status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, detail=str(exc)) from None
    except resume_service.ResumeStorageError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Resume storage unavailable",
        ) from None

    previous_path = candidate.resume_path
    candidate.resume_filename = stored.filename
    candidate.resume_path = stored.relative_path
    candidate.resume_text = None
    candidate.parsed_name = None
    candidate.parsed_email = None
    candidate.parsed_phone = None
    candidate.parsed_skills = None
    candidate.parsed_education = None
    candidate.parsed_experience = None
    candidate.parsed_projects = None
    candidate.parsed_certifications = None
    candidate.resume_parsed_at = None
    try:
        database.commit()
        database.refresh(candidate)
    except SQLAlchemyError:
        database.rollback()
        resume_service.remove_resume(stored.relative_path, missing_ok=True)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to save resume metadata",
        ) from None

    if previous_path and previous_path != stored.relative_path:
        try:
            resume_service.remove_resume(previous_path, missing_ok=True)
        except resume_service.ResumeStorageError:
            logger.warning("Old resume could not be removed after safe replacement")
    return candidate


@router.get("/{candidate_id}/resume", response_class=FileResponse)
def download_candidate_resume(
    candidate_id: uuid.UUID,
    database: DatabaseSession,
    current_user: CurrentUser,
) -> FileResponse:
    """Download a candidate's stored PDF or DOCX resume."""

    del current_user
    try:
        candidate = get_candidate_or_404(database, candidate_id)
    except HTTPException:
        raise
    except SQLAlchemyError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to load candidate",
        ) from None
    if not candidate.resume_path or not candidate.resume_filename:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found")
    try:
        path = resume_service.resolve_resume_path(candidate.resume_path)
    except resume_service.ResumeNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found") from None
    except resume_service.ResumeStorageError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Resume storage unavailable",
        ) from None

    media_type = resume_service.ALLOWED_TYPES.get(path.suffix.lower())
    return FileResponse(path=path, filename=candidate.resume_filename, media_type=media_type)


@router.delete("/{candidate_id}/resume", status_code=status.HTTP_204_NO_CONTENT)
def delete_candidate_resume(
    candidate_id: uuid.UUID,
    database: DatabaseSession,
    current_user: CurrentUser,
) -> Response:
    """Delete a resume and clear its candidate metadata transactionally."""

    del current_user
    try:
        candidate = get_candidate_or_404(database, candidate_id)
    except HTTPException:
        raise
    except SQLAlchemyError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to load candidate",
        ) from None
    if not candidate.resume_path or not candidate.resume_filename:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found")

    try:
        original, staged = resume_service.stage_resume_deletion(candidate.resume_path)
    except resume_service.ResumeNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found") from None
    except resume_service.ResumeStorageError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Resume storage unavailable",
        ) from None

    candidate.resume_filename = None
    candidate.resume_path = None
    candidate.resume_text = None
    candidate.parsed_name = None
    candidate.parsed_email = None
    candidate.parsed_phone = None
    candidate.parsed_skills = None
    candidate.parsed_education = None
    candidate.parsed_experience = None
    candidate.parsed_projects = None
    candidate.parsed_certifications = None
    candidate.resume_parsed_at = None
    try:
        database.commit()
    except SQLAlchemyError:
        database.rollback()
        resume_service.restore_staged_resume(original, staged)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to delete resume metadata",
        ) from None

    try:
        resume_service.finalize_staged_deletion(staged)
    except resume_service.ResumeStorageError:
        logger.warning("Staged resume cleanup will require maintenance")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
