from __future__ import annotations

import asyncio
import json
from typing import Any

from fastapi import WebSocket


class ConnectionManager:
    def __init__(self) -> None:
        self._connections: dict[str, set[WebSocket]] = {}
        self._user_connections: dict[str, set[WebSocket]] = {}
        self._lock = asyncio.Lock()

    async def connect(self, websocket: WebSocket, user_id: str) -> None:
        await websocket.accept()
        async with self._lock:
            self._user_connections.setdefault(user_id, set()).add(websocket)

    async def disconnect(self, websocket: WebSocket, user_id: str) -> None:
        async with self._lock:
            user_set = self._user_connections.get(user_id)
            if user_set and websocket in user_set:
                user_set.remove(websocket)
            if user_set is not None and not user_set:
                self._user_connections.pop(user_id, None)
            for conversation_id, sockets in list(self._connections.items()):
                if websocket in sockets:
                    sockets.remove(websocket)
                if not sockets:
                    self._connections.pop(conversation_id, None)

    async def subscribe(self, websocket: WebSocket, conversation_id: str) -> None:
        async with self._lock:
            self._connections.setdefault(conversation_id, set()).add(websocket)

    async def unsubscribe(self, websocket: WebSocket, conversation_id: str) -> None:
        async with self._lock:
            sockets = self._connections.get(conversation_id)
            if sockets and websocket in sockets:
                sockets.remove(websocket)
            if sockets is not None and not sockets:
                self._connections.pop(conversation_id, None)

    async def broadcast_to_conversation(self, conversation_id: str, event: dict[str, Any]) -> None:
        async with self._lock:
            sockets = list(self._connections.get(conversation_id, set()))
        payload = json.dumps(event)
        dead: list[WebSocket] = []
        for websocket in sockets:
            try:
                await websocket.send_text(payload)
            except Exception:
                dead.append(websocket)
        for websocket in dead:
            await self.disconnect(websocket, "")


ws_manager = ConnectionManager()


async def handle_redis_event(event: dict[str, Any]) -> None:
    conversation_id = event.get("conversation_id")
    if not conversation_id:
        return
    await ws_manager.broadcast_to_conversation(conversation_id, event)
