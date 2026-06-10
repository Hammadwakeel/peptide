import sys
from pathlib import Path

from dotenv import load_dotenv

SERVICE_DIR = Path(__file__).resolve().parent
COMMON_SERVICE_DIR = SERVICE_DIR.parent / "common-service"
load_dotenv(SERVICE_DIR / ".env", override=True)
load_dotenv(SERVICE_DIR.parent / ".env", override=False)
load_dotenv(COMMON_SERVICE_DIR / ".env", override=False)

sys.path.insert(0, str(COMMON_SERVICE_DIR))

from database import SessionLocal, close_connector, connect  # noqa: E402

__all__ = ["connect", "close_connector", "SessionLocal"]
