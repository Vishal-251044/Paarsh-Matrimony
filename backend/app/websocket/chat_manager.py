import json
import logging
from typing import Dict, Optional
from fastapi import WebSocket
from datetime import datetime

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.user_info: Dict[str, dict] = {}  # Store user metadata

    async def connect(self, websocket: WebSocket, user_email: str, membership_type: str = "free"):
        """Connect a user to the websocket"""
        # Disconnect existing connection if any
        if user_email in self.active_connections:
            await self.disconnect(user_email)
        
        self.active_connections[user_email] = websocket
        self.user_info[user_email] = {
            "connected_at": datetime.now().isoformat(),
            "membership_type": membership_type,
            "last_activity": datetime.now().isoformat()
        }
        return True

    async def disconnect(self, user_email: str):
        """Disconnect a user"""
        try:
            if user_email in self.active_connections:
                # Just remove from dictionary, don't try to close
                del self.active_connections[user_email]
            
            if user_email in self.user_info:
                del self.user_info[user_email]
        except Exception:
            # Silently ignore any errors during disconnect
            pass

    async def send_personal_message(self, message: dict, user_email: str) -> bool:
        """Send a message to a specific user"""
        if user_email not in self.active_connections:
            return False
            
        try:
            websocket = self.active_connections[user_email]
            await websocket.send_json(message)
            # Update last activity
            if user_email in self.user_info:
                self.user_info[user_email]["last_activity"] = datetime.now().isoformat()
            return True
        except Exception:
            # Remove dead connection on any error
            await self.disconnect(user_email)
            return False

    def is_connected(self, user_email: str) -> bool:
        """Check if user is connected"""
        return user_email in self.active_connections

    def get_connection_count(self) -> int:
        """Get total number of active connections"""
        return len(self.active_connections)

    def get_user_info(self, user_email: str) -> Optional[dict]:
        """Get user connection info"""
        return self.user_info.get(user_email)

    async def disconnect_all(self):
        """Disconnect all users (for server shutdown)"""
        for user_email in list(self.active_connections.keys()):
            await self.disconnect(user_email)

# Create a single instance
manager = ConnectionManager()