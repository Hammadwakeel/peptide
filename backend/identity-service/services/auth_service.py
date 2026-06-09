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
    hash_password,
    verify_password,
)
from config import (
    FRONTEND_URL,
    JWT_REFRESH_EXPIRES_IN,
    LOGIN_OTP_REVERIFY_MINUTES,
    OTP_EXPIRY_MINUTES,
    ROLE_ALIASES,
)
from db import SessionLocal
from email_service import send_otp_email
from repository import (
    consume_reset_token,
    create_otp_code,
    create_user,
    describe_reset_token,
    find_user_by_email,
    find_valid_refresh_session,
    lookup_reset_token,
    rotate_refresh_session,
    save_refresh_session,
    update_last_login,
    verify_otp_code,
)
from schemas.auth import (
    CreateAdminRequest,
    LoginRequest,
    RefreshTokenRequest,
    SendOtpRequest,
    SetPasswordRequest,
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


def _needs_otp_verification(user) -> bool:
    """OTP is required on first login, when the email is unverified, or once the
    trusted window (LOGIN_OTP_REVERIFY_MINUTES) has elapsed since the *last OTP
    verification*. This is intentionally independent of last_login_at, which is
    bumped on every login and would otherwise keep resetting the window."""
    if not user.email_verified or user.last_otp_verified_at is None:
        return True
    last_verified = user.last_otp_verified_at
    if last_verified.tzinfo is None:
        last_verified = last_verified.replace(tzinfo=timezone.utc)
    elapsed = datetime.now(timezone.utc) - last_verified
    return elapsed >= timedelta(minutes=LOGIN_OTP_REVERIFY_MINUTES)


def _issue_tokens(db, user) -> dict:
    user_id = str(user.id)
    role = user.role.value
    access_token = create_access_token(user_id, user.email, role)
    refresh_token = create_refresh_token(user_id, user.email, role)
    save_refresh_session(db, user_id, refresh_token, _parse_refresh_expiry())
    update_last_login(db, user_id)
    return {
        "status": True,
        "token": access_token,
        "refresh_token": refresh_token,
        "user": {
            "id": user_id,
            "email": user.email,
            "role": role,
            "email_verified": user.email_verified,
        },
    }


def create_admin(body: CreateAdminRequest) -> dict:
    db = SessionLocal()
    try:
        if find_user_by_email(db, body.email):
            raise HTTPException(status_code=409, detail="Email already registered")

        user = create_user(
            db,
            body.email,
            hash_password(body.password),
            "admin",
            email_verified=True,
        )
        db.flush()
        result = {
            "status": True,
            "message": "Admin account created. You can now log in to the admin panel.",
            "user": {
                "id": str(user.id),
                "email": user.email,
                "role": user.role.value,
            },
        }
        db.commit()
        return result

    except HTTPException:
        db.rollback()
        raise
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    finally:
        db.close()


def login(body: LoginRequest) -> dict:
    db = SessionLocal()
    try:
        user = find_user_by_email(db, body.email)
        if not user:
            raise HTTPException(status_code=401, detail="Invalid email or password")

        if user.status.value != "active":
            raise HTTPException(status_code=403, detail="Account is not active")

        if not _role_matches(body.role, user.role.value):
            raise HTTPException(status_code=403, detail="Role does not match this account")

        if not verify_password(body.password, user.password_hash):
            raise HTTPException(status_code=401, detail="Invalid email or password")

        if _needs_otp_verification(user):
            db.commit()
            return {
                "status": False,
                "message": "OTP verification required",
                "email_verified": user.email_verified,
            }

        result = _issue_tokens(db, user)
        db.commit()
        return result

    except HTTPException:
        db.rollback()
        raise
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    finally:
        db.close()


def send_otp(body: SendOtpRequest) -> dict:
    db = SessionLocal()
    try:
        user = find_user_by_email(db, body.email)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        if user.status.value != "active":
            raise HTTPException(status_code=403, detail="Account is not active")

        otp_code = generate_otp()
        create_otp_code(db, str(user.id), body.email, otp_code)
        db.commit()

        send_otp_email(body.email, otp_code)

        return {
            "status": True,
            "message": "OTP sent successfully",
            "email": body.email,
            "expires_in_minutes": OTP_EXPIRY_MINUTES,
        }

    except HTTPException:
        db.rollback()
        raise
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to send OTP: {exc}") from exc
    finally:
        db.close()


def verify_otp(body: VerifyOtpRequest) -> dict:
    db = SessionLocal()
    try:
        record = verify_otp_code(db, body.email, body.otp)
        if not record:
            raise HTTPException(status_code=400, detail="Invalid or expired OTP")

        user = find_user_by_email(db, body.email)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # last_otp_verified_at is set inside verify_otp_code (starts the trusted
        # window); issue login tokens so the client is logged in right away.
        result = _issue_tokens(db, user)
        result["message"] = "OTP verified successfully"
        result["user"]["email_verified"] = True
        db.commit()
        return result

    except HTTPException:
        db.rollback()
        raise
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    finally:
        db.close()


def _token_expired(expires_at: datetime) -> bool:
    expires = expires_at
    if expires.tzinfo is None:
        expires = expires.replace(tzinfo=timezone.utc)
    return expires <= datetime.now(timezone.utc)


def check_set_password_token(token: str) -> dict:
    """Validate a set-password link before showing the password form."""
    db = SessionLocal()
    try:
        result = describe_reset_token(db, token)
        if result.get("token_status") == "already_used":
            result["login_url"] = f"{FRONTEND_URL}/login"
        return result
    finally:
        db.close()


def set_password(body: SetPasswordRequest) -> dict:
    db = SessionLocal()
    try:
        record = lookup_reset_token(db, body.token)
        if record is None:
            raise HTTPException(status_code=400, detail="Invalid link")

        if record.used_at is not None:
            raise HTTPException(
                status_code=409,
                detail="Your password has already been set. Please log in with your email and password.",
            )

        if _token_expired(record.expires_at):
            raise HTTPException(status_code=400, detail="This link has expired. Please request a new one.")

        user = consume_reset_token(db, record, hash_password(body.new_password))
        if user is None:
            raise HTTPException(status_code=404, detail="Account not found")

        result = {
            "status": True,
            "message": "Password set successfully. You can now log in.",
            "login_url": f"{FRONTEND_URL}/login",
            "user": {
                "id": str(user.id),
                "email": user.email,
                "role": user.role.value,
            },
        }
        db.commit()
        return result

    except HTTPException:
        db.rollback()
        raise
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    finally:
        db.close()


def refresh_token(body: RefreshTokenRequest) -> dict:
    db = SessionLocal()
    try:
        try:
            payload = decode_refresh_token(body.refresh_token)
        except jwt.ExpiredSignatureError as exc:
            raise HTTPException(status_code=401, detail="Refresh token expired") from exc
        except jwt.InvalidTokenError as exc:
            raise HTTPException(status_code=401, detail="Invalid refresh token") from exc

        session = find_valid_refresh_session(db, body.refresh_token)
        if not session:
            raise HTTPException(status_code=401, detail="Refresh token revoked or invalid")

        user_id = str(session["user_id"])
        if user_id != str(payload["sub"]):
            raise HTTPException(status_code=401, detail="Refresh token mismatch")

        new_access = create_access_token(user_id, session["email"], session["role"])
        new_refresh = create_refresh_token(user_id, session["email"], session["role"])
        rotate_refresh_session(
            db,
            body.refresh_token,
            user_id,
            new_refresh,
            _parse_refresh_expiry(),
        )
        db.commit()

        return {
            "status": True,
            "token": new_access,
            "refresh_token": new_refresh,
        }

    except HTTPException:
        db.rollback()
        raise
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    finally:
        db.close()
