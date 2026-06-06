"""Shared Cloud SQL connection for all nano services."""

from __future__ import annotations

import os
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from google.cloud.sql.connector import Connector
from google.oauth2 import service_account

DATABASE_DIR = Path(__file__).resolve().parent
load_dotenv(DATABASE_DIR / ".env")

CLOUD_SQL_INSTANCE = os.getenv(
    "CLOUD_SQL_INSTANCE",
    "glowing-arcadia-498617-m2:us-central1:frontier123",
)
DB_USER = os.getenv("DB_USER", "12frontier1")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "sql-data")
CREDENTIALS_FILE = os.getenv(
    "GOOGLE_APPLICATION_CREDENTIALS",
    str(DATABASE_DIR / "glowing-arcadia-498617-m2-6d3f6b6c73ca.json"),
)

_connector: Connector | None = None


def get_connector() -> Connector:
    global _connector
    if _connector is None:
        credentials = service_account.Credentials.from_service_account_file(
            CREDENTIALS_FILE
        )
        _connector = Connector(credentials=credentials)
    return _connector


def connect() -> Any:
    """Return a pg8000 connection to the shared PostgreSQL database."""
    connector = get_connector()
    return connector.connect(
        CLOUD_SQL_INSTANCE,
        "pg8000",
        user=DB_USER,
        password=DB_PASSWORD,
        db=DB_NAME,
    )


def close_connector() -> None:
    global _connector
    if _connector is not None:
        _connector.close()
        _connector = None
