from __future__ import annotations

from typing import Any


def _row(cursor, row: tuple) -> dict[str, Any]:
    return dict(zip([d[0] for d in cursor.description], row))


def get_clinic_for_user(cursor, user_id: str) -> dict[str, Any] | None:
    cursor.execute(
        """
        SELECT c.id, c.clinic_name, c.email, c.status::text AS status
        FROM clinic_users cu
        JOIN clinics c ON c.id = cu.clinic_id
        WHERE cu.user_id = %s AND cu.is_active = TRUE AND c.status = 'active'
        LIMIT 1
        """,
        (user_id,),
    )
    row = cursor.fetchone()
    return _row(cursor, row) if row else None


def get_patient_clinic(cursor, user_id: str) -> dict[str, Any] | None:
    cursor.execute(
        """
        SELECT p.id AS patient_id, c.id AS clinic_id, c.clinic_name, c.status::text AS clinic_status
        FROM patients p
        JOIN clinics c ON c.id = p.clinic_id
        WHERE p.user_id = %s AND p.status = 'active' AND c.status = 'active'
        LIMIT 1
        """,
        (user_id,),
    )
    row = cursor.fetchone()
    return _row(cursor, row) if row else None
