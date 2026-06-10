from __future__ import annotations

from typing import Any


def _row_to_dict(cursor, row: tuple) -> dict[str, Any]:
    columns = [desc[0] for desc in cursor.description]
    return dict(zip(columns, row))


def _rows_to_dicts(cursor, rows: list[tuple]) -> list[dict[str, Any]]:
    return [_row_to_dict(cursor, row) for row in rows]


def get_or_create_conversation(
    cursor,
    *,
    doctor_id: str,
    patient_id: str,
    clinic_id: str,
) -> dict[str, Any]:
    cursor.execute(
        """
        SELECT id, doctor_id, clinic_id, patient_id, status, last_message_at, created_at, updated_at
        FROM conversations
        WHERE doctor_id = %s AND patient_id = %s
        LIMIT 1
        """,
        (doctor_id, patient_id),
    )
    row = cursor.fetchone()
    if row:
        return _row_to_dict(cursor, row)

    cursor.execute(
        """
        INSERT INTO conversations (doctor_id, clinic_id, patient_id, status)
        VALUES (%s, %s, %s, 'active')
        RETURNING id, doctor_id, clinic_id, patient_id, status, last_message_at, created_at, updated_at
        """,
        (doctor_id, clinic_id, patient_id),
    )
    return _row_to_dict(cursor, cursor.fetchone())


def get_conversation_by_id(cursor, conversation_id: str) -> dict[str, Any] | None:
    cursor.execute(
        """
        SELECT id, doctor_id, clinic_id, patient_id, status, last_message_at, created_at, updated_at
        FROM conversations
        WHERE id = %s
        LIMIT 1
        """,
        (conversation_id,),
    )
    row = cursor.fetchone()
    return _row_to_dict(cursor, row) if row else None


def list_conversations_by_doctor(cursor, doctor_id: str) -> list[dict[str, Any]]:
    cursor.execute(
        """
        SELECT c.id, c.doctor_id, c.clinic_id, c.patient_id, c.status, c.last_message_at,
               c.created_at, c.updated_at,
               p.first_name AS patient_first_name, p.last_name AS patient_last_name,
               p.email AS patient_email
        FROM conversations c
        JOIN patients p ON p.id = c.patient_id
        WHERE c.doctor_id = %s
        ORDER BY COALESCE(c.last_message_at, c.updated_at) DESC
        """,
        (doctor_id,),
    )
    return _rows_to_dicts(cursor, cursor.fetchall())


def list_conversations_by_patient(cursor, patient_id: str) -> list[dict[str, Any]]:
    cursor.execute(
        """
        SELECT c.id, c.doctor_id, c.clinic_id, c.patient_id, c.status, c.last_message_at,
               c.created_at, c.updated_at,
               u.email AS doctor_email
        FROM conversations c
        JOIN users u ON u.id = c.doctor_id
        WHERE c.patient_id = %s
        ORDER BY COALESCE(c.last_message_at, c.updated_at) DESC
        """,
        (patient_id,),
    )
    return _rows_to_dicts(cursor, cursor.fetchall())


def update_conversation_last_message(cursor, conversation_id: str) -> None:
    cursor.execute(
        """
        UPDATE conversations
        SET last_message_at = NOW(), updated_at = NOW()
        WHERE id = %s
        """,
        (conversation_id,),
    )


def list_message_templates(cursor, clinic_id: str | None = None) -> list[dict[str, Any]]:
    if clinic_id:
        cursor.execute(
            """
            SELECT id, clinic_id, label, content, role, sort_order, active, created_at
            FROM message_templates
            WHERE (clinic_id = %s OR clinic_id IS NULL) AND active = TRUE
            ORDER BY sort_order, label
            """,
            (clinic_id,),
        )
    else:
        cursor.execute(
            """
            SELECT id, clinic_id, label, content, role, sort_order, active, created_at
            FROM message_templates
            WHERE clinic_id IS NULL AND active = TRUE
            ORDER BY sort_order, label
            """,
        )
    return _rows_to_dicts(cursor, cursor.fetchall())
