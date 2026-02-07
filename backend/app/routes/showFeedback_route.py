from fastapi import APIRouter
from app.controllers.showFeedback_controller import get_top_feedbacks

router = APIRouter(prefix="/api/feedbacks", tags=["Feedbacks"])


@router.get("/top")
async def top_feedbacks():
    return await get_top_feedbacks()
