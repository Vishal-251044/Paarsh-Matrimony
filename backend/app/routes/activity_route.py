from fastapi import APIRouter, HTTPException, Depends, Request, Body
import logging
from app.database import db
from app.controllers.activitychat_controller import ActivityChatController
from app.utils.auth import verify_token
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/api/activity", tags=["activity"])
logger = logging.getLogger(__name__)

def get_controller():
    return ActivityChatController(db)

# Define Pydantic model for interest request
class InterestRequest(BaseModel):
    sender_email: str
    receiver_email: str
    sender_name: str
    receiver_name: str
    message: Optional[str] = ""
    sender_profile_img: Optional[str] = ""

@router.get("/user/{email}")
async def get_user_activity(
    email: str,
    auth_result: dict = Depends(verify_token)
):
    """Get all activity for a user"""
    controller = get_controller()
    result = await controller.get_user_activity(email)
    
    if not result.get("success", False):
        raise HTTPException(
            status_code=400, 
            detail=result.get("error", "Failed to get user activity")
        )
    
    return {
        "success": True,
        "sent_interests": result.get("sent_interests", []),
        "received_interests": result.get("received_interests", []),
        "reports": result.get("reports", [])
    }

@router.post("/interest")
async def send_interest(
    interest_data: InterestRequest,
    auth_result: dict = Depends(verify_token)
):
    """Send an interest to another user"""
    try:
        
        # Validate required fields
        if not interest_data.sender_email or not interest_data.receiver_email:
            raise HTTPException(status_code=400, detail="Sender and receiver emails are required")
        
        if not interest_data.sender_name or not interest_data.receiver_name:
            raise HTTPException(status_code=400, detail="Sender and receiver names are required")
        
        # Check if trying to send to self
        if interest_data.sender_email == interest_data.receiver_email:
            raise HTTPException(status_code=400, detail="Cannot send interest to yourself")
        
        controller = get_controller()
        result = await controller.send_interest(interest_data.dict())
        
        if not result.get("success", False):
            error_msg = result.get("error", "Failed to send interest")
            logger.error(f"Failed to send interest: {error_msg}")
            raise HTTPException(status_code=400, detail=error_msg)
        
        return {
            "success": True,
            "message": result["message"],
            "interest_id": result.get("interest_id")
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in send_interest: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/interest/{interest_id}/accept")
async def accept_interest(
    interest_id: str,
    request: Request,
    auth_result: dict = Depends(verify_token)
):
    """Accept an interest"""
    try:
        # Validate interest_id
        if not interest_id or interest_id == "None" or interest_id == "null":
            raise HTTPException(status_code=400, detail="Invalid interest ID")
        
        data = await request.json()
        accepter_email = data.get("accepter_email")
        
        if not accepter_email:
            raise HTTPException(status_code=400, detail="accepter_email required")
        
        controller = get_controller()
        result = await controller.accept_interest(interest_id, accepter_email)
        
        if not result.get("success", False):
            raise HTTPException(
                status_code=400, 
                detail=result.get("error", "Failed to accept interest")
            )
        
        return {
            "success": True,
            "message": result["message"],
            "conversation_id": result.get("conversation_id")
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in accept_interest: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/interest/{interest_id}/reject")
async def reject_interest(
    interest_id: str,
    request: Request,
    auth_result: dict = Depends(verify_token)
):
    """Reject an interest"""
    try:
        # Validate interest_id
        if not interest_id or interest_id == "None" or interest_id == "null":
            raise HTTPException(status_code=400, detail="Invalid interest ID")
        
        data = await request.json()
        rejecter_email = data.get("rejecter_email")
        
        if not rejecter_email:
            raise HTTPException(status_code=400, detail="rejecter_email required")
        
        controller = get_controller()
        result = await controller.reject_interest(interest_id, rejecter_email)
        
        if not result.get("success", False):
            raise HTTPException(
                status_code=400, 
                detail=result.get("error", "Failed to reject interest")
            )
        
        return {"success": True, "message": result["message"]}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in reject_interest: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/report")
async def create_report(
    request: Request,
    auth_result: dict = Depends(verify_token)
):
    """Create a report (Available to all users) - One report per user"""
    try:
        report_data = await request.json()
        
        # Validate required fields
        required_fields = ["reporter_email", "reported_email", "reporter_name", "reported_name", "reason"]
        for field in required_fields:
            if not report_data.get(field):
                raise HTTPException(
                    status_code=400, 
                    detail=f"{field} is required"
                )
        
        controller = get_controller()
        result = await controller.create_report(report_data)
        
        if not result.get("success", False):
            # Check for duplicate report error
            if "already reported" in result.get("error", ""):
                raise HTTPException(
                    status_code=400, 
                    detail=result.get("error")
                )
            raise HTTPException(
                status_code=400, 
                detail=result.get("error", "Failed to create report")
            )
        
        return {
            "success": True,
            "message": result["message"],
            "report_id": result.get("report_id"),
            "report": result.get("report")
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in create_report: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

