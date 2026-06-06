from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

from auth_utils import hash_token


def _row_to_dict(cursor, row: tuple) -> dict[str, Any]:
    columns = [desc[0] for desc in cursor.description]
    return dict(zip(columns, row))


def _rows_to_dicts(cursor, rows: list[tuple]) -> list[dict[str, Any]]:
    return [_row_to_dict(cursor, row) for row in rows]


def create_patient(cursor, data: dict) -> dict[str, Any]:
    cursor.execute(
        """
        INSERT INTO patients (clinic_id, first_name, last_name, email, phone, dob, status)
        VALUES (%s, %s, %s, %s, %s, %s, 'active')
        RETURNING id, clinic_id, first_name, last_name, email, phone, status::text AS status
        """,
        (
            data["clinic_id"],
            data["first_name"],
            data["last_name"],
            data["email"].lower(),
            data.get("phone"),
            data.get("dob"),
        ),
    )
    return _row_to_dict(cursor, cursor.fetchone())


def create_patient_invite(
    cursor,
    patient_id: str,
    clinic_id: str,
    doctor_id: str,
    email: str,
    raw_token: str,
    expires_days: int = 7,
) -> dict[str, Any]:
    expires_at = datetime.now(timezone.utc) + timedelta(days=expires_days)
    cursor.execute(
        """
        INSERT INTO patient_invites (patient_id, clinic_id, doctor_id, email, token_hash, expires_at)
        VALUES (%s, %s, %s, %s, %s, %s)
        RETURNING id, patient_id, clinic_id, doctor_id, email, status, expires_at
        """,
        (patient_id, clinic_id, doctor_id, email.lower(), hash_token(raw_token), expires_at),
    )
    return _row_to_dict(cursor, cursor.fetchone())


def find_valid_invite(cursor, token: str, doctor_id: str, email: str) -> dict[str, Any] | None:
    cursor.execute(
        """
        SELECT pi.id, pi.patient_id, pi.clinic_id, pi.doctor_id, pi.email,
               p.first_name, p.last_name, c.clinic_name
        FROM patient_invites pi
        JOIN patients p ON p.id = pi.patient_id
        JOIN clinics c ON c.id = pi.clinic_id
        WHERE pi.token_hash = %s
          AND pi.doctor_id = %s
          AND LOWER(pi.email) = LOWER(%s)
          AND pi.status = 'pending'
          AND pi.expires_at > NOW()
          AND p.user_id IS NULL
        LIMIT 1
        """,
        (hash_token(token), doctor_id, email),
    )
    row = cursor.fetchone()
    return _row_to_dict(cursor, row) if row else None


def accept_patient_invite(cursor, invite_id: str, user_id: str, patient_id: str) -> None:
    cursor.execute(
        "UPDATE patient_invites SET status = 'accepted', accepted_at = NOW() WHERE id = %s",
        (invite_id,),
    )
    cursor.execute(
        "UPDATE patients SET user_id = %s, email = (SELECT email FROM users WHERE id = %s), updated_at = NOW() WHERE id = %s",
        (user_id, user_id, patient_id),
    )


def count_patients_by_clinic(cursor, clinic_id: str) -> int:
    cursor.execute("SELECT COUNT(*) FROM patients WHERE clinic_id = %s", (clinic_id,))
    return cursor.fetchone()[0]


def list_patients_by_clinic(
    cursor, clinic_id: str, limit: int, offset: int,
) -> list[dict[str, Any]]:
    cursor.execute(
        """
        SELECT p.id, p.first_name, p.last_name, p.email, p.phone, p.dob,
               p.status::text AS status, p.user_id, p.created_at,
               u.email_verified
        FROM patients p
        LEFT JOIN users u ON u.id = p.user_id
        WHERE p.clinic_id = %s
        ORDER BY p.last_name, p.first_name
        LIMIT %s OFFSET %s
        """,
        (clinic_id, limit, offset),
    )
    return _rows_to_dicts(cursor, cursor.fetchall())


def list_patients_by_clinic_admin(
    cursor, clinic_id: str, limit: int, offset: int,
) -> list[dict[str, Any]]:
    return list_patients_by_clinic(cursor, clinic_id, limit, offset)


def get_patient_by_id(cursor, patient_id: str) -> dict[str, Any] | None:
    cursor.execute(
        """
        SELECT p.*, u.id AS user_account_id, u.email AS user_email, u.status::text AS user_status
        FROM patients p
        LEFT JOIN users u ON u.id = p.user_id
        WHERE p.id = %s
        LIMIT 1
        """,
        (patient_id,),
    )
    row = cursor.fetchone()
    return _row_to_dict(cursor, row) if row else None
