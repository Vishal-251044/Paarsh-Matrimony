from fastapi import APIRouter
from app.database import db

router = APIRouter()

@router.get("/get-profile")
async def get_profile(email: str):
    profile = await db.profiles.find_one({"email": email}, {"_id": 0})
    if not profile:
        return {"success": False}
    return {"success": True, "profile": profile}
