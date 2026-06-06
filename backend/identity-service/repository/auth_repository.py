from __future__ import annotations

from datetime import datetime
from typing import Any

from auth_utils import hash_otp, hash_token, otp_expires_at


def _row_to_dict(cursor, row: tuple) -> dict[str, Any]:
    columns = [desc[0] for desc in cursor.description]
    return dict(zip(columns, row))


def find_user_by_email(cursor, email: str) -> dict[str, Any] | None:
    cursor.execute(
        """
        SELECT id, email, password_hash, role::text AS role,
               status::text AS status, email_verified
        FROM users
        WHERE LOWER(email) = LOWER(%s)
        LIMIT 1
        """,
        (email,),
    )
    row = cursor.fetchone()
    return _row_to_dict(cursor, row) if row else None


def update_last_login(cursor, user_id: str) -> None:
    cursor.execute(
        "UPDATE users SET last_login_at = NOW() WHERE id = %s",
        (user_id,),
    )


def mark_email_verified(cursor, user_id: str) -> None:
    cursor.execute(
        "UPDATE users SET email_verified = TRUE, updated_at = NOW() WHERE id = %s",
        (user_id,),
    )


def invalidate_otp_codes(cursor, user_id: str) -> None:
    cursor.execute(
        """
        UPDATE otp_codes
        SET used_at = NOW()
        WHERE user_id = %s AND used_at IS NULL
        """,
        (user_id,),
    )


def create_otp_code(cursor, user_id: str, email: str, code: str) -> None:
    invalidate_otp_codes(cursor, user_id)
    cursor.execute(
        """
        INSERT INTO otp_codes (user_id, email, code_hash, expires_at)
        VALUES (%s, %s, %s, %s)
        """,
        (user_id, email.lower(), hash_otp(code), otp_expires_at()),
    )


def verify_otp_code(cursor, email: str, code: str) -> dict[str, Any] | None:
    cursor.execute(
        """
        SELECT oc.id, oc.user_id, u.email, u.role::text AS role
        FROM otp_codes oc
        JOIN users u ON u.id = oc.user_id
        WHERE LOWER(oc.email) = LOWER(%s)
          AND oc.code_hash = %s
          AND oc.used_at IS NULL
          AND oc.expires_at > NOW()
        ORDER BY oc.created_at DESC
        LIMIT 1
        """,
        (email, hash_otp(code)),
    )
    row = cursor.fetchone()
    if not row:
        return None

    record = _row_to_dict(cursor, row)
    cursor.execute(
        "UPDATE otp_codes SET used_at = NOW() WHERE id = %s",
        (record["id"],),
    )
    mark_email_verified(cursor, record["user_id"])
    return record


def save_refresh_session(
    cursor,
    user_id: str,
    refresh_token: str,
    expires_at: datetime,
) -> None:
    cursor.execute(
        """
        INSERT INTO sessions (user_id, token_hash, expires_at)
        VALUES (%s, %s, %s)
        """,
        (user_id, hash_token(refresh_token), expires_at),
    )


def find_valid_refresh_session(cursor, refresh_token: str) -> dict[str, Any] | None:
    cursor.execute(
        """
        SELECT s.id, s.user_id, u.email, u.role::text AS role
        FROM sessions s
        JOIN users u ON u.id = s.user_id
        WHERE s.token_hash = %s
          AND s.expires_at > NOW()
          AND u.status = 'active'
        LIMIT 1
        """,
        (hash_token(refresh_token),),
    )
    row = cursor.fetchone()
    return _row_to_dict(cursor, row) if row else None


def revoke_refresh_session(cursor, refresh_token: str) -> None:
    cursor.execute(
        "DELETE FROM sessions WHERE token_hash = %s",
        (hash_token(refresh_token),),
    )


def rotate_refresh_session(
    cursor,
    old_refresh_token: str,
    user_id: str,
    new_refresh_token: str,
    expires_at: datetime,
) -> None:
    revoke_refresh_session(cursor, old_refresh_token)
    save_refresh_session(cursor, user_id, new_refresh_token, expires_at)
