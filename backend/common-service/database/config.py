import os
from pathlib import Path

from dotenv import load_dotenv

SERVICE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(SERVICE_DIR / ".env", override=True)

DATABASE_URL = os.getenv("DATABASE_URL", "")

SQL_ECHO = os.getenv("SQL_ECHO", "false").lower() == "true"
