import os
from pathlib import Path

from dotenv import load_dotenv

SERVICE_DIR = Path(__file__).resolve().parent
load_dotenv(SERVICE_DIR / ".env", override=True)

PORT = int(os.getenv("COMMERCE_SERVICE_PORT", "3002"))
JWT_SECRET = os.getenv("JWT_SECRET", "")
