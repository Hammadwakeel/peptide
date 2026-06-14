from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from config import MONGODB_DB_NAME, MONGODB_URI

_client: AsyncIOMotorClient | None = None
_db: AsyncIOMotorDatabase | None = None


async def connect_mongo() -> AsyncIOMotorDatabase:
    global _client, _db
    if _db is not None:
        return _db
    _client = AsyncIOMotorClient(MONGODB_URI)
    _db = _client[MONGODB_DB_NAME]
    await _db.messages.create_index([("conversation_id", 1), ("created_at", -1)])
    await _db.messages.create_index([("conversation_id", 1), ("_id", 1)])
    # Match existing Atlas index (unique + sparse) so startup does not conflict on id_1.
    await _db.messages.create_index([("id", 1)], unique=True, sparse=True)
    return _db


async def close_mongo() -> None:
    global _client, _db
    if _client is not None:
        _client.close()
    _client = None
    _db = None


def get_messages_collection(db: AsyncIOMotorDatabase):
    return db.messages


def serialize_message(doc: dict[str, Any]) -> dict[str, Any]:
    message_id = doc.get("id") or str(doc["_id"])
    reactions = doc.get("reactions") or []
    return {
        "id": message_id,
        "conversation_id": doc["conversation_id"],
        "sender_user_id": doc["sender_user_id"],
        "sender_role": doc["sender_role"],
        "message_type": doc["message_type"],
        "content": doc.get("content"),
        "media_key": doc.get("media_key"),
        "media_url": doc.get("media_url"),
        "media_mime": doc.get("media_mime"),
        "media_duration_ms": doc.get("media_duration_ms"),
        "sender_name": doc.get("sender_name"),
        "reply_to_message_id": doc.get("reply_to_message_id"),
        "reactions": reactions,
        "created_at": doc["created_at"].isoformat()
        if isinstance(doc.get("created_at"), datetime)
        else str(doc.get("created_at", "")),
    }


import uuid


async def get_message_by_id(db: AsyncIOMotorDatabase, message_id: str) -> dict[str, Any] | None:
    doc = await db.messages.find_one({"id": message_id})
    return doc


async def toggle_message_reaction(
    db: AsyncIOMotorDatabase,
    *,
    message_id: str,
    conversation_id: str,
    emoji: str,
    user_id: str,
    user_name: str | None,
) -> dict[str, Any] | None:
    doc = await db.messages.find_one({"id": message_id, "conversation_id": conversation_id})
    if not doc:
        return None

    reactions: list[dict[str, Any]] = list(doc.get("reactions") or [])
    existing_index = next(
        (index for index, reaction in enumerate(reactions) if reaction.get("user_id") == user_id),
        None,
    )

    if existing_index is not None and reactions[existing_index].get("emoji") == emoji:
        reactions.pop(existing_index)
    else:
        if existing_index is not None:
            reactions.pop(existing_index)
        reactions.append({"emoji": emoji, "user_id": user_id, "user_name": user_name})

    await db.messages.update_one({"id": message_id}, {"$set": {"reactions": reactions}})
    updated = await db.messages.find_one({"id": message_id})
    return serialize_message(updated) if updated else None


async def insert_message(db: AsyncIOMotorDatabase, data: dict[str, Any]) -> dict[str, Any]:
    now = datetime.now(timezone.utc)
    payload = {**data, "created_at": now}
    if "id" not in payload:
        payload["id"] = str(uuid.uuid4())
    result = await db.messages.insert_one(payload)
    payload["_id"] = result.inserted_id
    return serialize_message(payload)


async def list_messages(
    db: AsyncIOMotorDatabase,
    conversation_id: str,
    *,
    limit: int = 100,
    before_id: str | None = None,
) -> tuple[list[dict[str, Any]], bool]:
    query: dict[str, Any] = {"conversation_id": conversation_id}
    if before_id:
        anchor = await db.messages.find_one({"id": before_id, "conversation_id": conversation_id})
        if not anchor:
            return [], False
        query["created_at"] = {"$lt": anchor["created_at"]}

    cursor = db.messages.find(
        query,
        {
            "_id": 0,
            "id": 1,
            "conversation_id": 1,
            "sender_user_id": 1,
            "sender_role": 1,
            "message_type": 1,
            "content": 1,
            "media_url": 1,
            "media_mime": 1,
            "media_duration_ms": 1,
            "sender_name": 1,
            "reply_to_message_id": 1,
            "reactions": 1,
            "created_at": 1,
        },
    ).sort("created_at", -1).limit(limit + 1)
    docs = await cursor.to_list(length=limit + 1)
    has_more = len(docs) > limit
    docs = docs[:limit]
    docs.reverse()
    return [serialize_message(doc) for doc in docs], has_more


async def get_last_message(db: AsyncIOMotorDatabase, conversation_id: str) -> dict[str, Any] | None:
    doc = await db.messages.find_one(
        {"conversation_id": conversation_id},
        sort=[("created_at", -1)],
    )
    return serialize_message(doc) if doc else None


async def get_last_messages_for_conversations(
    db: AsyncIOMotorDatabase,
    conversation_ids: list[str],
) -> dict[str, dict[str, Any]]:
    if not conversation_ids:
        return {}
    pipeline = [
        {"$match": {"conversation_id": {"$in": conversation_ids}}},
        {"$sort": {"created_at": -1}},
        {"$group": {"_id": "$conversation_id", "doc": {"$first": "$$ROOT"}}},
    ]
    results: dict[str, dict[str, Any]] = {}
    async for row in db.messages.aggregate(pipeline):
        results[row["_id"]] = serialize_message(row["doc"])
    return results
