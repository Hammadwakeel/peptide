from __future__ import annotations

from typing import Any


def _row_to_dict(cursor, row: tuple) -> dict[str, Any]:
    columns = [desc[0] for desc in cursor.description]
    return dict(zip(columns, row))


def get_patient_by_user_id(cursor, user_id: str) -> dict[str, Any] | None:
    cursor.execute(
        """
        SELECT p.id, p.clinic_id, p.first_name, p.last_name, p.email, p.user_id, p.status::text AS status
        FROM patients p
        WHERE p.user_id = %s
        LIMIT 1
        """,
        (user_id,),
    )
    row = cursor.fetchone()
    return _row_to_dict(cursor, row) if row else None


def get_patient_by_id(cursor, patient_id: str) -> dict[str, Any] | None:
    cursor.execute(
        """
        SELECT p.id, p.clinic_id, p.first_name, p.last_name, p.email, p.user_id, p.status::text AS status
        FROM patients p
        WHERE p.id = %s
        LIMIT 1
        """,
        (patient_id,),
    )
    row = cursor.fetchone()
    return _row_to_dict(cursor, row) if row else None


def get_doctor_clinic(cursor, user_id: str) -> dict[str, Any] | None:
    cursor.execute(
        """
        SELECT c.id, c.clinic_name, c.email, c.status::text AS status, cu.access_level
        FROM clinic_users cu
        JOIN clinics c ON c.id = cu.clinic_id
        WHERE cu.user_id = %s AND cu.is_active = TRUE
        LIMIT 1
        """,
        (user_id,),
    )
    row = cursor.fetchone()
    return _row_to_dict(cursor, row) if row else None


def get_doctor_profile(cursor, user_id: str) -> dict[str, Any] | None:
    cursor.execute(
        """
        SELECT u.id, u.email
        FROM users u
        WHERE u.id = %s
        LIMIT 1
        """,
        (user_id,),
    )
    row = cursor.fetchone()
    return _row_to_dict(cursor, row) if row else None


def get_patient_doctor_id(cursor, patient_id: str, clinic_id: str) -> str | None:
    """Resolve the clinic physician for a patient (clinic owner/staff user id)."""
    cursor.execute(
        """
        SELECT cu.user_id
        FROM clinic_users cu
        WHERE cu.clinic_id = %s AND cu.is_active = TRUE
        ORDER BY
          CASE cu.access_level
            WHEN 'owner' THEN 0
            WHEN 'admin' THEN 1
            ELSE 2
          END,
          cu.created_at ASC
        LIMIT 1
        """,
        (clinic_id,),
    )
    row = cursor.fetchone()
    return str(row[0]) if row else None


def patient_belongs_to_clinic(cursor, patient_id: str, clinic_id: str) -> bool:
    cursor.execute(
        "SELECT 1 FROM patients WHERE id = %s AND clinic_id = %s LIMIT 1",
        (patient_id, clinic_id),
    )
    return cursor.fetchone() is not None
