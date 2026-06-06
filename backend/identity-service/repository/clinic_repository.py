from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

from auth_utils import hash_token


def _row_to_dict(cursor, row: tuple) -> dict[str, Any]:
    columns = [desc[0] for desc in cursor.description]
    return dict(zip(columns, row))


def _rows_to_dicts(cursor, rows: list[tuple]) -> list[dict[str, Any]]:
    return [_row_to_dict(cursor, row) for row in rows]


def find_clinic_by_email(cursor, email: str) -> dict[str, Any] | None:
    cursor.execute(
        "SELECT * FROM clinics WHERE LOWER(email) = LOWER(%s) LIMIT 1",
        (email,),
    )
    row = cursor.fetchone()
    return _row_to_dict(cursor, row) if row else None


def create_clinic_application(cursor, data: dict) -> dict[str, Any]:
    cursor.execute(
        """
        INSERT INTO clinics (clinic_name, email, phone, npi_number, dea_number, status, affiliate_id)
        VALUES (%s, %s, %s, %s, %s, 'pending', %s)
        RETURNING id, clinic_name, email, status::text AS status, created_at
        """,
        (
            data["clinic_name"],
            data["email"].lower(),
            data.get("phone"),
            data.get("npi_number"),
            data.get("dea_number"),
            data.get("affiliate_id"),
        ),
    )
    clinic = _row_to_dict(cursor, cursor.fetchone())
    cursor.execute(
        """
        INSERT INTO clinic_addresses (clinic_id, address1, address2, city, state, zip, country)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """,
        (
            clinic["id"],
            data["address1"],
            data.get("address2"),
            data["city"],
            data["state"],
            data["zip"],
            data.get("country", "US"),
        ),
    )
    return clinic


def count_pending_clinics(cursor) -> int:
    cursor.execute("SELECT COUNT(*) FROM clinics WHERE status = 'pending'")
    return cursor.fetchone()[0]


def list_pending_clinics(cursor, limit: int, offset: int) -> list[dict[str, Any]]:
    cursor.execute(
        """
        SELECT c.id, c.clinic_name, c.email, c.phone, c.npi_number, c.dea_number,
               c.status::text AS status, c.created_at, c.affiliate_id,
               ca.address1, ca.city, ca.state, ca.zip,
               a.affiliate_code, a.affiliate_type::text AS affiliate_type
        FROM clinics c
        LEFT JOIN clinic_addresses ca ON ca.clinic_id = c.id AND ca.is_primary = TRUE
        LEFT JOIN affiliates a ON a.id = c.affiliate_id
        WHERE c.status = 'pending'
        ORDER BY c.created_at ASC
        LIMIT %s OFFSET %s
        """,
        (limit, offset),
    )
    return _rows_to_dicts(cursor, cursor.fetchall())


def count_all_clinics(cursor) -> int:
    cursor.execute("SELECT COUNT(*) FROM clinics")
    return cursor.fetchone()[0]


def list_all_clinics(cursor, limit: int, offset: int) -> list[dict[str, Any]]:
    cursor.execute(
        """
        SELECT c.id, c.clinic_name, c.email, c.phone, c.npi_number, c.dea_number,
               c.status::text AS status, c.created_at, c.affiliate_id,
               COUNT(DISTINCT p.id) AS patient_count,
               COUNT(DISTINCT cu.user_id) AS staff_count,
               a.affiliate_code, a.affiliate_type::text AS affiliate_type
        FROM clinics c
        LEFT JOIN patients p ON p.clinic_id = c.id
        LEFT JOIN clinic_users cu ON cu.clinic_id = c.id
        LEFT JOIN affiliates a ON a.id = c.affiliate_id
        GROUP BY c.id, a.affiliate_code, a.affiliate_type
        ORDER BY c.created_at DESC
        LIMIT %s OFFSET %s
        """,
        (limit, offset),
    )
    return _rows_to_dicts(cursor, cursor.fetchall())


def get_clinic_by_id(cursor, clinic_id: str) -> dict[str, Any] | None:
    cursor.execute("SELECT * FROM clinics WHERE id = %s LIMIT 1", (clinic_id,))
    row = cursor.fetchone()
    return _row_to_dict(cursor, row) if row else None


def approve_clinic(cursor, clinic_id: str) -> None:
    cursor.execute(
        "UPDATE clinics SET status = 'active', updated_at = NOW() WHERE id = %s",
        (clinic_id,),
    )


def reject_clinic(cursor, clinic_id: str) -> None:
    cursor.execute(
        "UPDATE clinics SET status = 'inactive', updated_at = NOW() WHERE id = %s",
        (clinic_id,),
    )


def link_clinic_owner(cursor, clinic_id: str, user_id: str) -> None:
    cursor.execute(
        """
        INSERT INTO clinic_users (clinic_id, user_id, access_level)
        VALUES (%s, %s, 'owner')
        ON CONFLICT (clinic_id, user_id) DO NOTHING
        """,
        (clinic_id, user_id),
    )
    cursor.execute(
        "INSERT INTO clinic_settings (clinic_id) VALUES (%s) ON CONFLICT (clinic_id) DO NOTHING",
        (clinic_id,),
    )
    cursor.execute(
        "INSERT INTO clinic_branding (clinic_id) VALUES (%s) ON CONFLICT (clinic_id) DO NOTHING",
        (clinic_id,),
    )


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


def find_affiliate_by_code(cursor, code: str) -> dict[str, Any] | None:
    cursor.execute(
        """
        SELECT id, user_id, affiliate_code, affiliate_type::text AS affiliate_type,
               parent_affiliate_id, status::text AS status
        FROM affiliates
        WHERE affiliate_code = %s AND status = 'active'
        LIMIT 1
        """,
        (code,),
    )
    row = cursor.fetchone()
    return _row_to_dict(cursor, row) if row else None
