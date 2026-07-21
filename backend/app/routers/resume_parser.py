"""Authenticated endpoints for parsing and retrieving resume analysis."""

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, status
from sqlalchemy.exc import SQLAlchemyError

from app.models.candidate import Candidate
from app.routers.auth import CurrentUser, DatabaseSession
from app.schemas.resume_parser import ResumeParsedData
from app.services import candidate_service, resume_parser_service, resume_service

router = APIRouter(prefix="/candidates", tags=["Resume Parsing"])


def get_candidate_or_404(database: DatabaseSession, candidate_id: uuid.UUID) -> Candidate:
    candidate = candidate_service.get_candidate(database, candidate_id)
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Candidate not found"
        )
    return candidate


def parsed_response(candidate: Candidate) -> ResumeParsedData:
    """Build a path-free API response from separately stored parser fields."""

    if candidate.resume_parsed_at is None or not candidate.resume_text:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Parsed resume data not found",
        )
    return ResumeParsedData(
        candidate_id=candidate.id,
        full_text=candidate.resume_text,
        detected_name=candidate.parsed_name,
        detected_email=candidate.parsed_email,
        detected_phone=candidate.parsed_phone,
        detected_skills=candidate.parsed_skills or [],
        detected_education=candidate.parsed_education or [],
        detected_experience=candidate.parsed_experience or [],
        detected_projects=candidate.parsed_projects or [],
        detected_certifications=candidate.parsed_certifications or [],
        resume_parsed_at=candidate.resume_parsed_at,
    )


@router.post("/{candidate_id}/resume/parse", response_model=ResumeParsedData)
def parse_candidate_resume(
    candidate_id: uuid.UUID,
    database: DatabaseSession,
    current_user: CurrentUser,
) -> ResumeParsedData:
    """Parse a safely stored resume and persist independent extracted data."""

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
    if not candidate.resume_path:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found")

    try:
        resume_path = resume_service.resolve_resume_path(candidate.resume_path)
        parsed = resume_parser_service.parse_resume(resume_path)
    except resume_service.ResumeNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found") from None
    except resume_service.ResumeStorageError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Resume storage unavailable",
        ) from None
    except resume_parser_service.ParserDependencyError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)
        ) from None
    except resume_parser_service.UnreadableResumeError as exc:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, detail=str(exc)
        ) from None
    except resume_parser_service.EmptyResumeTextError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail=str(exc)
        ) from None
    except resume_parser_service.ResumeParserError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Resume parsing failed",
        ) from None

    candidate.resume_text = parsed.full_text
    candidate.parsed_name = parsed.detected_name
    candidate.parsed_email = parsed.detected_email
    candidate.parsed_phone = parsed.detected_phone
    candidate.parsed_skills = parsed.detected_skills
    candidate.parsed_education = parsed.detected_education
    candidate.parsed_experience = parsed.detected_experience
    candidate.parsed_projects = parsed.detected_projects
    candidate.parsed_certifications = parsed.detected_certifications
    candidate.resume_parsed_at = datetime.now(timezone.utc)
    try:
        database.commit()
        database.refresh(candidate)
    except SQLAlchemyError:
        database.rollback()
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to save parsed resume data",
        ) from None
    return parsed_response(candidate)


@router.get("/{candidate_id}/resume/parsed-data", response_model=ResumeParsedData)
def get_parsed_resume_data(
    candidate_id: uuid.UUID,
    database: DatabaseSession,
    current_user: CurrentUser,
) -> ResumeParsedData:
    """Return the most recently persisted parser result without file paths."""

    del current_user
    try:
        return parsed_response(get_candidate_or_404(database, candidate_id))
    except HTTPException:
        raise
    except SQLAlchemyError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to load parsed resume data",
        ) from None

