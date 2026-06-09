from __future__ import annotations

import sys
from datetime import datetime, timezone
from pathlib import Path

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from auth_utils import hash_otp, hash_token, otp_expires_at

# Reuse the SQLAlchemy models/enums defined in common-service so identity-service
# talks to the exact same schema and connection pool.
COMMON_SERVICE_DIR = Path(__file__).resolve().parent.parent.parent / "common-service"
if str(COMMON_SERVICE_DIR) not in sys.path:
    sys.path.insert(0, str(COMMON_SERVICE_DIR))

from database.enums import AccountStatus, UserRole  # noqa: E402
from database.models import (  # noqa: E402
    OtpCode,
    PasswordResetToken,
    Session as RefreshSession,
    User,
)
from database.models.clinic import Affiliate  # noqa: E402


def find_user_by_email(db: Session, email: str) -> User | None:
    return db.execute(
        select(User).where(func.lower(User.email) == email.lower()).limit(1)
    ).scalar_one_or_none()


def create_user(
    db: Session,
    email: str,
    password_hash: str,
    role: str,
    *,
    email_verified: bool = False,
) -> User:
    user = User(
        email=email.lower(),
        password_hash=password_hash,
        role=UserRole(role),
        status=AccountStatus.active,
        email_verified=email_verified,
    )
    db.add(user)
    db.flush()
    return user


def update_last_login(db: Session, user_id: str) -> None:
    user = db.get(User, user_id)
    if user is not None:
        user.last_login_at = func.now()


def mark_email_verified(db: Session, user_id: str) -> None:
    user = db.get(User, user_id)
    if user is not None:
        user.email_verified = True


def invalidate_otp_codes(db: Session, user_id: str) -> None:
    codes = db.execute(
        select(OtpCode).where(OtpCode.user_id == user_id, OtpCode.used_at.is_(None))
    ).scalars()
    for code in codes:
        code.used_at = datetime.now(timezone.utc)


def create_otp_code(db: Session, user_id: str, email: str, code: str) -> None:
    invalidate_otp_codes(db, user_id)
    db.add(
        OtpCode(
            user_id=user_id,
            email=email.lower(),
            code_hash=hash_otp(code),
            expires_at=otp_expires_at(),
        )
    )


def verify_otp_code(db: Session, email: str, code: str) -> dict | None:
    otp = db.execute(
        select(OtpCode)
        .where(
            func.lower(OtpCode.email) == email.lower(),
            OtpCode.code_hash == hash_otp(code),
            OtpCode.used_at.is_(None),
            OtpCode.expires_at > func.now(),
        )
        .order_by(OtpCode.created_at.desc())
        .limit(1)
    ).scalar_one_or_none()
    if otp is None:
        return None

    otp.used_at = datetime.now(timezone.utc)
    user = db.get(User, otp.user_id)
    if user is not None:
        user.email_verified = True
        user.last_otp_verified_at = datetime.now(timezone.utc)

    return {
        "id": str(otp.id),
        "user_id": str(otp.user_id),
        "email": user.email if user else otp.email,
        "role": user.role.value if user else None,
    }


def save_refresh_session(
    db: Session,
    user_id: str,
    refresh_token: str,
    expires_at: datetime,
) -> None:
    db.add(
        RefreshSession(
            user_id=user_id,
            token_hash=hash_token(refresh_token),
            expires_at=expires_at,
        )
    )


def find_valid_refresh_session(db: Session, refresh_token: str) -> dict | None:
    row = db.execute(
        select(RefreshSession, User)
        .join(User, User.id == RefreshSession.user_id)
        .where(
            RefreshSession.token_hash == hash_token(refresh_token),
            RefreshSession.expires_at > func.now(),
            User.status == AccountStatus.active,
        )
        .limit(1)
    ).first()
    if row is None:
        return None

    session_obj, user = row
    return {
        "id": str(session_obj.id),
        "user_id": str(user.id),
        "email": user.email,
        "role": user.role.value,
    }


def revoke_refresh_session(db: Session, refresh_token: str) -> None:
    token_hash = hash_token(refresh_token)
    for session_obj in db.execute(
        select(RefreshSession).where(RefreshSession.token_hash == token_hash)
    ).scalars():
        db.delete(session_obj)


def rotate_refresh_session(
    db: Session,
    old_refresh_token: str,
    user_id: str,
    new_refresh_token: str,
    expires_at: datetime,
) -> None:
    revoke_refresh_session(db, old_refresh_token)
    save_refresh_session(db, user_id, new_refresh_token, expires_at)


def describe_reset_token(db: Session, raw_token: str) -> dict:
    """Return the status of a set-password link for the frontend to display."""
    record = lookup_reset_token(db, raw_token)
    if record is None:
        return {
            "status": False,
            "token_status": "invalid",
            "message": "This link is invalid. Please request a new one.",
        }

    user = db.get(User, record.user_id)
    email = user.email if user else None

    if record.used_at is not None:
        return {
            "status": False,
            "token_status": "already_used",
            "message": "Your password has already been set. Please log in with your email and password.",
            "email": email,
        }

    expires = record.expires_at
    if expires.tzinfo is None:
        expires = expires.replace(tzinfo=timezone.utc)
    if expires <= datetime.now(timezone.utc):
        return {
            "status": False,
            "token_status": "expired",
            "message": "This link has expired. Please contact support for a new link.",
            "email": email,
        }

    return {
        "status": True,
        "token_status": "valid",
        "message": "You can set your password.",
        "email": email,
    }


def lookup_reset_token(db: Session, raw_token: str) -> PasswordResetToken | None:
    """Find a password-setup/reset token by its raw value (any status)."""
    return db.execute(
        select(PasswordResetToken)
        .where(PasswordResetToken.token_hash == hash_token(raw_token))
        .limit(1)
    ).scalar_one_or_none()


def find_valid_reset_token(db: Session, raw_token: str) -> PasswordResetToken | None:
    """Return an unused, unexpired password-setup/reset token, or None."""
    return db.execute(
        select(PasswordResetToken)
        .where(
            PasswordResetToken.token_hash == hash_token(raw_token),
            PasswordResetToken.used_at.is_(None),
            PasswordResetToken.expires_at > func.now(),
        )
        .limit(1)
    ).scalar_one_or_none()


def consume_reset_token(db: Session, token: PasswordResetToken, password_hash: str) -> User | None:
    """Apply a new password using a valid token, then mark the token used.

    Also verifies the email (the link proves ownership) and opens the OTP
    trusted window so the user can log in immediately after setting a password.
    """
    user = db.get(User, token.user_id)
    if user is None:
        return None
    now = datetime.now(timezone.utc)
    user.password_hash = password_hash
    user.email_verified = True
    user.last_otp_verified_at = now
    user.status = AccountStatus.active
    token.used_at = now

    if user.role == UserRole.affiliate:
        affiliate = db.execute(
            select(Affiliate).where(Affiliate.user_id == user.id).limit(1)
        ).scalar_one_or_none()
        if affiliate is not None and affiliate.status != AccountStatus.active:
            affiliate.status = AccountStatus.active

    return user
