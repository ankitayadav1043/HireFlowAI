"""Typed application configuration loaded from environment variables."""

from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    """Validated runtime settings loaded from the backend environment file."""

    app_name: str = "HireFlow AI"
    app_env: Literal["development", "testing", "staging", "production"] = "development"
    database_url: str = "postgresql://postgres:password@localhost:5432/hireflow_ai"
    secret_key: str = "replace-with-a-secure-secret-key"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = Field(default=60, gt=0)
    frontend_url: str = "http://localhost:5173"
    database_pool_size: int = Field(default=5, gt=0)
    database_max_overflow: int = Field(default=10, ge=0)
    database_pool_timeout: int = Field(default=30, gt=0)
    database_pool_recycle: int = Field(default=1800, gt=0)

    model_config = SettingsConfigDict(
        env_file=BACKEND_DIR / ".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    """Return one cached, validated settings instance per process."""

    return Settings()


settings = get_settings()
