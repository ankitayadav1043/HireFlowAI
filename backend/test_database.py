"""Command-line PostgreSQL connectivity test."""

from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from app.database import engine


def test_database_connection() -> bool:
    """Execute SELECT 1 and print a concise result."""

    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        print("Database connection successful")
        return True
    except SQLAlchemyError:
        print("Database connection failed")
        return False


if __name__ == "__main__":
    test_database_connection()
