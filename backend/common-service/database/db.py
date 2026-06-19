import os
from collections.abc import Generator
from typing import Any

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from .config import DATABASE_URL, SQL_ECHO

POOL_SIZE = int(os.getenv("DB_POOL_SIZE", "10"))
MAX_OVERFLOW = int(os.getenv("DB_MAX_OVERFLOW", "20"))
POOL_RECYCLE = int(os.getenv("DB_POOL_RECYCLE", "3600"))

engine = create_engine(
    DATABASE_URL,
    echo=SQL_ECHO,
    pool_pre_ping=True,
    pool_size=POOL_SIZE,
    max_overflow=MAX_OVERFLOW,
    pool_recycle=POOL_RECYCLE,
)

SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


def get_db() -> Generator[Session, None, None]:
    """Yield an ORM session and ensure it is closed afterwards."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def connect() -> Any:
    """Return a raw pooled DB-API (psycopg) connection.

    Lets cursor/SQL-based services share the same connection pool and
    database as the ORM layer. Callers manage commit/rollback/close.
    """
    return engine.raw_connection()


def close_connector() -> None:
    """Dispose the engine and close all pooled connections."""
    engine.dispose()
