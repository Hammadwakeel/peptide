from __future__ import annotations

import asyncio
import json
from collections.abc import Awaitable, Callable
from typing import Any

import redis.asyncio as redis

from config import REDIS_URL

_redis_pub: redis.Redis | None = None
_redis_sub: redis.Redis | None = None
_pubsub_task: asyncio.Task | None = None
_message_handler: Callable[[dict[str, Any]], Awaitable[None]] | None = None


async def _get_pub_client() -> redis.Redis:
    global _redis_pub
    if _redis_pub is None:
        _redis_pub = redis.from_url(REDIS_URL, decode_responses=True)
    return _redis_pub


async def _get_sub_client() -> redis.Redis:
    global _redis_sub
    if _redis_sub is None:
        _redis_sub = redis.from_url(REDIS_URL, decode_responses=True)
    return _redis_sub


async def connect_redis() -> redis.Redis:
    return await _get_pub_client()


def conversation_channel(conversation_id: str) -> str:
    return f"chat:conversation:{conversation_id}"


def unread_key(conversation_id: str, role: str) -> str:
    return f"chat:unread:{conversation_id}:{role}"


def last_read_key(conversation_id: str, user_id: str) -> str:
    return f"chat:last_read:{conversation_id}:{user_id}"


async def close_redis() -> None:
    global _redis_pub, _redis_sub, _pubsub_task
    if _pubsub_task is not None:
        _pubsub_task.cancel()
        try:
            await _pubsub_task
        except asyncio.CancelledError:
            pass
        _pubsub_task = None
    if _redis_pub is not None:
        await _redis_pub.aclose()
        _redis_pub = None
    if _redis_sub is not None:
        await _redis_sub.aclose()
        _redis_sub = None


async def publish_event(conversation_id: str, event: dict[str, Any]) -> None:
    client = await _get_pub_client()
    payload = json.dumps(event)
    await client.publish(conversation_channel(conversation_id), payload)


async def increment_unread(conversation_id: str, role: str) -> int:
    client = await _get_pub_client()
    return int(await client.incr(unread_key(conversation_id, role)))


async def reset_unread(conversation_id: str, role: str) -> None:
    client = await _get_pub_client()
    await client.set(unread_key(conversation_id, role), 0)


async def get_unread(conversation_id: str, role: str) -> int:
    client = await _get_pub_client()
    value = await client.get(unread_key(conversation_id, role))
    return int(value or 0)


async def set_last_read(conversation_id: str, user_id: str, iso_timestamp: str) -> None:
    client = await _get_pub_client()
    await client.set(last_read_key(conversation_id, user_id), iso_timestamp)


async def start_redis_subscriber(handler: Callable[[dict[str, Any]], Awaitable[None]]) -> None:
    global _pubsub_task, _message_handler
    _message_handler = handler
    if _pubsub_task is not None:
        return
    _pubsub_task = asyncio.create_task(_redis_listener_loop())


async def _redis_listener_loop() -> None:
    client = await _get_sub_client()
    pubsub = client.pubsub()
    await pubsub.psubscribe("chat:conversation:*")
    try:
        async for message in pubsub.listen():
            if message["type"] not in {"pmessage", "message"}:
                continue
            raw = message.get("data")
            if not raw or not _message_handler:
                continue
            try:
                event = json.loads(raw)
            except json.JSONDecodeError:
                continue
            await _message_handler(event)
    finally:
        await pubsub.punsubscribe("chat:conversation:*")
        await pubsub.aclose()
