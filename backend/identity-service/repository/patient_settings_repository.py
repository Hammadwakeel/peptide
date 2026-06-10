from __future__ import annotations

from typing import Any


def _row(cursor, row: tuple) -> dict[str, Any]:
    return dict(zip([d[0] for d in cursor.description], row))


def _rows(cursor, rows: list) -> list[dict[str, Any]]:
    cols = [d[0] for d in cursor.description]
    return [dict(zip(cols, r)) for r in rows]


def get_patient_by_user_id(cursor, user_id: str) -> dict[str, Any] | None:
    cursor.execute(
        """
        SELECT p.id, p.clinic_id, p.user_id, p.first_name, p.last_name, p.email,
               p.phone, p.dob, p.status::text AS status,
               c.clinic_name, u.email AS user_email
        FROM patients p
        JOIN clinics c ON c.id = p.clinic_id
        LEFT JOIN users u ON u.id = p.user_id
        WHERE p.user_id = %s AND p.status = 'active' AND c.status = 'active'
        LIMIT 1
        """,
        (user_id,),
    )
    row = cursor.fetchone()
    return _row(cursor, row) if row else None


def update_patient_profile(cursor, patient_id: str, data: dict[str, Any]) -> dict[str, Any]:
    fields = []
    params: list[Any] = []
    for key in ("first_name", "last_name", "phone", "dob"):
        if key in data and data[key] is not None:
            fields.append(f"{key} = %s")
            params.append(data[key])
    if not fields:
        cursor.execute(
            """
            SELECT id, first_name, last_name, email, phone, dob
            FROM patients WHERE id = %s
            """,
            (patient_id,),
        )
        return _row(cursor, cursor.fetchone())

    params.append(patient_id)
    cursor.execute(
        f"""
        UPDATE patients
        SET {", ".join(fields)}, updated_at = NOW()
        WHERE id = %s
        RETURNING id, first_name, last_name, email, phone, dob
        """,
        params,
    )
    return _row(cursor, cursor.fetchone())


def list_patient_addresses(cursor, patient_id: str) -> list[dict[str, Any]]:
    cursor.execute(
        """
        SELECT id, patient_id, address1, address2, city, state, zip, country, is_default, created_at
        FROM patient_addresses
        WHERE patient_id = %s
        ORDER BY is_default DESC, created_at ASC
        """,
        (patient_id,),
    )
    return _rows(cursor, cursor.fetchall())


def get_patient_address(cursor, patient_id: str, address_id: str) -> dict[str, Any] | None:
    cursor.execute(
        """
        SELECT id, patient_id, address1, address2, city, state, zip, country, is_default, created_at
        FROM patient_addresses
        WHERE id = %s AND patient_id = %s
        """,
        (address_id, patient_id),
    )
    row = cursor.fetchone()
    return _row(cursor, row) if row else None


def clear_default_addresses(cursor, patient_id: str) -> None:
    cursor.execute(
        "UPDATE patient_addresses SET is_default = FALSE WHERE patient_id = %s",
        (patient_id,),
    )


def create_patient_address(cursor, patient_id: str, data: dict[str, Any]) -> dict[str, Any]:
    if data.get("is_default"):
        clear_default_addresses(cursor, patient_id)
    cursor.execute(
        """
        INSERT INTO patient_addresses
            (patient_id, address1, address2, city, state, zip, country, is_default)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING id, patient_id, address1, address2, city, state, zip, country, is_default, created_at
        """,
        (
            patient_id,
            data["line1"],
            data.get("line2"),
            data["city"],
            data["state"].upper(),
            data["zip"],
            data.get("country", "US").upper(),
            data.get("is_default", False),
        ),
    )
    return _row(cursor, cursor.fetchone())


def update_patient_address(
    cursor, patient_id: str, address_id: str, data: dict[str, Any],
) -> dict[str, Any] | None:
    if data.get("is_default"):
        clear_default_addresses(cursor, patient_id)

    mapping = {
        "line1": "address1",
        "line2": "address2",
        "city": "city",
        "state": "state",
        "zip": "zip",
        "country": "country",
        "is_default": "is_default",
    }
    fields = []
    params: list[Any] = []
    for api_key, db_key in mapping.items():
        if api_key in data and data[api_key] is not None:
            value = data[api_key]
            if db_key == "state" and isinstance(value, str):
                value = value.upper()
            if db_key == "country" and isinstance(value, str):
                value = value.upper()
            fields.append(f"{db_key} = %s")
            params.append(value)

    if not fields:
        return get_patient_address(cursor, patient_id, address_id)

    params.extend([address_id, patient_id])
    cursor.execute(
        f"""
        UPDATE patient_addresses
        SET {", ".join(fields)}
        WHERE id = %s AND patient_id = %s
        RETURNING id, patient_id, address1, address2, city, state, zip, country, is_default, created_at
        """,
        params,
    )
    row = cursor.fetchone()
    return _row(cursor, row) if row else None


def delete_patient_address(cursor, patient_id: str, address_id: str) -> bool:
    cursor.execute(
        "DELETE FROM patient_addresses WHERE id = %s AND patient_id = %s",
        (address_id, patient_id),
    )
    return cursor.rowcount > 0


def set_default_patient_address(cursor, patient_id: str, address_id: str) -> dict[str, Any] | None:
    clear_default_addresses(cursor, patient_id)
    cursor.execute(
        """
        UPDATE patient_addresses
        SET is_default = TRUE
        WHERE id = %s AND patient_id = %s
        RETURNING id, patient_id, address1, address2, city, state, zip, country, is_default, created_at
        """,
        (address_id, patient_id),
    )
    row = cursor.fetchone()
    return _row(cursor, row) if row else None


def list_patient_payment_methods(cursor, patient_id: str) -> list[dict[str, Any]]:
    cursor.execute(
        """
        SELECT id, card_brand, card_last4, exp_month, exp_year, is_default, created_at
        FROM patient_payment_methods
        WHERE patient_id = %s
        ORDER BY is_default DESC, created_at ASC
        """,
        (patient_id,),
    )
    return _rows(cursor, cursor.fetchall())


def clear_default_payment_methods(cursor, patient_id: str) -> None:
    cursor.execute(
        "UPDATE patient_payment_methods SET is_default = FALSE WHERE patient_id = %s",
        (patient_id,),
    )


def create_patient_payment_method(
    cursor, patient_id: str, data: dict[str, Any],
) -> dict[str, Any]:
    if data.get("is_default"):
        clear_default_payment_methods(cursor, patient_id)
    cursor.execute(
        """
        INSERT INTO patient_payment_methods
            (patient_id, stripe_payment_method_id, card_brand, card_last4, exp_month, exp_year, is_default)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        RETURNING id, card_brand, card_last4, exp_month, exp_year, is_default, created_at
        """,
        (
            patient_id,
            data["stripe_payment_method_id"],
            data["card_brand"],
            data["card_last4"],
            data.get("exp_month"),
            data.get("exp_year"),
            data.get("is_default", False),
        ),
    )
    return _row(cursor, cursor.fetchone())


def delete_patient_payment_method(cursor, patient_id: str, payment_method_id: str) -> bool:
    cursor.execute(
        "DELETE FROM patient_payment_methods WHERE id = %s AND patient_id = %s",
        (payment_method_id, patient_id),
    )
    return cursor.rowcount > 0


def set_default_patient_payment_method(
    cursor, patient_id: str, payment_method_id: str,
) -> dict[str, Any] | None:
    clear_default_payment_methods(cursor, patient_id)
    cursor.execute(
        """
        UPDATE patient_payment_methods
        SET is_default = TRUE
        WHERE id = %s AND patient_id = %s
        RETURNING id, card_brand, card_last4, exp_month, exp_year, is_default, created_at
        """,
        (payment_method_id, patient_id),
    )
    row = cursor.fetchone()
    return _row(cursor, row) if row else None
