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
        INSERT INTO clinics (
            clinic_name, email, phone, npi_number, dea_number,
            first_name, last_name, website, tax_id, reseller_permit_number,
            state_license_number, application_status, status, affiliate_id
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'pending', %s)
        RETURNING id, clinic_name, email, status::text AS status,
                  application_status, created_at
        """,
        (
            data["clinic_name"],
            data["email"].lower(),
            data.get("phone"),
            data.get("npi_number"),
            data.get("dea_number"),
            data.get("first_name"),
            data.get("last_name"),
            data.get("website"),
            data.get("tax_id"),
            data.get("reseller_permit_number"),
            data.get("state_license_number"),
            data.get("application_status", "submitted"),
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


def save_clinic_banking(cursor, clinic_id: str, data: dict) -> None:
    cursor.execute(
        """
        INSERT INTO clinic_banking_details (
            clinic_id, bank_name, account_type,
            encrypted_routing, encrypted_account,
            routing_last4, account_last4
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (clinic_id) DO UPDATE SET
            bank_name = EXCLUDED.bank_name,
            account_type = EXCLUDED.account_type,
            encrypted_routing = EXCLUDED.encrypted_routing,
            encrypted_account = EXCLUDED.encrypted_account,
            routing_last4 = EXCLUDED.routing_last4,
            account_last4 = EXCLUDED.account_last4,
            updated_at = NOW()
        """,
        (
            clinic_id,
            data["bank_name"],
            data["account_type"],
            data["encrypted_routing"],
            data["encrypted_account"],
            data["routing_last4"],
            data["account_last4"],
        ),
    )


def update_application_status(
    cursor,
    clinic_id: str,
    application_status: str,
    *,
    rejection_reason: str | None = None,
    admin_note: str | None = None,
) -> None:
    cursor.execute(
        """
        UPDATE clinics
        SET application_status = %s,
            rejection_reason = COALESCE(%s, rejection_reason),
            admin_note = COALESCE(%s, admin_note),
            updated_at = NOW()
        WHERE id = %s
        """,
        (application_status, rejection_reason, admin_note, clinic_id),
    )


def get_clinic_documents(cursor, clinic_id: str) -> list[dict[str, Any]]:
    cursor.execute(
        """
        SELECT id, document_type, file_url, status::text AS status, uploaded_at
        FROM clinic_documents
        WHERE clinic_id = %s
        ORDER BY uploaded_at ASC
        """,
        (clinic_id,),
    )
    return _rows_to_dicts(cursor, cursor.fetchall())


def get_clinic_banking_summary(cursor, clinic_id: str) -> dict[str, Any] | None:
    cursor.execute(
        """
        SELECT bank_name, account_type, routing_last4, account_last4
        FROM clinic_banking_details
        WHERE clinic_id = %s
        LIMIT 1
        """,
        (clinic_id,),
    )
    row = cursor.fetchone()
    return _row_to_dict(cursor, row) if row else None


def get_clinic_branding(cursor, clinic_id: str) -> dict[str, Any] | None:
    cursor.execute(
        "SELECT logo_url, theme_color, tagline FROM clinic_branding WHERE clinic_id = %s LIMIT 1",
        (clinic_id,),
    )
    row = cursor.fetchone()
    return _row_to_dict(cursor, row) if row else None


def count_applications(cursor, status_filter: list[str] | None = None) -> int:
    if status_filter:
        cursor.execute(
            "SELECT COUNT(*) FROM clinics WHERE application_status = ANY(%s)",
            (status_filter,),
        )
    else:
        cursor.execute("SELECT COUNT(*) FROM clinics WHERE application_status IS NOT NULL")
    return cursor.fetchone()[0]


def list_applications(
    cursor,
    limit: int,
    offset: int,
    status_filter: list[str] | None = None,
) -> list[dict[str, Any]]:
    where = ""
    params: list[Any] = []
    if status_filter:
        where = "WHERE c.application_status = ANY(%s)"
        params.append(status_filter)

    cursor.execute(
        f"""
        SELECT c.id, c.clinic_name, c.email, c.phone, c.npi_number, c.dea_number,
               c.first_name, c.last_name, c.website, c.tax_id, c.reseller_permit_number,
               c.state_license_number,
               c.status::text AS status, c.application_status,
               c.rejection_reason, c.admin_note, c.created_at, c.affiliate_id,
               ca.address1, ca.address2, ca.city, ca.state, ca.zip, ca.country,
               a.affiliate_code, a.affiliate_type::text AS affiliate_type,
               cb.logo_url,
               cbd.bank_name, cbd.account_type, cbd.routing_last4, cbd.account_last4
        FROM clinics c
        LEFT JOIN clinic_addresses ca ON ca.clinic_id = c.id AND ca.is_primary = TRUE
        LEFT JOIN affiliates a ON a.id = c.affiliate_id
        LEFT JOIN clinic_branding cb ON cb.clinic_id = c.id
        LEFT JOIN clinic_banking_details cbd ON cbd.clinic_id = c.id
        {where}
        ORDER BY c.created_at DESC
        LIMIT %s OFFSET %s
        """,
        [*params, limit, offset],
    )
    return _rows_to_dicts(cursor, cursor.fetchall())


def insert_clinic_document(
    cursor, clinic_id: str, document_type: str, file_url: str,
) -> dict[str, Any]:
    cursor.execute(
        """
        INSERT INTO clinic_documents (clinic_id, document_type, file_url)
        VALUES (%s, %s, %s)
        RETURNING id, document_type, file_url, status::text AS status, uploaded_at
        """,
        (clinic_id, document_type, file_url),
    )
    return _row_to_dict(cursor, cursor.fetchone())


def upsert_clinic_branding_logo(cursor, clinic_id: str, logo_url: str) -> None:
    cursor.execute(
        """
        INSERT INTO clinic_branding (clinic_id, logo_url)
        VALUES (%s, %s)
        ON CONFLICT (clinic_id) DO UPDATE SET logo_url = EXCLUDED.logo_url
        """,
        (clinic_id, logo_url),
    )


def count_pending_clinics(cursor) -> int:
    return count_applications(
        cursor,
        ["submitted", "docs_signed", "pending_review", "more_info_requested"],
    )


def list_pending_clinics(cursor, limit: int, offset: int) -> list[dict[str, Any]]:
    return list_applications(
        cursor,
        limit,
        offset,
        ["submitted", "docs_signed", "pending_review", "more_info_requested"],
    )


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
        """
        UPDATE clinics
        SET status = 'active',
            application_status = 'approved',
            updated_at = NOW()
        WHERE id = %s
        """,
        (clinic_id,),
    )


def reject_clinic(cursor, clinic_id: str, rejection_reason: str | None = None) -> None:
    cursor.execute(
        """
        UPDATE clinics
        SET status = 'inactive',
            application_status = 'rejected',
            rejection_reason = COALESCE(%s, rejection_reason),
            updated_at = NOW()
        WHERE id = %s
        """,
        (rejection_reason, clinic_id),
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
        SELECT c.id, c.clinic_name, c.email, c.status::text AS status,
               cu.access_level, cu.is_active AS member_active
        FROM clinic_users cu
        JOIN clinics c ON c.id = cu.clinic_id
        WHERE cu.user_id = %s AND cu.is_active = TRUE
        LIMIT 1
        """,
        (user_id,),
    )
    row = cursor.fetchone()
    return _row_to_dict(cursor, row) if row else None


def get_clinic_address(cursor, clinic_id: str) -> dict[str, Any] | None:
    cursor.execute(
        """
        SELECT id, address1, address2, city, state, zip, country, is_primary
        FROM clinic_addresses
        WHERE clinic_id = %s AND is_primary = TRUE
        LIMIT 1
        """,
        (clinic_id,),
    )
    row = cursor.fetchone()
    if row:
        return _row_to_dict(cursor, row)
    cursor.execute(
        """
        SELECT id, address1, address2, city, state, zip, country, is_primary
        FROM clinic_addresses
        WHERE clinic_id = %s
        ORDER BY created_at ASC
        LIMIT 1
        """,
        (clinic_id,),
    )
    row = cursor.fetchone()
    return _row_to_dict(cursor, row) if row else None


def get_clinic_settings(cursor, clinic_id: str) -> dict[str, Any] | None:
    cursor.execute(
        """
        SELECT notification_email, notification_sms, auto_approve_requests,
               payout_schedule_days, timezone
        FROM clinic_settings
        WHERE clinic_id = %s
        LIMIT 1
        """,
        (clinic_id,),
    )
    row = cursor.fetchone()
    return _row_to_dict(cursor, row) if row else None


def update_clinic_profile(cursor, clinic_id: str, data: dict) -> None:
    fields = []
    values: list[Any] = []
    for key in (
        "clinic_name", "phone", "website", "npi_number", "dea_number",
        "state_license_number", "tax_id", "first_name", "last_name",
    ):
        if key in data and data[key] is not None:
            fields.append(f"{key} = %s")
            values.append(data[key])
    if not fields:
        return
    values.append(clinic_id)
    cursor.execute(
        f"UPDATE clinics SET {', '.join(fields)}, updated_at = NOW() WHERE id = %s",
        values,
    )


def update_clinic_address(cursor, clinic_id: str, data: dict) -> dict[str, Any]:
    existing = get_clinic_address(cursor, clinic_id)
    if existing:
        cursor.execute(
            """
            UPDATE clinic_addresses
            SET address1 = %s, address2 = %s, city = %s, state = %s, zip = %s,
                country = %s, is_primary = TRUE
            WHERE id = %s
            RETURNING id, address1, address2, city, state, zip, country, is_primary
            """,
            (
                data["address1"],
                data.get("address2"),
                data["city"],
                data["state"],
                data["zip"],
                data.get("country", "US"),
                existing["id"],
            ),
        )
    else:
        cursor.execute(
            """
            INSERT INTO clinic_addresses (
                clinic_id, address1, address2, city, state, zip, country, is_primary
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, TRUE)
            RETURNING id, address1, address2, city, state, zip, country, is_primary
            """,
            (
                clinic_id,
                data["address1"],
                data.get("address2"),
                data["city"],
                data["state"],
                data["zip"],
                data.get("country", "US"),
            ),
        )
    return _row_to_dict(cursor, cursor.fetchone())


def update_clinic_branding(cursor, clinic_id: str, data: dict) -> dict[str, Any]:
    cursor.execute(
        "INSERT INTO clinic_branding (clinic_id) VALUES (%s) ON CONFLICT (clinic_id) DO NOTHING",
        (clinic_id,),
    )
    fields = []
    values: list[Any] = []
    for key, column in (
        ("tagline", "tagline"),
        ("theme_color", "theme_color"),
        ("logo_url", "logo_url"),
    ):
        if key in data and data[key] is not None:
            fields.append(f"{column} = %s")
            values.append(data[key])
    if fields:
        values.append(clinic_id)
        cursor.execute(
            f"UPDATE clinic_branding SET {', '.join(fields)}, updated_at = NOW() WHERE clinic_id = %s",
            values,
        )
    cursor.execute(
        "SELECT logo_url, theme_color, tagline FROM clinic_branding WHERE clinic_id = %s",
        (clinic_id,),
    )
    return _row_to_dict(cursor, cursor.fetchone())


def update_clinic_settings(cursor, clinic_id: str, data: dict) -> dict[str, Any]:
    cursor.execute(
        "INSERT INTO clinic_settings (clinic_id) VALUES (%s) ON CONFLICT (clinic_id) DO NOTHING",
        (clinic_id,),
    )
    fields = []
    values: list[Any] = []
    for key in (
        "notification_email",
        "notification_sms",
        "auto_approve_requests",
        "payout_schedule_days",
        "timezone",
    ):
        if key in data and data[key] is not None:
            fields.append(f"{key} = %s")
            values.append(data[key])
    if fields:
        values.append(clinic_id)
        cursor.execute(
            f"UPDATE clinic_settings SET {', '.join(fields)}, updated_at = NOW() WHERE clinic_id = %s",
            values,
        )
    cursor.execute(
        """
        SELECT notification_email, notification_sms, auto_approve_requests,
               payout_schedule_days, timezone
        FROM clinic_settings WHERE clinic_id = %s
        """,
        (clinic_id,),
    )
    return _row_to_dict(cursor, cursor.fetchone())


def list_clinic_members(cursor, clinic_id: str) -> list[dict[str, Any]]:
    cursor.execute(
        """
        SELECT cu.id, cu.access_level, cu.is_active, cu.created_at,
               u.id AS user_id, u.email, u.status::text AS user_status
        FROM clinic_users cu
        JOIN users u ON u.id = cu.user_id
        WHERE cu.clinic_id = %s
        ORDER BY
            CASE cu.access_level
                WHEN 'owner' THEN 0
                WHEN 'admin' THEN 1
                WHEN 'associate_provider' THEN 2
                ELSE 3
            END,
            cu.created_at ASC
        """,
        (clinic_id,),
    )
    return _rows_to_dicts(cursor, cursor.fetchall())


def list_pending_clinic_invitations(cursor, clinic_id: str) -> list[dict[str, Any]]:
    cursor.execute(
        """
        SELECT id, email, role AS access_level, status, expires_at, created_at
        FROM clinic_invitations
        WHERE clinic_id = %s AND status = 'pending' AND expires_at > NOW()
        ORDER BY created_at DESC
        """,
        (clinic_id,),
    )
    return _rows_to_dicts(cursor, cursor.fetchall())


def find_pending_clinic_invitation(cursor, clinic_id: str, email: str) -> dict[str, Any] | None:
    cursor.execute(
        """
        SELECT id, email, role AS access_level, status
        FROM clinic_invitations
        WHERE clinic_id = %s AND LOWER(email) = LOWER(%s) AND status = 'pending'
        LIMIT 1
        """,
        (clinic_id, email),
    )
    row = cursor.fetchone()
    return _row_to_dict(cursor, row) if row else None


def create_clinic_invitation(
    cursor,
    clinic_id: str,
    email: str,
    access_level: str,
    invited_by: str,
    token_hash: str,
    expires_at: datetime,
) -> dict[str, Any]:
    cursor.execute(
        """
        INSERT INTO clinic_invitations (
            clinic_id, email, role, token_hash, status, invited_by, expires_at
        )
        VALUES (%s, %s, %s, %s, 'pending', %s, %s)
        RETURNING id, email, role AS access_level, status, expires_at, created_at
        """,
        (clinic_id, email.lower(), access_level, token_hash, invited_by, expires_at),
    )
    return _row_to_dict(cursor, cursor.fetchone())


def cancel_clinic_invitation(cursor, clinic_id: str, invitation_id: str) -> bool:
    cursor.execute(
        """
        UPDATE clinic_invitations
        SET status = 'cancelled'
        WHERE id = %s AND clinic_id = %s AND status = 'pending'
        """,
        (invitation_id, clinic_id),
    )
    return cursor.rowcount > 0


def get_clinic_member(cursor, clinic_id: str, member_id: str) -> dict[str, Any] | None:
    cursor.execute(
        """
        SELECT cu.id, cu.access_level, cu.is_active, cu.user_id, u.email
        FROM clinic_users cu
        JOIN users u ON u.id = cu.user_id
        WHERE cu.id = %s AND cu.clinic_id = %s
        LIMIT 1
        """,
        (member_id, clinic_id),
    )
    row = cursor.fetchone()
    return _row_to_dict(cursor, row) if row else None


def update_clinic_member(
    cursor,
    clinic_id: str,
    member_id: str,
    *,
    access_level: str | None = None,
    is_active: bool | None = None,
) -> dict[str, Any] | None:
    fields = []
    values: list[Any] = []
    if access_level is not None:
        fields.append("access_level = %s")
        values.append(access_level)
    if is_active is not None:
        fields.append("is_active = %s")
        values.append(is_active)
    if not fields:
        return get_clinic_member(cursor, clinic_id, member_id)
    values.extend([member_id, clinic_id])
    cursor.execute(
        f"""
        UPDATE clinic_users
        SET {', '.join(fields)}
        WHERE id = %s AND clinic_id = %s
        RETURNING id, access_level, is_active, user_id
        """,
        values,
    )
    row = cursor.fetchone()
    return _row_to_dict(cursor, row) if row else None


def add_clinic_member(
    cursor,
    clinic_id: str,
    user_id: str,
    access_level: str,
) -> dict[str, Any]:
    cursor.execute(
        """
        INSERT INTO clinic_users (clinic_id, user_id, access_level, is_active)
        VALUES (%s, %s, %s, TRUE)
        ON CONFLICT (clinic_id, user_id) DO UPDATE SET
            access_level = EXCLUDED.access_level,
            is_active = TRUE
        RETURNING id, access_level, is_active, user_id
        """,
        (clinic_id, user_id, access_level),
    )
    return _row_to_dict(cursor, cursor.fetchone())


def find_clinic_invitation_by_token(cursor, token_hash: str) -> dict[str, Any] | None:
    cursor.execute(
        """
        SELECT ci.id, ci.clinic_id, ci.email, ci.role AS access_level,
               ci.status, ci.expires_at, ci.invited_by,
               c.clinic_name
        FROM clinic_invitations ci
        JOIN clinics c ON c.id = ci.clinic_id
        WHERE ci.token_hash = %s
        LIMIT 1
        """,
        (token_hash,),
    )
    row = cursor.fetchone()
    return _row_to_dict(cursor, row) if row else None


def accept_clinic_invitation(cursor, invitation_id: str) -> None:
    cursor.execute(
        """
        UPDATE clinic_invitations
        SET status = 'accepted', accepted_at = NOW()
        WHERE id = %s
        """,
        (invitation_id,),
    )


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
