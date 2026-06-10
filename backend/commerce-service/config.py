import os
from pathlib import Path

from dotenv import load_dotenv

SERVICE_DIR = Path(__file__).resolve().parent
load_dotenv(SERVICE_DIR / ".env", override=True)

PORT = int(os.getenv("COMMERCE_SERVICE_PORT", "3002"))
JWT_SECRET = os.getenv("JWT_SECRET", "")

FEDEX_CLIENT_ID = os.getenv("FEDEX_CLIENT_ID", "")
FEDEX_CLIENT_SECRET = os.getenv("FEDEX_CLIENT_SECRET", "")
FEDEX_ACCOUNT_NUMBER = os.getenv("FEDEX_ACCOUNT_NUMBER", "")
FEDEX_SANDBOX = os.getenv("FEDEX_SANDBOX", "true").lower() in ("1", "true", "yes")
FEDEX_SERVICE_TYPE = os.getenv("FEDEX_SERVICE_TYPE", "FEDEX_GROUND")
FEDEX_DEFAULT_WEIGHT_LB = float(os.getenv("FEDEX_DEFAULT_WEIGHT_LB", "1.0"))
