"""FastAPI route modules package."""

from app.routers.auth import router as auth_router
from app.routers.jobs import router as jobs_router
from app.routers.resumes import router as resumes_router
from app.routers.candidates import router as candidates_router

__all__ = ["auth_router", "candidates_router", "jobs_router", "resumes_router"]
