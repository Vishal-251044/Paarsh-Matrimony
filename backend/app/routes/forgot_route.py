from fastapi import APIRouter
from pydantic import BaseModel, EmailStr
from app.controllers.forgot_controller import ForgotController

router = APIRouter()
controller = ForgotController()

class ForgotRequest(BaseModel):
    email: EmailStr

@router.post("/forgot-password")
async def forgot_password(data: ForgotRequest):
    return await controller.send_password_email(data.email)