"""FastAPI application entry point."""

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.database import Base, engine
from app.models.candidate import Candidate
from app.models.job import Job
from app.models.user import User
from app.routers.auth import router as auth_router
from app.routers.jobs import router as jobs_router
from app.routers.candidates import router as candidates_router
from app.utils.database_health import is_database_connected


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    """Create only the explicitly supported application tables."""

    Base.metadata.create_all(
        bind=engine,
        tables=[User.__table__, Job.__table__, Candidate.__table__],
        checkfirst=True,
    )
    yield


app = FastAPI(
    title=f"{settings.app_name} Backend",
    version="1.0.0",
    description="REST API for the HireFlow AI recruitment platform.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(jobs_router)
app.include_router(candidates_router)


@app.get("/", tags=["System"])
async def root() -> dict[str, str]:
    """Confirm that the backend application is running."""

    return {
        "message": "HireFlow AI Backend is running",
        "status": "success",
    }


@app.get(
    "/health",
    tags=["System"],
    responses={status.HTTP_503_SERVICE_UNAVAILABLE: {"description": "Database unavailable"}},
)
def health_check() -> JSONResponse:
    """Report application and PostgreSQL readiness."""

    if not is_database_connected():
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"status": "unhealthy", "database": "disconnected"},
        )

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={"status": "healthy", "database": "connected"},
    )
