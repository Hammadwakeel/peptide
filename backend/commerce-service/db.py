import sys
from pathlib import Path

from dotenv import load_dotenv

SERVICE_DIR = Path(__file__).resolve().parent
load_dotenv(SERVICE_DIR / ".env", override=True)

sys.path.insert(0, str(SERVICE_DIR.parent / "database"))
from connection import close_connector, connect  # noqa: E402

__all__ = ["connect", "close_connector"]
