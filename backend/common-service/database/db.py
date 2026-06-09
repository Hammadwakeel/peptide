from collections.abc import Generator
from typing import Any

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from .config import DATABASE_URL, SQL_ECHO

engine = create_engine(DATABASE_URL, echo=SQL_ECHO, pool_pre_ping=True)

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
