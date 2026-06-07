import os
from pathlib import Path

from dotenv import load_dotenv

SERVICE_DIR = Path(__file__).resolve().parent
BACKEND_DIR = SERVICE_DIR.parent
load_dotenv(SERVICE_DIR / ".env", override=True)

GCS_CREDENTIALS_PATH = os.getenv(
    "GCS_CREDENTIALS_PATH",
    str(BACKEND_DIR / "gcp-storage.json"),
)
GCS_BUCKET_NAME = os.getenv("GCS_BUCKET_NAME", "nexus-docs")
GCS_USE_OBJECT_ACL = os.getenv("GCS_USE_OBJECT_ACL", "false").lower() == "true"

PORT = int(os.getenv("COMMERCE_SERVICE_PORT", "3002"))
JWT_SECRET = os.getenv("JWT_SECRET", "")
