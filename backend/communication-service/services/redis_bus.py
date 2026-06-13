from __future__ import annotations

import asyncio
import json
import logging
from collections.abc import Awaitable, Callable
from typing import Any, TypeVar

import redis.asyncio as redis
import redis.exceptions

from config import REDIS_URL

logger = logging.getLogger("communication-service")

_redis_pub: redis.Redis | None = None
_redis_sub: redis.Redis | None = None
_pubsub_task: asyncio.Task | None = None
_message_handler: Callable[[dict[str, Any]], Awaitable[None]] | None = None

_REDIS_KWARGS = {
    "decode_responses": True,
    "socket_connect_timeout": 3,
    "socket_timeout": 3,
    "retry_on_timeout": True,
    "health_check_interval": 30,
}

T = TypeVar("T")


async def _await_redis(value: Any) -> Any:
    if asyncio.iscoroutine(value):
        return await value
    return value


def _redis_enabled() -> bool:
    return bool(REDIS_URL)


async def _safe_redis(
    operation: Callable[[], Awaitable[T]],
    *,
    fallback: T,
    action: str,
) -> T:
    if not _redis_enabled():
        return fallback
    try:
        return await operation()
    except (redis.exceptions.RedisError, asyncio.TimeoutError, OSError, TypeError) as exc:
        logger.warning("Redis %s failed, using fallback: %s", action, exc)
        return fallback


def _create_client() -> redis.Redis:
    return redis.from_url(REDIS_URL, **_REDIS_KWARGS)


async def _get_pub_client() -> redis.Redis:
    global _redis_pub
    if _redis_pub is None:
        _redis_pub = _create_client()
    return _redis_pub


async def _get_sub_client() -> redis.Redis:
    global _redis_sub
    if _redis_sub is None:
        _redis_sub = _create_client()
    return _redis_sub


async def connect_redis() -> redis.Redis | None:
    if not _redis_enabled():
        logger.warning("REDIS_URL is not configured; chat unread counts will use defaults")
        return None
    try:
        return await _get_pub_client()
    except (redis.exceptions.RedisError, asyncio.TimeoutError, OSError) as exc:
        logger.warning("Redis client init failed on startup: %s", exc)
        return None


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
        close = getattr(_redis_pub, "aclose", None) or getattr(_redis_pub, "close", None)
        if close is not None:
            result = close()
            if asyncio.iscoroutine(result):
                await result
        _redis_pub = None
    if _redis_sub is not None:
        close = getattr(_redis_sub, "aclose", None) or getattr(_redis_sub, "close", None)
        if close is not None:
            result = close()
            if asyncio.iscoroutine(result):
                await result
        _redis_sub = None


async def publish_event(conversation_id: str, event: dict[str, Any]) -> None:
    async def _publish() -> None:
        client = await _get_pub_client()
        payload = json.dumps(event)
        await _await_redis(client.publish(conversation_channel(conversation_id), payload))

    await _safe_redis(_publish, fallback=None, action="publish_event")


async def increment_unread(conversation_id: str, role: str) -> int:
    async def _increment() -> int:
        client = await _get_pub_client()
        return int(await _await_redis(client.incr(unread_key(conversation_id, role))))

    return await _safe_redis(_increment, fallback=1, action="increment_unread")


async def reset_unread(conversation_id: str, role: str) -> None:
    async def _reset() -> None:
        client = await _get_pub_client()
        await _await_redis(client.set(unread_key(conversation_id, role), 0))

    await _safe_redis(_reset, fallback=None, action="reset_unread")


async def get_unread(conversation_id: str, role: str) -> int:
    async def _get() -> int:
        client = await _get_pub_client()
        value = await _await_redis(client.get(unread_key(conversation_id, role)))
        return int(value or 0)

    return await _safe_redis(_get, fallback=0, action="get_unread")


async def set_last_read(conversation_id: str, user_id: str, iso_timestamp: str) -> None:
    async def _set() -> None:
        client = await _get_pub_client()
        await _await_redis(client.set(last_read_key(conversation_id, user_id), iso_timestamp))

    await _safe_redis(_set, fallback=None, action="set_last_read")


async def start_redis_subscriber(handler: Callable[[dict[str, Any]], Awaitable[None]]) -> None:
    global _pubsub_task, _message_handler
    if not _redis_enabled():
        logger.warning("Skipping Redis subscriber; REDIS_URL is not configured")
        return
    _message_handler = handler
    if _pubsub_task is not None:
        return
    _pubsub_task = asyncio.create_task(_redis_listener_loop())


async def _redis_listener_loop() -> None:
    try:
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
    except (redis.exceptions.RedisError, asyncio.TimeoutError, OSError) as exc:
        logger.warning("Redis subscriber stopped: %s", exc)
