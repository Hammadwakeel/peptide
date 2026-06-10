from __future__ import annotations

import logging
from typing import Any

from services import redis_bus
from services.kafka_bus import publish_chat_event
from services.ws_manager import ws_manager

logger = logging.getLogger("communication-service")


async def push_conversation_event(conversation_id: str, event: dict[str, Any]) -> None:
    """Deliver real-time updates: local WebSocket first, then Redis for other instances."""
    await ws_manager.broadcast_to_conversation(conversation_id, event)
    try:
        await redis_bus.publish_event(conversation_id, event)
    except Exception as exc:
        logger.warning("Redis publish failed: %s", exc)
    try:
        publish_chat_event(event.get("type", "chat.event"), event)
    except Exception as exc:
        logger.debug("Kafka publish skipped: %s", exc)
