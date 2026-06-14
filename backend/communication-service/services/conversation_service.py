from __future__ import annotations

import asyncio
from datetime import datetime, timezone

from fastapi import HTTPException

from db import connect
from repository.conversation_repository import (
    get_conversation_by_id,
    get_or_create_conversation,
    list_conversations_by_doctor,
    list_conversations_by_patient,
    list_message_templates,
)
from repository.patient_lookup import (
    get_doctor_clinic,
    get_doctor_profile,
    get_patient_by_id,
    get_patient_by_user_id,
    get_patient_doctor_id,
    patient_belongs_to_clinic,
)
from schemas.conversation import ConversationResponse
from services import mongo as mongo_service
from services import redis_bus


def _patient_display_name(row: dict) -> str:
    return f"{row.get('patient_first_name', '')} {row.get('patient_last_name', '')}".strip()


def _doctor_display_name(profile: dict | None, fallback_email: str | None = None) -> str:
    if not profile:
        return fallback_email or "Physician"
    first = profile.get("first_name") or ""
    last = profile.get("last_name") or ""
    name = f"{first} {last}".strip()
    if name:
        return f"Dr. {name}" if not name.lower().startswith("dr") else name
    email = profile.get("email") or fallback_email or "Physician"
    return email.split("@")[0]


def _preview_from_last_message(last: dict | None) -> str | None:
    if not last:
        return None
    message_type = last.get("message_type")
    if message_type == "text":
        return last.get("content")
    if message_type == "image":
        return "Image"
    if message_type == "voice":
        return "Voice message"
    if message_type == "document":
        return last.get("content") or "Document"
    return None


async def _enrich_conversations_batch(
    rows: list[dict],
    *,
    doctor_name: str | None = None,
    doctor_email: str | None = None,
    db=None,
) -> list[ConversationResponse]:
    if not rows:
        return []

    conversation_ids = [str(row["id"]) for row in rows]
    last_messages: dict[str, dict] = {}
    unread_provider: dict[str, int] = {}
    unread_patient: dict[str, int] = {}

    if db is not None:
        last_messages_task = mongo_service.get_last_messages_for_conversations(db, conversation_ids)
        unread_task = redis_bus.get_unread_maps(conversation_ids)
        last_messages, (unread_provider, unread_patient) = await asyncio.gather(
            last_messages_task,
            unread_task,
        )
    else:
        unread_provider, unread_patient = await redis_bus.get_unread_maps(conversation_ids)

    results: list[ConversationResponse] = []
    for row in rows:
        conversation_id = str(row["id"])
        patient_name = _patient_display_name(row) if row.get("patient_first_name") else None
        last_message_at = row.get("last_message_at")
        results.append(
            ConversationResponse(
                id=conversation_id,
                doctor_id=str(row["doctor_id"]),
                clinic_id=str(row["clinic_id"]),
                patient_id=str(row["patient_id"]),
                status=row["status"],
                last_message_at=last_message_at.isoformat() if last_message_at else None,
                patient_name=patient_name,
                doctor_name=doctor_name,
                doctor_email=doctor_email,
                unread_provider=unread_provider.get(conversation_id, 0),
                unread_patient=unread_patient.get(conversation_id, 0),
                last_message_preview=_preview_from_last_message(last_messages.get(conversation_id)),
            )
        )
    return results


async def _enrich_conversation(
    row: dict,
    *,
    patient_name: str | None = None,
    doctor_name: str | None = None,
    doctor_email: str | None = None,
    db=None,
) -> ConversationResponse:
    conversation_id = str(row["id"])
    last_message_preview = None
    unread_provider = 0
    unread_patient = 0

    if db is not None:
        unread_task = redis_bus.get_unread_maps([conversation_id])
        last_task = mongo_service.get_last_message(db, conversation_id)
        (unread_provider_map, unread_patient_map), last = await asyncio.gather(
            unread_task,
            last_task,
        )
        unread_provider = unread_provider_map.get(conversation_id, 0)
        unread_patient = unread_patient_map.get(conversation_id, 0)
        last_message_preview = _preview_from_last_message(last)
    else:
        unread_provider_map, unread_patient_map = await redis_bus.get_unread_maps([conversation_id])
        unread_provider = unread_provider_map.get(conversation_id, 0)
        unread_patient = unread_patient_map.get(conversation_id, 0)

    last_message_at = row.get("last_message_at")
    return ConversationResponse(
        id=conversation_id,
        doctor_id=str(row["doctor_id"]),
        clinic_id=str(row["clinic_id"]),
        patient_id=str(row["patient_id"]),
        status=row["status"],
        last_message_at=last_message_at.isoformat() if last_message_at else None,
        patient_name=patient_name,
        doctor_name=doctor_name,
        doctor_email=doctor_email,
        unread_provider=unread_provider,
        unread_patient=unread_patient,
        last_message_preview=last_message_preview,
    )


def ensure_conversation_access(user: dict, conversation: dict) -> str:
    role = user.get("role")
    user_id = user["sub"]
    if role in {"clinic_owner", "clinic_staff"}:
        if str(conversation["doctor_id"]) != user_id:
            raise HTTPException(status_code=403, detail="Not your conversation")
        return "provider"
    if role == "patient":
        conn = connect()
        cursor = conn.cursor()
        try:
            patient = get_patient_by_user_id(cursor, user_id)
            if not patient or str(patient["id"]) != str(conversation["patient_id"]):
                raise HTTPException(status_code=403, detail="Not your conversation")
            return "patient"
        finally:
            cursor.close()
            conn.close()
    raise HTTPException(status_code=403, detail="Insufficient permissions")


async def create_conversation_for_doctor(user: dict, patient_id: str) -> ConversationResponse:
    conn = connect()
    cursor = conn.cursor()
    try:
        clinic = get_doctor_clinic(cursor, user["sub"])
        if not clinic:
            raise HTTPException(status_code=403, detail="No clinic linked to this doctor account")
        if clinic["status"] != "active":
            raise HTTPException(status_code=403, detail="Clinic is not active")

        patient = get_patient_by_id(cursor, patient_id)
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")
        if not patient_belongs_to_clinic(cursor, patient_id, str(clinic["id"])):
            raise HTTPException(status_code=403, detail="Patient is not in your clinic")

        conversation = get_or_create_conversation(
            cursor,
            doctor_id=user["sub"],
            patient_id=patient_id,
            clinic_id=str(clinic["id"]),
        )
        doctor_profile = get_doctor_profile(cursor, user["sub"])
        conn.commit()

        db = await mongo_service.connect_mongo()
        return await _enrich_conversation(
            conversation,
            patient_name=f"{patient['first_name']} {patient['last_name']}".strip(),
            doctor_name=_doctor_display_name(doctor_profile, user.get("email")),
            doctor_email=user.get("email"),
            db=db,
        )
    except HTTPException:
        conn.rollback()
        raise
    except Exception as exc:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    finally:
        cursor.close()
        conn.close()


async def list_doctor_conversations(user: dict) -> list[ConversationResponse]:
    conn = connect()
    cursor = conn.cursor()
    try:
        clinic = get_doctor_clinic(cursor, user["sub"])
        if not clinic:
            raise HTTPException(status_code=403, detail="No clinic linked to this doctor account")

        rows = list_conversations_by_doctor(cursor, user["sub"])
        doctor_profile = get_doctor_profile(cursor, user["sub"])
        doctor_name = _doctor_display_name(doctor_profile, user.get("email"))
        db = await mongo_service.connect_mongo()
        return await _enrich_conversations_batch(
            rows,
            doctor_name=doctor_name,
            doctor_email=user.get("email"),
            db=db,
        )
    finally:
        cursor.close()
        conn.close()


async def get_patient_conversation(user: dict) -> ConversationResponse:
    conn = connect()
    cursor = conn.cursor()
    try:
        patient = get_patient_by_user_id(cursor, user["sub"])
        if not patient:
            raise HTTPException(status_code=404, detail="Patient profile not found")

        doctor_id = get_patient_doctor_id(cursor, str(patient["id"]), str(patient["clinic_id"]))
        if not doctor_id:
            raise HTTPException(status_code=404, detail="No physician assigned to this patient")

        conversation = get_or_create_conversation(
            cursor,
            doctor_id=doctor_id,
            patient_id=str(patient["id"]),
            clinic_id=str(patient["clinic_id"]),
        )
        doctor_profile = get_doctor_profile(cursor, doctor_id)
        conn.commit()

        db = await mongo_service.connect_mongo()
        return await _enrich_conversation(
            conversation,
            patient_name=f"{patient['first_name']} {patient['last_name']}".strip(),
            doctor_name=_doctor_display_name(doctor_profile, doctor_profile.get("email") if doctor_profile else None),
            doctor_email=doctor_profile.get("email") if doctor_profile else None,
            db=db,
        )
    except HTTPException:
        conn.rollback()
        raise
    except Exception as exc:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    finally:
        cursor.close()
        conn.close()


async def get_conversation_if_allowed(user: dict, conversation_id: str) -> tuple[dict, str]:
    conn = connect()
    cursor = conn.cursor()
    try:
        conversation = get_conversation_by_id(cursor, conversation_id)
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        role = ensure_conversation_access(user, conversation)
        return conversation, role
    finally:
        cursor.close()
        conn.close()


def list_conversation_ids_for_user(user: dict) -> list[str]:
    """Return conversation IDs the user may access (for WebSocket auto-subscribe)."""
    conn = connect()
    cursor = conn.cursor()
    try:
        role = user.get("role")
        if role in {"clinic_owner", "clinic_staff"}:
            rows = list_conversations_by_doctor(cursor, user["sub"])
            return [str(row["id"]) for row in rows]
        if role == "patient":
            patient = get_patient_by_user_id(cursor, user["sub"])
            if not patient:
                return []
            rows = list_conversations_by_patient(cursor, str(patient["id"]))
            return [str(row["id"]) for row in rows]
        return []
    finally:
        cursor.close()
        conn.close()


async def mark_conversation_read(user: dict, conversation_id: str, role: str) -> dict:
    conversation, access_role = await get_conversation_if_allowed(user, conversation_id)
    if role not in {"provider", "patient"}:
        raise HTTPException(status_code=400, detail="role must be provider or patient")
    if (role == "provider" and access_role != "provider") or (role == "patient" and access_role != "patient"):
        raise HTTPException(status_code=403, detail="Role mismatch")

    await redis_bus.reset_unread(conversation_id, role)
    now = datetime.now(timezone.utc).isoformat()
    await redis_bus.set_last_read(conversation_id, user["sub"], now)

    from services.realtime import push_conversation_event

    event = {
        "type": "message.read",
        "conversation_id": conversation_id,
        "user_id": user["sub"],
        "role": role,
        "read_at": now,
    }
    await push_conversation_event(conversation_id, event)
    return {"status": True, "conversation_id": conversation_id, "role": role, "read_at": now}


def get_templates_for_user(user: dict) -> list[dict]:
    conn = connect()
    cursor = conn.cursor()
    try:
        clinic_id = None
        if user.get("role") in {"clinic_owner", "clinic_staff"}:
            clinic = get_doctor_clinic(cursor, user["sub"])
            clinic_id = str(clinic["id"]) if clinic else None
        elif user.get("role") == "patient":
            patient = get_patient_by_user_id(cursor, user["sub"])
            clinic_id = str(patient["clinic_id"]) if patient else None
        rows = list_message_templates(cursor, clinic_id)
        return [
            {
                "id": str(row["id"]),
                "label": row["label"],
                "content": row["content"],
                "role": row["role"],
            }
            for row in rows
        ]
    finally:
        cursor.close()
        conn.close()
