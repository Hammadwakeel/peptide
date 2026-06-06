from __future__ import annotations

import re
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import HTTPException

from auth_utils import (
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
    generate_otp,
    verify_password,
)
from config import JWT_REFRESH_EXPIRES_IN, OTP_EXPIRY_MINUTES, ROLE_ALIASES
from db import connect
from email_service import send_otp_email
from repository import (
    create_otp_code,
    find_user_by_email,
    find_valid_refresh_session,
    rotate_refresh_session,
    save_refresh_session,
    update_last_login,
    verify_otp_code,
)
from schemas.auth import (
    LoginRequest,
    RefreshTokenRequest,
    SendOtpRequest,
    VerifyOtpRequest,
)


def _parse_refresh_expiry() -> datetime:
    match = re.fullmatch(r"(\d+)([smhd])", JWT_REFRESH_EXPIRES_IN.strip())
    if not match:
        return datetime.now(timezone.utc) + timedelta(days=7)
    amount, unit = int(match.group(1)), match.group(2)
    delta = {
        "s": timedelta(seconds=amount),
        "m": timedelta(minutes=amount),
        "h": timedelta(hours=amount),
        "d": timedelta(days=amount),
    }[unit]
    return datetime.now(timezone.utc) + delta


def _role_matches(requested_role: str, user_role: str) -> bool:
    allowed = ROLE_ALIASES.get(requested_role.lower(), [requested_role.lower()])
    return user_role.lower() in allowed


def _issue_tokens(cursor, user: dict) -> dict:
    access_token = create_access_token(str(user["id"]), user["email"], user["role"])
    refresh_token = create_refresh_token(str(user["id"]), user["email"], user["role"])
    save_refresh_session(
        cursor,
        str(user["id"]),
        refresh_token,
        _parse_refresh_expiry(),
    )
    update_last_login(cursor, str(user["id"]))
    return {
        "status": True,
        "token": access_token,
        "refresh_token": refresh_token,
        "user": {
            "id": str(user["id"]),
            "email": user["email"],
            "role": user["role"],
            "email_verified": user.get("email_verified", True),
        },
    }


def login(body: LoginRequest) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        user = find_user_by_email(cursor, body.email)
        if not user:
            raise HTTPException(status_code=401, detail="Invalid email or password")

        if user["status"] != "active":
            raise HTTPException(status_code=403, detail="Account is not active")

        if not _role_matches(body.role, user["role"]):
            raise HTTPException(status_code=403, detail="Role does not match this account")

        if not verify_password(body.password, user["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid email or password")

        if not user["email_verified"]:
            conn.commit()
            return {
                "status": False,
                "message": "OTP verification required",
                "email_verified": False,
            }

        result = _issue_tokens(cursor, user)
        conn.commit()
        return result

    except HTTPException:
        conn.rollback()
        raise
    except Exception as exc:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    finally:
        cursor.close()
        conn.close()


def send_otp(body: SendOtpRequest) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        user = find_user_by_email(cursor, body.email)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        if user["status"] != "active":
            raise HTTPException(status_code=403, detail="Account is not active")

        otp_code = generate_otp()
        create_otp_code(cursor, str(user["id"]), body.email, otp_code)
        conn.commit()

        send_otp_email(body.email, otp_code)

        return {
            "status": True,
            "message": "OTP sent successfully",
            "email": body.email,
            "expires_in_minutes": OTP_EXPIRY_MINUTES,
        }

    except HTTPException:
        conn.rollback()
        raise
    except Exception as exc:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to send OTP: {exc}") from exc
    finally:
        cursor.close()
        conn.close()


def verify_otp(body: VerifyOtpRequest) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        record = verify_otp_code(cursor, body.email, body.otp)
        if not record:
            raise HTTPException(status_code=400, detail="Invalid or expired OTP")

        user = find_user_by_email(cursor, body.email)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        conn.commit()
        return {
            "status": True,
            "message": "OTP verified successfully",
            "email_verified": True,
            "user": {
                "id": str(user["id"]),
                "email": user["email"],
                "role": user["role"],
            },
        }

    except HTTPException:
        conn.rollback()
        raise
    except Exception as exc:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    finally:
        cursor.close()
        conn.close()


def refresh_token(body: RefreshTokenRequest) -> dict:
    conn = connect()
    cursor = conn.cursor()
    try:
        try:
            payload = decode_refresh_token(body.refresh_token)
        except jwt.ExpiredSignatureError as exc:
            raise HTTPException(status_code=401, detail="Refresh token expired") from exc
        except jwt.InvalidTokenError as exc:
            raise HTTPException(status_code=401, detail="Invalid refresh token") from exc

        session = find_valid_refresh_session(cursor, body.refresh_token)
        if not session:
            raise HTTPException(status_code=401, detail="Refresh token revoked or invalid")

        user_id = str(session["user_id"])
        if user_id != str(payload["sub"]):
            raise HTTPException(status_code=401, detail="Refresh token mismatch")

        new_access = create_access_token(user_id, session["email"], session["role"])
        new_refresh = create_refresh_token(user_id, session["email"], session["role"])
        rotate_refresh_session(
            cursor,
            body.refresh_token,
            user_id,
            new_refresh,
            _parse_refresh_expiry(),
        )
        conn.commit()

        return {
            "status": True,
            "token": new_access,
            "refresh_token": new_refresh,
        }

    except HTTPException:
        conn.rollback()
        raise
    except Exception as exc:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    finally:
        cursor.close()
        conn.close()
