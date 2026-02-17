from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, status
import json
import logging
from datetime import datetime
from bson import ObjectId
from app.websocket.chat_manager import manager
from app.database import db
from app.controllers.activitychat_controller import ActivityChatController
from app.utils.auth import verify_websocket_token

router = APIRouter()
logger = logging.getLogger(__name__)

@router.websocket("/ws/chat/{user_email}")
async def websocket_chat_endpoint(
    websocket: WebSocket, 
    user_email: str,
    token: str = Query(...)
):
    # Accept the connection first
    await websocket.accept()
    
    # Verify token
    try:
        payload = await verify_websocket_token(token)
        if not payload:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return
        
        # Get user details from database
        user_id = payload.get("user_id")
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        
        if not user:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return
        
        # Verify email matches
        if user.get("email") != user_email:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return
        
        # Get membership type
        membership_type = user.get("membershipType", "free")
        
        # Add to connection manager
        await manager.connect(websocket, user_email, membership_type)
        
        # Send connection confirmation
        await manager.send_personal_message({
            "type": "connection_established",
            "message": "Connected to chat server",
            "membership_type": membership_type,
            "timestamp": datetime.now().isoformat()
        }, user_email)
        
    except WebSocketDisconnect:
        await manager.disconnect(user_email)
        return
    except Exception:
        # Silently handle authentication errors
        await manager.disconnect(user_email)
        return
    
    # Main message loop
    try:
        while True:
            try:
                data = await websocket.receive_text()
            except WebSocketDisconnect:
                break
            except Exception:
                # Silently handle receive errors
                break
            
            try:
                message_data = json.loads(data)
                message_type = message_data.get("type")
                
                if message_type == "ping":
                    # Heartbeat
                    await manager.send_personal_message({
                        "type": "pong",
                        "timestamp": datetime.now().isoformat()
                    }, user_email)
                
                elif message_type == "send_message":
                    # Handle new message
                    await handle_send_message(message_data, user_email)
                
                elif message_type == "mark_read":
                    # Handle mark as read
                    await handle_mark_read(message_data, user_email)
                
                elif message_type == "typing":
                    # Handle typing indicator
                    await handle_typing(message_data, user_email)
                
                # Ignore all other message types silently
                    
            except json.JSONDecodeError:
                # Silently ignore JSON errors
                pass
            except Exception:
                # Silently ignore other errors in message processing
                pass
                
    except Exception:
        # Silently ignore any other errors
        pass
    finally:
        # Clean up
        await manager.disconnect(user_email)

# Helper functions to handle different message types
async def handle_send_message(message_data: dict, user_email: str):
    """Handle sending a message"""
    conversation_id = message_data.get("conversation_id")
    content = message_data.get("content")
    temp_id = message_data.get("temp_id")
    
    if not conversation_id or not content:
        await manager.send_personal_message({
            "type": "error",
            "message": "Missing conversation_id or content",
            "temp_id": temp_id
        }, user_email)
        return
    
    # Save to database
    controller = ActivityChatController(db)
    
    result = await controller.send_message({
        "conversation_id": conversation_id,
        "sender_email": user_email,
        "content": content
    })
    
    if result.get("success"):
        # Get conversation to find other participants
        conversation = await controller.conversations_collection.find_one({
            "_id": ObjectId(conversation_id)
        })
        
        if conversation:
            message_data_response = result["message"]
            
            # Send to other participants (only if they are connected)
            for participant in conversation["participants"]:
                if participant["email"] != user_email and manager.is_connected(participant["email"]):
                    await manager.send_personal_message({
                        "type": "new_message",
                        "conversation_id": conversation_id,
                        "message": message_data_response
                    }, participant["email"])
            
            # Send acknowledgment to sender with the temp_id
            if manager.is_connected(user_email):
                await manager.send_personal_message({
                    "type": "message_sent",
                    "conversation_id": conversation_id,
                    "message": message_data_response,
                    "temp_id": temp_id
                }, user_email)
    else:
        # Send error to sender if connected
        if manager.is_connected(user_email):
            await manager.send_personal_message({
                "type": "error",
                "message": result.get("error", "Failed to send message"),
                "temp_id": temp_id
            }, user_email)

async def handle_mark_read(message_data: dict, user_email: str):
    """Handle marking messages as read"""
    conversation_id = message_data.get("conversation_id")
    
    if not conversation_id:
        return
    
    controller = ActivityChatController(db)
    
    # Verify conversation access
    conversation = await controller.conversations_collection.find_one({
        "_id": ObjectId(conversation_id),
        "participants.email": user_email
    })
    
    if conversation:
        await controller.messages_collection.update_many(
            {
                "conversation_id": conversation_id,
                "sender_email": {"$ne": user_email},
                "read": False
            },
            {
                "$set": {
                    "read": True,
                    "read_at": datetime.now()
                }
            }
        )
        
        # Reset unread count
        await controller.conversations_collection.update_one(
            {"_id": ObjectId(conversation_id)},
            {"$set": {f"unread_count.{user_email}": 0}}
        )
        
        # Notify other participants that messages were read (only if connected)
        for participant in conversation["participants"]:
            if participant["email"] != user_email and manager.is_connected(participant["email"]):
                await manager.send_personal_message({
                    "type": "messages_read",
                    "conversation_id": conversation_id,
                    "read_by": user_email,
                    "read_at": datetime.now().isoformat()
                }, participant["email"])

async def handle_typing(message_data: dict, user_email: str):
    """Handle typing indicator"""
    conversation_id = message_data.get("conversation_id")
    is_typing = message_data.get("is_typing", False)
    
    if not conversation_id:
        return
    
    controller = ActivityChatController(db)
    conversation = await controller.conversations_collection.find_one({
        "_id": ObjectId(conversation_id),
        "participants.email": user_email
    })
    
    if conversation:
        for participant in conversation["participants"]:
            if participant["email"] != user_email and manager.is_connected(participant["email"]):
                await manager.send_personal_message({
                    "type": "typing",
                    "conversation_id": conversation_id,
                    "user_email": user_email,
                    "is_typing": is_typing
                }, participant["email"])