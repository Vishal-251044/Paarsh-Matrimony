from fastapi import APIRouter
from app.controllers.marriageAssistance_controller import marriage_assistance

router = APIRouter()

@router.post("/marriage-assistance")
async def marriage_ai(data: dict):
    return await marriage_assistance(data)
