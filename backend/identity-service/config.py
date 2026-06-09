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

OTP_EXPIRY_MINUTES = int(os.getenv("OTP_EXPIRY_MINUTES", "10"))
# How long (in minutes) a successful OTP verification keeps a login "trusted".
# Within this window, login skips OTP; once it elapses (or on first login),
# OTP verification is required again. Default 12000 min = 200 hours.
LOGIN_OTP_REVERIFY_MINUTES = int(os.getenv("LOGIN_OTP_REVERIFY_MINUTES", "12000"))
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
INVITE_EXPIRY_DAYS = int(os.getenv("INVITE_EXPIRY_DAYS", "7"))
# How long a set-password link (sent after admin approval) stays valid.
PASSWORD_SETUP_EXPIRY_HOURS = int(os.getenv("PASSWORD_SETUP_EXPIRY_HOURS", "48"))

ROLE_ALIASES: dict[str, list[str]] = {
    "doctor": ["clinic_owner", "clinic_staff"],
    "admin": ["admin", "super_admin"],
    "patient": ["patient"],
    "affiliate": ["affiliate"],
}
