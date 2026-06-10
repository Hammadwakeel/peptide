from __future__ import annotations

import asyncio
import json
import uuid
from collections.abc import Awaitable, Callable
from typing import Any

import logging

from confluent_kafka import Consumer, KafkaException, Producer
from confluent_kafka.admin import AdminClient

logger = logging.getLogger("communication-service")

from config import (
    KAFKA_BOOTSTRAP_SERVERS,
    KAFKA_CONSUMER_GROUP,
    KAFKA_PASSWORD,
    KAFKA_SSL_CA_LOCATION,
    KAFKA_SSL_ENDPOINT_ALGORITHM,
    KAFKA_SSL_VERIFY,
    KAFKA_TOPIC,
    KAFKA_USERNAME,
)
from services import redis_bus

_producer: Producer | None = None
_consumer: Consumer | None = None
_consumer_task: asyncio.Task | None = None
_event_handler: Callable[[dict[str, Any]], Awaitable[None]] | None = None


def _kafka_config() -> dict[str, str]:
    config: dict[str, str] = {
        "bootstrap.servers": KAFKA_BOOTSTRAP_SERVERS,
        "security.protocol": "SASL_SSL",
        "sasl.mechanisms": "PLAIN",
        "sasl.username": KAFKA_USERNAME,
        "sasl.password": KAFKA_PASSWORD,
        "enable.ssl.certificate.verification": "true" if KAFKA_SSL_VERIFY else "false",
    }
    if KAFKA_SSL_CA_LOCATION and KAFKA_SSL_VERIFY:
        config["ssl.ca.location"] = KAFKA_SSL_CA_LOCATION
    if KAFKA_SSL_ENDPOINT_ALGORITHM:
        config["ssl.endpoint.identification.algorithm"] = KAFKA_SSL_ENDPOINT_ALGORITHM
    return config


def get_producer() -> Producer:
    global _producer
    if _producer is None:
        _producer = Producer({**_kafka_config(), "client.id": f"communication-producer-{uuid.uuid4().hex[:8]}"})
    return _producer


def publish_chat_event(event_type: str, payload: dict[str, Any]) -> None:
    producer = get_producer()
    message = {"type": event_type, **payload}
    producer.produce(
        KAFKA_TOPIC,
        key=str(payload.get("conversation_id", "")).encode(),
        value=json.dumps(message).encode(),
    )
    producer.poll(0)


async def start_kafka_consumer(handler: Callable[[dict[str, Any]], Awaitable[None]]) -> None:
    global _consumer, _consumer_task, _event_handler
    _event_handler = handler
    if _consumer_task is not None:
        return

    verify_kafka_connection()

    _consumer = Consumer(
        {
            **_kafka_config(),
            "group.id": KAFKA_CONSUMER_GROUP,
            "auto.offset.reset": "latest",
            "enable.auto.commit": True,
        }
    )
    _consumer.subscribe([KAFKA_TOPIC])
    _consumer_task = asyncio.create_task(_consumer_loop())


async def stop_kafka_consumer() -> None:
    global _consumer, _consumer_task
    if _consumer_task is not None:
        _consumer_task.cancel()
        try:
            await _consumer_task
        except asyncio.CancelledError:
            pass
        _consumer_task = None
    if _consumer is not None:
        _consumer.close()
        _consumer = None


async def _consumer_loop() -> None:
    assert _consumer is not None
    loop = asyncio.get_running_loop()
    while True:
        msg = await loop.run_in_executor(None, _consumer.poll, 1.0)
        if msg is None:
            await asyncio.sleep(0.05)
            continue
        if msg.error():
            raise KafkaException(msg.error())
        try:
            event = json.loads(msg.value().decode())
        except (json.JSONDecodeError, AttributeError):
            continue
        if _event_handler:
            await _event_handler(event)


async def kafka_to_redis_handler(event: dict[str, Any]) -> None:
    conversation_id = event.get("conversation_id")
    if not conversation_id:
        return
    await redis_bus.publish_event(conversation_id, event)


def verify_kafka_connection() -> None:
    """Fail fast at startup if broker credentials or network are wrong."""
    admin = AdminClient(_kafka_config())
    metadata = admin.list_topics(timeout=10)
    topics = list(metadata.topics.keys())
    logger.info("Kafka connected — topics sample: %s", topics[:5])
