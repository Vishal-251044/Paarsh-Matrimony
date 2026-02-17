from fastapi import APIRouter, HTTPException, Depends, Query, Request
from fastapi.responses import Response
import logging
from app.database import db
from app.controllers.activitychat_controller import ActivityChatController
from app.models.Chat import ChatMessage
from app.utils.auth import verify_token

router = APIRouter(prefix="/api/chat", tags=["chat"])
logger = logging.getLogger(__name__)

def get_controller():
    return ActivityChatController(db)

@router.get("/user/{email}")
async def get_user_conversations(
    email: str,
    auth_result: dict = Depends(verify_token)
):
    """Get all conversations for a user (Available to all users with accepted interests)"""
    controller = get_controller()
    result = await controller.get_user_conversations(email)
    
    if not result.get("success", False):
        # Remove premium check since all users can access chats after acceptance
        raise HTTPException(
            status_code=400, 
            detail=result.get("error", "Failed to get conversations")
        )
    
    return {"success": True, "conversations": result.get("conversations", [])}

@router.post("/message")
async def send_message(
    request: Request,
    auth_result: dict = Depends(verify_token)
):
    """Send a message in a conversation (Available to all users with accepted interests)"""
    try:
        message_data = await request.json()
        
        # Validate required fields
        if not message_data.get("conversation_id") or not message_data.get("content") or not message_data.get("sender_email"):
            raise HTTPException(status_code=400, detail="Missing required fields: conversation_id, content, and sender_email are required")
        
        controller = get_controller()
        result = await controller.send_message(message_data)
        
        if not result.get("success", False):
            raise HTTPException(
                status_code=400, 
                detail=result.get("error", "Failed to send message")
            )
        
        return {"success": True, "message": result.get("message")}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in send_message: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/messages/{conversation_id}")
async def get_conversation_messages(
    conversation_id: str,
    user_email: str = Query(..., description="User email"),
    auth_result: dict = Depends(verify_token)
):
    """Get messages in a conversation (Available to all users with accepted interests)"""
    controller = get_controller()
    result = await controller.get_conversation_messages(conversation_id, user_email)
    
    if not result.get("success", False):
        raise HTTPException(
            status_code=400, 
            detail=result.get("error", "Failed to get messages")
        )
    
    return {"success": True, "messages": result.get("messages", [])}

@router.delete("/conversation/{conversation_id}/clear")
async def clear_conversation(
    conversation_id: str,
    user_email: str = Query(..., description="User email"),
    auth_result: dict = Depends(verify_token)
):
    """Clear all messages in a conversation but keep the conversation (Available to all users)"""
    controller = get_controller()
    result = await controller.clear_conversation(conversation_id, user_email)
    
    if not result.get("success", False):
        raise HTTPException(
            status_code=400, 
            detail=result.get("error", "Failed to clear conversation")
        )
    
    return {
        "success": True, 
        "message": result["message"],
        "cleared_count": result.get("cleared_count", 0)
    }

@router.get("/export/{conversation_id}")
async def export_conversation(
    conversation_id: str,
    user_email: str = Query(..., description="User email"),
    auth_result: dict = Depends(verify_token)
):
    """Export conversation as text file (Available to all users)"""
    controller = get_controller()
    result = await controller.export_conversation(conversation_id, user_email)
    
    if not result.get("success", False):
        raise HTTPException(
            status_code=400, 
            detail=result.get("error", "Failed to export conversation")
        )
    
    # Return as text file
    return Response(
        content=result["content"],
        media_type="text/plain",
        headers={
            "Content-Disposition": f"attachment; filename=chat_export_{conversation_id}.txt"
        }
    )