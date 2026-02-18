from fastapi import APIRouter, Body, HTTPException
from app.controllers import verification_admin_controller as controller

router = APIRouter(prefix="/admin/verification", tags=["Admin Verification"])

@router.get("/users")
async def fetch_users():
    """
    Fetch all users for admin verification dashboard.
    Users with pending verification docs appear first.
    """
    return await controller.get_all_users()

@router.get("/pending")
async def get_pending_verifications():
    """
    Get all users with pending verification documents
    """
    return await controller.get_pending_verifications()

@router.post("/verify")
async def verify_user(email: str = Body(..., embed=True)):
    """
    Verify a user by email.
    Returns 400 if email is missing or user not found.
    """
    if not email:
        raise HTTPException(status_code=400, detail="Email is required for verification")
    
    try:
        result = await controller.verify_user(email)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/reject")
async def reject_verification(
    email: str = Body(...),
    rejection_reason: str = Body(...)
):
    """
    Reject a user's verification document
    """
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
    
    if not rejection_reason:
        raise HTTPException(status_code=400, detail="Rejection reason is required")
    
    try:
        result = await controller.reject_verification(email, rejection_reason)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/delete")
async def delete_user(email: str = Body(..., embed=True)):
    """
    Delete a user by email.
    Returns 400 if email is missing, 404 if user not found.
    """
    if not email:
        raise HTTPException(status_code=400, detail="Email is required for deletion")
    
    try:
        result = await controller.delete_user(email)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))