import os
from pathlib import Path

from dotenv import load_dotenv

SERVICE_DIR = Path(__file__).resolve().parent
load_dotenv(SERVICE_DIR / ".env", override=True)

PORT = int(os.getenv("IDENTITY_SERVICE_PORT", "3001"))
JWT_SECRET = os.getenv("JWT_SECRET", "")
JWT_REFRESH_SECRET = os.getenv("JWT_REFRESH_SECRET", "")
JWT_EXPIRES_IN = os.getenv("JWT_EXPIRES_IN", "15m")
JWT_REFRESH_EXPIRES_IN = os.getenv("JWT_REFRESH_EXPIRES_IN", "7d")

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_EMAIL = os.getenv("SMTP_EMAIL", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM = os.getenv("SMTP_FROM", SMTP_EMAIL)

OTP_EXPIRY_MINUTES = int(os.getenv("OTP_EXPIRY_MINUTES", "10"))
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
INVITE_EXPIRY_DAYS = int(os.getenv("INVITE_EXPIRY_DAYS", "7"))

ROLE_ALIASES: dict[str, list[str]] = {
    "doctor": ["clinic_owner", "clinic_staff"],
    "admin": ["admin", "super_admin"],
    "patient": ["patient"],
    "affiliate": ["affiliate"],
}
