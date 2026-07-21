"""Safe PostgreSQL connectivity checks for health endpoints."""

import logging

from sqlalchemy import Engine, text
from sqlalchemy.exc import SQLAlchemyError

from app.database import engine

logger = logging.getLogger(__name__)


def is_database_connected(database_engine: Engine = engine) -> bool:
    """Return whether PostgreSQL responds without exposing connection details."""

    try:
        with database_engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return True
    except SQLAlchemyError as exc:
        logger.warning("Database health check failed: %s", exc.__class__.__name__)
        return False
