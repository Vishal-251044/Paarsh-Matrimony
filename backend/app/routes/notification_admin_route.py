from fastapi import APIRouter, Query
from app.controllers.notification_admin_controller import get_users_by_type, send_notification

router = APIRouter(prefix="/admin/notifications", tags=["Admin Notifications"])


@router.get("/users")
async def users_list(type: str = Query(..., description="free, premium, hidden, published")):
    return await get_users_by_type(type)


@router.post("/send")
async def send_message(type: str, message: str):
    return await send_notification(type, message)
