"""Secure local storage operations for candidate resumes."""

import logging
import os
import uuid
import zipfile
from dataclasses import dataclass
from io import BytesIO
from pathlib import Path

from fastapi import UploadFile

from app.config import BACKEND_DIR

MAX_RESUME_SIZE = 5 * 1024 * 1024
UPLOAD_DIRECTORY = BACKEND_DIR / "uploads" / "resumes"
PDF_MEDIA_TYPE = "application/pdf"
DOCX_MEDIA_TYPE = (
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
)
ALLOWED_TYPES = {".pdf": PDF_MEDIA_TYPE, ".docx": DOCX_MEDIA_TYPE}
logger = logging.getLogger(__name__)


class ResumeValidationError(ValueError):
    """Base class for resume validation failures."""


class UnsupportedResumeError(ResumeValidationError):
    """Raised when extension, MIME type, or content is unsupported."""


class ResumeTooLargeError(ResumeValidationError):
    """Raised when a resume exceeds the configured five-megabyte limit."""


class ResumeNotFoundError(FileNotFoundError):
    """Raised when stored resume metadata has no corresponding file."""


class ResumeStorageError(OSError):
    """Raised for safe, client-facing storage failures."""


@dataclass(frozen=True)
class StoredResume:
    """Safe filename and backend-relative path persisted on a candidate."""

    filename: str
    relative_path: str
    media_type: str


def ensure_resume_directory() -> Path:
    """Create and return the configured resume directory."""

    try:
        UPLOAD_DIRECTORY.mkdir(parents=True, exist_ok=True)
        return UPLOAD_DIRECTORY.resolve()
    except OSError as exc:
        raise ResumeStorageError("Resume storage is unavailable") from exc


def _safe_path(filename: str) -> Path:
    """Resolve a generated filename and ensure it remains inside storage."""

    directory = ensure_resume_directory()
    candidate_path = (directory / filename).resolve()
    if not candidate_path.is_relative_to(directory):
        raise ResumeStorageError("Unsafe resume path")
    return candidate_path


def resolve_resume_path(relative_path: str) -> Path:
    """Resolve persisted metadata without allowing absolute or traversed paths."""

    directory = ensure_resume_directory()
    try:
        stored_path = (BACKEND_DIR / relative_path).resolve()
    except (OSError, RuntimeError) as exc:
        raise ResumeStorageError("Invalid resume path") from exc
    if not stored_path.is_relative_to(directory):
        raise ResumeStorageError("Unsafe resume path")
    if not stored_path.is_file():
        raise ResumeNotFoundError("Resume file not found")
    return stored_path


def _is_valid_content(extension: str, content: bytes) -> bool:
    if extension == ".pdf":
        return content.startswith(b"%PDF-")
    try:
        with zipfile.ZipFile(BytesIO(content)) as archive:
            names = set(archive.namelist())
            return "[Content_Types].xml" in names and "word/document.xml" in names
    except (zipfile.BadZipFile, OSError):
        return False


async def store_resume(upload: UploadFile) -> StoredResume:
    """Validate an upload, assign a UUID filename, and persist it atomically."""

    original_name = Path(upload.filename or "").name
    extension = Path(original_name).suffix.lower()
    expected_media_type = ALLOWED_TYPES.get(extension)
    if not expected_media_type or upload.content_type != expected_media_type:
        raise UnsupportedResumeError("Only PDF and DOCX resumes are supported")

    content = bytearray()
    try:
        while chunk := await upload.read(1024 * 1024):
            content.extend(chunk)
            if len(content) > MAX_RESUME_SIZE:
                raise ResumeTooLargeError("Resume must not exceed 5 MB")
    finally:
        await upload.close()

    if not content or not _is_valid_content(extension, bytes(content)):
        raise UnsupportedResumeError("File content does not match its resume type")

    filename = f"{uuid.uuid4().hex}{extension}"
    destination = _safe_path(filename)
    try:
        with destination.open("xb") as stored_file:
            stored_file.write(content)
    except OSError as exc:
        raise ResumeStorageError("Unable to store resume") from exc

    return StoredResume(
        filename=filename,
        relative_path=destination.relative_to(BACKEND_DIR).as_posix(),
        media_type=expected_media_type,
    )


def remove_resume(relative_path: str, *, missing_ok: bool = False) -> None:
    """Delete a contained resume path without following client filenames."""

    try:
        resolve_resume_path(relative_path).unlink()
    except ResumeNotFoundError:
        if not missing_ok:
            raise
    except OSError as exc:
        raise ResumeStorageError("Unable to delete resume") from exc


def stage_resume_deletion(relative_path: str) -> tuple[Path, Path]:
    """Atomically hide a file so database changes can still be rolled back."""

    original = resolve_resume_path(relative_path)
    staged = _safe_path(f".{uuid.uuid4().hex}.deleting")
    try:
        os.replace(original, staged)
    except OSError as exc:
        raise ResumeStorageError("Unable to delete resume") from exc
    return original, staged


def restore_staged_resume(original: Path, staged: Path) -> None:
    """Restore a staged file after a database transaction failure."""

    try:
        if staged.exists():
            os.replace(staged, original)
    except OSError:
        logger.exception("Could not restore staged resume after database rollback")


def finalize_staged_deletion(staged: Path) -> None:
    """Permanently remove a successfully staged file."""

    try:
        staged.unlink(missing_ok=True)
    except OSError as exc:
        raise ResumeStorageError("Unable to finalize resume deletion") from exc
