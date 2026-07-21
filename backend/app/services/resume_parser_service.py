"""Safe text extraction and deterministic resume analysis."""

import re
import zipfile
from dataclasses import dataclass
from pathlib import Path
from xml.etree import ElementTree

from sqlalchemy import Engine, text

MAX_EXTRACTED_TEXT = 200_000
MAX_PDF_PAGES = 100
MAX_DOCX_UNCOMPRESSED_SIZE = 20 * 1024 * 1024

EMAIL_PATTERN = re.compile(r"(?<![\w.+-])[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}(?![\w.-])", re.IGNORECASE)
PHONE_PATTERN = re.compile(r"(?<!\d)(?:\+?91[\s.-]?)?(?:\(?\d{3,5}\)?[\s.-]?)?\d{3,5}[\s.-]?\d{4}(?!\d)")
NAME_PATTERN = re.compile(r"^[^\W\d_][^\d@:/]{1,148}$", re.UNICODE)

COMMON_SKILLS = (
    "Python", "Java", "JavaScript", "TypeScript", "React", "Angular", "Vue",
    "Node.js", "FastAPI", "Django", "Flask", "Spring Boot", "SQL", "PostgreSQL",
    "MySQL", "MongoDB", "Redis", "AWS", "Azure", "Google Cloud", "Docker",
    "Kubernetes", "Git", "Linux", "REST API", "GraphQL", "HTML", "CSS",
    "Tailwind CSS", "C", "C++", "C#", ".NET", "Go", "Rust", "TensorFlow",
    "PyTorch", "Pandas", "NumPy", "Machine Learning", "Data Analysis",
    "Power BI", "Tableau", "Figma", "Agile", "Scrum", "Jenkins", "Terraform",
)

SECTION_ALIASES = {
    "education": "education", "academic background": "education", "academics": "education",
    "experience": "experience", "work experience": "experience", "professional experience": "experience", "employment history": "experience",
    "projects": "projects", "project experience": "projects", "academic projects": "projects",
    "certifications": "certifications", "certificates": "certifications", "licenses & certifications": "certifications",
}


class ResumeParserError(RuntimeError):
    """Base class for controlled parser failures."""


class ParserDependencyError(ResumeParserError):
    """Raised when an optional parser package is unavailable."""


class UnreadableResumeError(ResumeParserError):
    """Raised for unsupported, encrypted, corrupt, or unreadable documents."""


class EmptyResumeTextError(ResumeParserError):
    """Raised when a valid document contains no extractable text."""


@dataclass(frozen=True)
class ParsedResume:
    """Internal parsing result persisted separately from manual candidate data."""

    full_text: str
    detected_name: str | None
    detected_email: str | None
    detected_phone: str | None
    detected_skills: list[str]
    detected_education: list[str]
    detected_experience: list[str]
    detected_projects: list[str]
    detected_certifications: list[str]


def ensure_resume_parser_columns(engine: Engine) -> None:
    """Add parser columns idempotently while preserving existing candidate rows."""

    statements = (
        "ALTER TABLE candidates ADD COLUMN IF NOT EXISTS resume_text TEXT",
        "ALTER TABLE candidates ADD COLUMN IF NOT EXISTS parsed_name VARCHAR(150)",
        "ALTER TABLE candidates ADD COLUMN IF NOT EXISTS parsed_email VARCHAR(320)",
        "ALTER TABLE candidates ADD COLUMN IF NOT EXISTS parsed_phone VARCHAR(50)",
        "ALTER TABLE candidates ADD COLUMN IF NOT EXISTS parsed_skills VARCHAR(200)[]",
        "ALTER TABLE candidates ADD COLUMN IF NOT EXISTS parsed_education TEXT[]",
        "ALTER TABLE candidates ADD COLUMN IF NOT EXISTS parsed_experience TEXT[]",
        "ALTER TABLE candidates ADD COLUMN IF NOT EXISTS parsed_projects TEXT[]",
        "ALTER TABLE candidates ADD COLUMN IF NOT EXISTS parsed_certifications TEXT[]",
        "ALTER TABLE candidates ADD COLUMN IF NOT EXISTS resume_parsed_at TIMESTAMP WITH TIME ZONE",
    )
    with engine.begin() as connection:
        for statement in statements:
            connection.execute(text(statement))


def normalize_whitespace(raw_text: str) -> str:
    """Normalize whitespace while retaining line boundaries used for sections."""

    lines: list[str] = []
    for raw_line in raw_text.replace("\x00", " ").replace("\r", "\n").split("\n"):
        line = " ".join(raw_line.split())
        if line and (not lines or line != lines[-1]):
            lines.append(line)
    return "\n".join(lines)[:MAX_EXTRACTED_TEXT]


def _extract_pdf(path: Path) -> str:
    try:
        from pypdf import PdfReader
        from pypdf.errors import PdfReadError
    except ImportError as exc:
        raise ParserDependencyError(
            "PDF parsing requires the pypdf package"
        ) from exc
    try:
        reader = PdfReader(path, strict=False)
        if reader.is_encrypted or len(reader.pages) > MAX_PDF_PAGES:
            raise UnreadableResumeError("Encrypted or oversized PDF is unsupported")
        return "\n".join((page.extract_text() or "") for page in reader.pages)
    except PdfReadError as exc:
        raise UnreadableResumeError("PDF document is unreadable") from exc
    except UnreadableResumeError:
        raise
    except Exception as exc:
        raise ResumeParserError("PDF text extraction failed") from exc


def _extract_docx(path: Path) -> str:
    """Read only WordprocessingML text; macros and embedded objects are ignored."""

    try:
        with zipfile.ZipFile(path) as archive:
            if sum(item.file_size for item in archive.infolist()) > MAX_DOCX_UNCOMPRESSED_SIZE:
                raise UnreadableResumeError("DOCX expands beyond the safe limit")
            xml_data = archive.read("word/document.xml")
        root = ElementTree.fromstring(xml_data)
    except (zipfile.BadZipFile, KeyError, ElementTree.ParseError, OSError) as exc:
        raise UnreadableResumeError("DOCX document is unreadable") from exc

    paragraphs: list[str] = []
    namespace = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"
    for paragraph in root.iter(f"{namespace}p"):
        value = "".join(node.text or "" for node in paragraph.iter(f"{namespace}t"))
        if value.strip():
            paragraphs.append(value)
    return "\n".join(paragraphs)


def extract_resume_text(path: Path) -> str:
    """Extract normalized text from one validated PDF or DOCX path."""

    extension = path.suffix.lower()
    if extension == ".pdf":
        raw_text = _extract_pdf(path)
    elif extension == ".docx":
        raw_text = _extract_docx(path)
    else:
        raise UnreadableResumeError("Unsupported resume format")
    normalized = normalize_whitespace(raw_text)
    if not normalized:
        raise EmptyResumeTextError("Resume contains no readable text")
    return normalized


def _detect_skills(full_text: str) -> list[str]:
    lowered = full_text.casefold()
    detected: list[str] = []
    for skill in COMMON_SKILLS:
        pattern = rf"(?<![\w]){re.escape(skill.casefold())}(?![\w])"
        if re.search(pattern, lowered) and skill.casefold() not in {x.casefold() for x in detected}:
            detected.append(skill)
    return detected


def _detect_name(full_text: str) -> str | None:
    """Conservatively detect a likely name near the top of the resume."""

    excluded = set(SECTION_ALIASES) | {
        "resume", "curriculum vitae", "cv", "profile", "summary", "objective",
        "skills", "technical skills", "contact", "contact details",
    }
    for line in full_text.splitlines()[:10]:
        value = line.strip(" ,|-\t")
        lowered = value.casefold()
        words = value.split()
        if (
            lowered in excluded
            or "http" in lowered
            or "linkedin" in lowered
            or EMAIL_PATTERN.search(value)
            or PHONE_PATTERN.search(value)
            or not 2 <= len(words) <= 5
            or not NAME_PATTERN.fullmatch(value)
            or not all(any(character.isalpha() for character in word) for word in words)
        ):
            continue
        return value
    return None

def _extract_sections(full_text: str) -> dict[str, list[str]]:
    sections = {name: [] for name in ("education", "experience", "projects", "certifications")}
    current: str | None = None
    for line in full_text.splitlines():
        heading = re.sub(r"[:\-\u2013\u2014]+$", "", line.strip()).casefold()
        if heading in SECTION_ALIASES:
            current = SECTION_ALIASES[heading]
            continue
        if current:
            sections[current].append(line)

    if not sections["education"]:
        education_terms = re.compile(r"\b(B\.?Tech|M\.?Tech|B\.?E\.?|M\.?E\.?|BCA|MCA|MBA|Ph\.?D|Bachelor|Master|University|College)\b", re.IGNORECASE)
        sections["education"] = [line for line in full_text.splitlines() if education_terms.search(line)][:10]
    return {key: values[:50] for key, values in sections.items()}


def parse_resume(path: Path) -> ParsedResume:
    """Extract text and deterministic structured signals from a resume."""

    full_text = extract_resume_text(path)
    email_match = EMAIL_PATTERN.search(full_text)
    phone_match = PHONE_PATTERN.search(full_text)
    sections = _extract_sections(full_text)
    return ParsedResume(
        full_text=full_text,
        detected_name=_detect_name(full_text),
        detected_email=email_match.group(0).lower() if email_match else None,
        detected_phone=phone_match.group(0).strip() if phone_match else None,
        detected_skills=_detect_skills(full_text),
        detected_education=sections["education"],
        detected_experience=sections["experience"],
        detected_projects=sections["projects"],
        detected_certifications=sections["certifications"],
    )

