from fastapi import APIRouter, HTTPException
from app.controllers.feedback_admin_controller import (
    get_all_feedbacks,
    delete_feedback,
)

router = APIRouter(prefix="/api/admin/feedbacks", tags=["Admin Feedback"])


@router.get("/")
async def fetch_feedbacks():
    return await get_all_feedbacks()


@router.delete("/{feedback_id}")
async def remove_feedback(feedback_id: str):
    deleted = await delete_feedback(feedback_id)
    if deleted == 0:
        raise HTTPException(status_code=404, detail="Feedback not found")
    return {"message": "Deleted successfully"}
