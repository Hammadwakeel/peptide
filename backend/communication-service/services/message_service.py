from __future__ import annotations

from fastapi import HTTPException, UploadFile

from config import ALLOWED_IMAGE_TYPES, ALLOWED_VOICE_TYPES, MAX_TEXT_BYTES
from db import connect
from repository.conversation_repository import update_conversation_last_message
from repository.patient_lookup import get_doctor_profile, get_patient_by_id, get_patient_by_user_id
from services import conversation_service
from services import mongo as mongo_service
from services import redis_bus
from services.realtime import push_conversation_event
from services.media_storage import media_storage, new_message_id


async def _resolve_sender_name(sender_role: str, sender_user_id: str, conversation: dict) -> str:
    conn = connect()
    cursor = conn.cursor()
    try:
        if sender_role == "provider":
            profile = get_doctor_profile(cursor, sender_user_id)
            if profile:
                first = profile.get("first_name") or ""
                last = profile.get("last_name") or ""
                name = f"{first} {last}".strip()
                if name:
                    return f"Dr. {name}" if not name.lower().startswith("dr") else name
                return (profile.get("email") or "Physician").split("@")[0]
            return "Physician"
        patient = get_patient_by_id(cursor, str(conversation["patient_id"]))
        if patient:
            return f"{patient['first_name']} {patient['last_name']}".strip()
        return "Patient"
    finally:
        cursor.close()
        conn.close()


async def send_text_message(
    user: dict,
    conversation_id: str,
    content: str,
    *,
    reply_to_message_id: str | None = None,
) -> dict:
    content = content.strip()
    if not content:
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    if len(content.encode("utf-8")) > MAX_TEXT_BYTES:
        raise HTTPException(status_code=400, detail="Message exceeds length limit")

    conversation, access_role = await conversation_service.get_conversation_if_allowed(user, conversation_id)
    sender_role = "provider" if access_role == "provider" else "patient"
    sender_name = await _resolve_sender_name(sender_role, user["sub"], conversation)

    db = await mongo_service.connect_mongo()
    if reply_to_message_id:
        parent = await mongo_service.get_message_by_id(db, reply_to_message_id)
        if not parent or parent.get("conversation_id") != conversation_id:
            raise HTTPException(status_code=400, detail="Invalid reply target")

    message = await mongo_service.insert_message(
        db,
        {
            "conversation_id": conversation_id,
            "sender_user_id": user["sub"],
            "sender_role": sender_role,
            "message_type": "text",
            "content": content,
            "sender_name": sender_name,
            "reply_to_message_id": reply_to_message_id,
            "reactions": [],
        },
    )

    conn = connect()
    cursor = conn.cursor()
    try:
        update_conversation_last_message(cursor, conversation_id)
        conn.commit()
    finally:
        cursor.close()
        conn.close()

    recipient_role = "patient" if sender_role == "provider" else "provider"
    await redis_bus.increment_unread(conversation_id, recipient_role)

    event = {"type": "message.new", "conversation_id": conversation_id, "message": message}
    await push_conversation_event(conversation_id, event)

    return message


async def list_conversation_messages(
    user: dict,
    conversation_id: str,
    *,
    limit: int = 100,
    before_id: str | None = None,
) -> tuple[list[dict], bool]:
    await conversation_service.get_conversation_if_allowed(user, conversation_id)
    db = await mongo_service.connect_mongo()
    return await mongo_service.list_messages(db, conversation_id, limit=limit, before_id=before_id)


async def _read_upload(file: UploadFile, allowed_types: set[str], max_bytes: int) -> tuple[bytes, str, str]:
    if not file.filename:
        raise HTTPException(status_code=400, detail="Uploaded file must have a filename")
    raw_type = file.content_type or "application/octet-stream"
    content_type = raw_type.split(";")[0].strip().lower()
    if content_type not in allowed_types:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {raw_type}")
    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")
    if len(data) > max_bytes:
        raise HTTPException(status_code=400, detail="File exceeds size limit")
    return data, content_type, file.filename


async def send_media_message(
    user: dict,
    conversation_id: str,
    file: UploadFile,
    *,
    message_type: str,
    content: str | None = None,
    media_duration_ms: int | None = None,
    reply_to_message_id: str | None = None,
) -> dict:
    conversation, access_role = await conversation_service.get_conversation_if_allowed(user, conversation_id)
    sender_role = "provider" if access_role == "provider" else "patient"
    sender_name = await _resolve_sender_name(sender_role, user["sub"], conversation)

    if message_type == "image":
        file_bytes, content_type, filename = await _read_upload(
            file, ALLOWED_IMAGE_TYPES, 10 * 1024 * 1024
        )
    elif message_type == "voice":
        file_bytes, content_type, filename = await _read_upload(
            file, ALLOWED_VOICE_TYPES, 25 * 1024 * 1024
        )
    elif message_type == "document":
        from config import ALLOWED_DOCUMENT_TYPES, MAX_DOCUMENT_BYTES

        file_bytes, content_type, filename = await _read_upload(
            file, ALLOWED_DOCUMENT_TYPES, MAX_DOCUMENT_BYTES
        )
        if not content:
            content = filename
    else:
        raise HTTPException(status_code=400, detail="Invalid message_type")

    db = await mongo_service.connect_mongo()
    if reply_to_message_id:
        parent = await mongo_service.get_message_by_id(db, reply_to_message_id)
        if not parent or parent.get("conversation_id") != conversation_id:
            raise HTTPException(status_code=400, detail="Invalid reply target")

    message_id = new_message_id()
    uploaded = media_storage.upload_chat_media(
        conversation_id=conversation_id,
        message_id=message_id,
        file_bytes=file_bytes,
        filename=filename,
        content_type=content_type,
    )

    message = await mongo_service.insert_message(
        db,
        {
            "id": message_id,
            "conversation_id": conversation_id,
            "sender_user_id": user["sub"],
            "sender_role": sender_role,
            "message_type": message_type,
            "content": content or None,
            "media_key": uploaded["key"],
            "media_url": uploaded["url"],
            "media_mime": content_type,
            "media_duration_ms": media_duration_ms,
            "sender_name": sender_name,
            "reply_to_message_id": reply_to_message_id,
            "reactions": [],
        },
    )

    conn = connect()
    cursor = conn.cursor()
    try:
        update_conversation_last_message(cursor, conversation_id)
        conn.commit()
    finally:
        cursor.close()
        conn.close()

    recipient_role = "patient" if sender_role == "provider" else "provider"
    await redis_bus.increment_unread(conversation_id, recipient_role)

    event = {"type": "message.new", "conversation_id": conversation_id, "message": message}
    await push_conversation_event(conversation_id, event)
    return message


async def toggle_message_reaction(
    user: dict,
    conversation_id: str,
    message_id: str,
    emoji: str,
) -> dict:
    conversation, access_role = await conversation_service.get_conversation_if_allowed(user, conversation_id)
    sender_role = "provider" if access_role == "provider" else "patient"
    sender_name = await _resolve_sender_name(sender_role, user["sub"], conversation)

    db = await mongo_service.connect_mongo()
    updated = await mongo_service.toggle_message_reaction(
        db,
        message_id=message_id,
        conversation_id=conversation_id,
        emoji=emoji,
        user_id=user["sub"],
        user_name=sender_name,
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Message not found")

    event = {"type": "message.updated", "conversation_id": conversation_id, "message": updated}
    await push_conversation_event(conversation_id, event)
    return updated
