import json
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query

logger = logging.getLogger(__name__)

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        # user_id -> List[WebSocket]
        self.user_connections: Dict[str, List[WebSocket]] = {}
        # session_id -> List[WebSocket]
        self.session_connections: Dict[str, List[WebSocket]] = {}
        # room_id -> Dict[WebSocket, Dict[str, Any]] (storing peer info: user_id, role, name)
        self.telehealth_rooms: Dict[str, Dict[WebSocket, Dict[str, Any]]] = {}

    async def connect_user(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        if user_id not in self.user_connections:
            self.user_connections[user_id] = []
        self.user_connections[user_id].append(websocket)
        logger.info(f"User {user_id} connected to WebSocket")

    def disconnect_user(self, websocket: WebSocket, user_id: str):
        if user_id in self.user_connections:
            if websocket in self.user_connections[user_id]:
                self.user_connections[user_id].remove(websocket)
            if not self.user_connections[user_id]:
                del self.user_connections[user_id]
        logger.info(f"User {user_id} disconnected from WebSocket")

    async def connect_session(self, websocket: WebSocket, session_id: str):
        await websocket.accept()
        if session_id not in self.session_connections:
            self.session_connections[session_id] = []
        self.session_connections[session_id].append(websocket)
        logger.info(f"Socket connected to CareSession {session_id}")

    def disconnect_session(self, websocket: WebSocket, session_id: str):
        if session_id in self.session_connections:
            if websocket in self.session_connections[session_id]:
                self.session_connections[session_id].remove(websocket)
            if not self.session_connections[session_id]:
                del self.session_connections[session_id]
        logger.info(f"Socket disconnected from CareSession {session_id}")

    async def broadcast_to_session(self, session_id: str, message: Any):
        if session_id in self.session_connections:
            text_data = json.dumps(message, default=str) if not isinstance(message, str) else message
            dead_sockets = []
            for ws in self.session_connections[session_id]:
                try:
                    await ws.send_text(text_data)
                except Exception as e:
                    logger.warning(f"Error sending to session socket: {e}")
                    dead_sockets.append(ws)
            for ws in dead_sockets:
                self.disconnect_session(ws, session_id)

    async def send_to_user(self, user_id: str, message: Any):
        if user_id in self.user_connections:
            text_data = json.dumps(message, default=str) if not isinstance(message, str) else message
            dead_sockets = []
            for ws in self.user_connections[user_id]:
                try:
                    await ws.send_text(text_data)
                except Exception as e:
                    logger.warning(f"Error sending to user socket: {e}")
                    dead_sockets.append(ws)
            for ws in dead_sockets:
                self.disconnect_user(ws, user_id)

    async def connect_telehealth(self, websocket: WebSocket, room_id: str, user_info: Dict[str, Any]):
        await websocket.accept()
        if room_id not in self.telehealth_rooms:
            self.telehealth_rooms[room_id] = {}
        self.telehealth_rooms[room_id][websocket] = user_info

        # Send existing peers in room to newly joined user
        existing_peers = [
            info for ws, info in self.telehealth_rooms[room_id].items() if ws != websocket
        ]
        await websocket.send_text(json.dumps({
            "type": "ROOM_STATE",
            "room_id": room_id,
            "peers": existing_peers
        }))

        # Notify other peers in room that a new user joined
        await self.broadcast_to_telehealth(room_id, {
            "type": "PEER_JOINED",
            "peer": user_info
        }, exclude_ws=websocket)

    def disconnect_telehealth(self, websocket: WebSocket, room_id: str) -> Optional[Dict[str, Any]]:
        if room_id in self.telehealth_rooms:
            user_info = self.telehealth_rooms[room_id].pop(websocket, None)
            if not self.telehealth_rooms[room_id]:
                del self.telehealth_rooms[room_id]
            return user_info
        return None

    async def broadcast_to_telehealth(self, room_id: str, message: Any, exclude_ws: Optional[WebSocket] = None):
        if room_id in self.telehealth_rooms:
            text_data = json.dumps(message, default=str) if not isinstance(message, str) else message
            dead_sockets = []
            for ws in list(self.telehealth_rooms[room_id].keys()):
                if ws == exclude_ws:
                    continue
                try:
                    await ws.send_text(text_data)
                except Exception as e:
                    logger.warning(f"Error sending to telehealth room {room_id}: {e}")
                    dead_sockets.append(ws)
            for ws in dead_sockets:
                self.disconnect_telehealth(ws, room_id)

manager = ConnectionManager()

@router.websocket("/telehealth/{room_id}")
async def telehealth_endpoint(
    websocket: WebSocket,
    room_id: str,
    user_id: Optional[str] = Query(None),
    name: Optional[str] = Query(None),
    role: Optional[str] = Query(None)
):
    user_info = {
        "user_id": user_id or "user_" + str(id(websocket)),
        "name": name or "Thành viên",
        "role": role or "GUEST"
    }
    await manager.connect_telehealth(websocket, room_id, user_info)
    try:
        while True:
            data = await websocket.receive_text()
            try:
                msg = json.loads(data)
                msg_type = msg.get("type")

                # WebRTC Signaling relays: OFFER, ANSWER, ICE_CANDIDATE, MEDIA_STATE
                if msg_type in ["OFFER", "ANSWER", "ICE_CANDIDATE", "MEDIA_STATE"]:
                    msg["sender_id"] = user_info["user_id"]
                    msg["sender_name"] = user_info["name"]
                    msg["sender_role"] = user_info["role"]
                    await manager.broadcast_to_telehealth(room_id, msg, exclude_ws=websocket)
                elif msg_type == "CHAT_MESSAGE":
                    msg["sender_id"] = user_info["user_id"]
                    msg["sender_name"] = user_info["name"]
                    msg["sender_role"] = user_info["role"]
                    msg["timestamp"] = datetime.now(timezone.utc).isoformat()
                    # Broadcast chat message to everyone in room including sender
                    await manager.broadcast_to_telehealth(room_id, msg)
                elif msg_type == "PING":
                    await websocket.send_text(json.dumps({"type": "PONG"}))
            except json.JSONDecodeError:
                pass
    except WebSocketDisconnect:
        left_user = manager.disconnect_telehealth(websocket, room_id)
        if left_user:
            await manager.broadcast_to_telehealth(room_id, {
                "type": "PEER_LEFT",
                "peer": left_user
            })

@router.websocket("/care-sessions/{session_id}")
async def care_session_ws(websocket: WebSocket, session_id: str):
    await manager.connect_session(websocket, session_id)
    try:
        # Send initial ACK
        await websocket.send_text(json.dumps({"type": "CONNECTED", "session_id": session_id}))
        while True:
            data = await websocket.receive_text()
            # Echo or handle ping
            await websocket.send_text(json.dumps({"type": "PONG", "payload": data}))
    except WebSocketDisconnect:
        manager.disconnect_session(websocket, session_id)

@router.websocket("/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await manager.connect_user(websocket, user_id)
    try:
        await websocket.send_text(json.dumps({"type": "CONNECTED", "user_id": user_id}))
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(json.dumps({"type": "PONG", "payload": data}))
    except WebSocketDisconnect:
        manager.disconnect_user(websocket, user_id)

