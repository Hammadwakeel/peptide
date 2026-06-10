from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi

from config import PORT
from db import close_connector
from routes import api_router
from services import kafka_bus, mongo, redis_bus
from services.kafka_bus import kafka_to_redis_handler
from services.mongo import close_mongo, connect_mongo
from services.redis_bus import close_redis, start_redis_subscriber
from services.ws_manager import handle_redis_event


@asynccontextmanager
async def lifespan(_app: FastAPI):
    await connect_mongo()
    await redis_bus.connect_redis()
    await start_redis_subscriber(handle_redis_event)
    try:
        await kafka_bus.start_kafka_consumer(kafka_to_redis_handler)
    except Exception as exc:
        import logging

        logging.getLogger("communication-service").warning(
            "Kafka consumer failed to start (chat REST/WebSocket still work): %s",
            exc,
        )
    yield
    await kafka_bus.stop_kafka_consumer()
    await close_redis()
    await close_mongo()
    close_connector()


app = FastAPI(
    title="Frontier Nexus Rx — Communication Service",
    description=(
        "Provider–patient chat with MongoDB messages, Redis real-time fan-out, and Kafka events.\n\n"
        "Use token from identity-service **POST /auth/login** → **Authorize** button."
    ),
    version="1.0.0",
    swagger_ui_parameters={"persistAuthorization": True},
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )
    schema.setdefault("components", {}).setdefault("securitySchemes", {})["BearerAuth"] = {
        "type": "http",
        "scheme": "bearer",
        "bearerFormat": "JWT",
        "description": "JWT from identity-service POST /auth/login",
    }
    app.openapi_schema = schema
    return app.openapi_schema


app.openapi = custom_openapi


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=True)
