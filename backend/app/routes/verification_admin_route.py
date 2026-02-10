# verification_admin_route.py
from fastapi import APIRouter, Body, HTTPException
from app.controllers import verification_admin_controller as controller

router = APIRouter(prefix="/admin/verification", tags=["Admin Verification"])

@router.get("/users")
async def fetch_users():
    """
    Fetch all users for admin verification dashboard.
    """
    return await controller.get_all_users()


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
        if not result:
            raise HTTPException(status_code=404, detail=f"User with email '{email}' not found or already verified")
        return {"success": True, "email": email, "message": "User verified successfully"}
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
        if not result:
            raise HTTPException(status_code=404, detail=f"User with email '{email}' not found")
        return {"success": True, "email": email, "message": "User deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
