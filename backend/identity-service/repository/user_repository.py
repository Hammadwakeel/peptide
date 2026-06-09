from __future__ import annotations

from datetime import datetime
from typing import Any


def _row_to_dict(cursor, row: tuple) -> dict[str, Any]:
    columns = [desc[0] for desc in cursor.description]
    return dict(zip(columns, row))


def create_password_setup_token(
    cursor, user_id: str, token_hash: str, expires_at: datetime,
) -> None:
    """Store a one-time token used to let a user set their initial password."""
    cursor.execute(
        """
        INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
        VALUES (%s, %s, %s)
        """,
        (user_id, token_hash, expires_at),
    )


def create_user(cursor, email: str, password_hash: str, role: str, email_verified: bool = False) -> dict[str, Any]:
    cursor.execute(
        """
        INSERT INTO users (email, password_hash, role, status, email_verified)
        VALUES (%s, %s, %s::user_role, 'active', %s)
        RETURNING id, email, role::text AS role, status::text AS status, email_verified
        """,
        (email.lower(), password_hash, role, email_verified),
    )
    return _row_to_dict(cursor, cursor.fetchone())


def update_user_password(cursor, user_id: str, password_hash: str) -> None:
    cursor.execute(
        "UPDATE users SET password_hash = %s, updated_at = NOW() WHERE id = %s",
        (password_hash, user_id),
    )


def deactivate_user(cursor, user_id: str) -> None:
    cursor.execute(
        "UPDATE users SET status = 'inactive', updated_at = NOW() WHERE id = %s",
        (user_id,),
    )
    cursor.execute("DELETE FROM sessions WHERE user_id = %s", (user_id,))


def get_user_by_id(cursor, user_id: str) -> dict[str, Any] | None:
    cursor.execute(
        """
        SELECT id, email, role::text AS role, status::text AS status, email_verified, created_at
        FROM users WHERE id = %s LIMIT 1
        """,
        (user_id,),
    )
    row = cursor.fetchone()
    return _row_to_dict(cursor, row) if row else None


def create_affiliate(cursor, user_id: str, affiliate_code: str) -> dict[str, Any]:
    cursor.execute(
        """
        INSERT INTO affiliates (user_id, affiliate_code, status)
        VALUES (%s, %s, 'pending')
        RETURNING id, user_id, affiliate_code, status::text AS status
        """,
        (user_id, affiliate_code),
    )
    return _row_to_dict(cursor, cursor.fetchone())
