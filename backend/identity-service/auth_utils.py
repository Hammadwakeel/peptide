from __future__ import annotations

import hashlib
import re
import secrets
import string
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt

from config import (
    JWT_EXPIRES_IN,
    JWT_REFRESH_EXPIRES_IN,
    JWT_REFRESH_SECRET,
    JWT_SECRET,
    OTP_EXPIRY_MINUTES,
)


def _parse_duration(value: str) -> timedelta:
    match = re.fullmatch(r"(\d+)([smhd])", value.strip())
    if not match:
        return timedelta(minutes=15)
    amount, unit = int(match.group(1)), match.group(2)
    return {
        "s": timedelta(seconds=amount),
        "m": timedelta(minutes=amount),
        "h": timedelta(hours=amount),
        "d": timedelta(days=amount),
    }[unit]


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode(), password_hash.encode())


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def generate_otp() -> str:
    return f"{secrets.randbelow(1_000_000):06d}"


def generate_password(length: int = 12) -> str:
    alphabet = string.ascii_letters + string.digits + "!@#$%"
    return "".join(secrets.choice(alphabet) for _ in range(length))


def generate_invite_token() -> str:
    return secrets.token_urlsafe(32)


AFFILIATE_CODE_LENGTH = 8
AFFILIATE_CODE_ALPHABET = string.ascii_letters + string.digits + "-_!@#$*"
AFFILIATE_CODE_PATTERN = r"^[A-Za-z0-9\-_!@#$*]{8}$"


def generate_affiliate_code() -> str:
    """8-character code with letters, digits, and URL-safe symbols."""
    return "".join(
        secrets.choice(AFFILIATE_CODE_ALPHABET) for _ in range(AFFILIATE_CODE_LENGTH)
    )


def hash_otp(code: str) -> str:
    return hashlib.sha256(code.encode()).hexdigest()


def otp_expires_at() -> datetime:
    return datetime.now(timezone.utc) + timedelta(minutes=OTP_EXPIRY_MINUTES)


def create_access_token(user_id: str, email: str, role: str) -> str:
    expires = datetime.now(timezone.utc) + _parse_duration(JWT_EXPIRES_IN)
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "type": "access",
        "exp": expires,
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


def create_refresh_token(user_id: str, email: str, role: str) -> str:
    expires = datetime.now(timezone.utc) + _parse_duration(JWT_REFRESH_EXPIRES_IN)
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "type": "refresh",
        "exp": expires,
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, JWT_REFRESH_SECRET, algorithm="HS256")


def decode_access_token(token: str) -> dict:
    return jwt.decode(token, JWT_SECRET, algorithms=["HS256"])


def decode_refresh_token(token: str) -> dict:
    payload = jwt.decode(token, JWT_REFRESH_SECRET, algorithms=["HS256"])
    if payload.get("type") != "refresh":
        raise jwt.InvalidTokenError("Invalid refresh token type")
    return payload
