from fastapi import APIRouter, Depends
from app.controllers.delete_controller import delete_user_complete_data
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

router = APIRouter()
security = HTTPBearer()

# Optional: add JWT validation here if you already have auth middleware
@router.delete("/profile/delete/{email}")
async def delete_profile(
    email: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    return await delete_user_complete_data(email)
