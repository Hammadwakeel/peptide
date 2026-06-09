import sys
from pathlib import Path

SERVICE_DIR = Path(__file__).resolve().parent
COMMON_SERVICE_DIR = SERVICE_DIR.parent / "common-service"
sys.path.insert(0, str(COMMON_SERVICE_DIR))

from database import SessionLocal, close_connector, connect  # noqa: E402

__all__ = ["connect", "close_connector", "SessionLocal"]
