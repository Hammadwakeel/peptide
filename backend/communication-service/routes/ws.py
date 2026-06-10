import json
import logging

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from auth_utils import decode_access_token
from services.conversation_service import get_conversation_if_allowed, list_conversation_ids_for_user
from services.ws_manager import ws_manager

router = APIRouter(tags=["websocket"])
logger = logging.getLogger("communication-service")


async def _auto_subscribe_user_conversations(websocket: WebSocket, user: dict) -> list[str]:
    conversation_ids = list_conversation_ids_for_user(user)
    for conversation_id in conversation_ids:
        await ws_manager.subscribe(websocket, conversation_id)
    if conversation_ids:
        logger.info(
            "WS auto-subscribed user %s to %d conversation(s)",
            user.get("sub"),
            len(conversation_ids),
        )
    return conversation_ids


@router.websocket("/ws/chat")
async def chat_websocket(websocket: WebSocket) -> None:
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=4401)
        return

    try:
        user = decode_access_token(token)
    except Exception:
        await websocket.close(code=4401)
        return

    user_id = user["sub"]
    await ws_manager.connect(websocket, user_id)
    subscribed = await _auto_subscribe_user_conversations(websocket, user)
    await websocket.send_text(
        json.dumps({"type": "ready", "conversation_ids": subscribed})
    )

    try:
        while True:
            raw = await websocket.receive_text()
            try:
                payload = json.loads(raw)
            except json.JSONDecodeError:
                continue

            action = payload.get("action")
            conversation_id = payload.get("conversation_id")
            if action == "subscribe" and conversation_id:
                try:
                    await get_conversation_if_allowed(user, conversation_id)
                    await ws_manager.subscribe(websocket, conversation_id)
                    await websocket.send_text(
                        json.dumps({"type": "subscribed", "conversation_id": conversation_id})
                    )
                except Exception as exc:
                    await websocket.send_text(json.dumps({"type": "error", "message": str(exc)}))
            elif action == "unsubscribe" and conversation_id:
                await ws_manager.unsubscribe(websocket, conversation_id)
    except WebSocketDisconnect:
        pass
    finally:
        await ws_manager.disconnect(websocket, user_id)
