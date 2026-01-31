from fastapi import APIRouter, HTTPException
from app.models.User import UserCreate, UserLogin
from app.controllers import auth_controller
from app.controllers.auth_controller import GoogleToken  # Import the schema

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/signup")
async def signup(user: UserCreate):
    return await auth_controller.signup(user)


@router.post("/login")
async def login(user: UserLogin):
    return await auth_controller.login(user)


@router.post("/google")
async def google_auth(google_token: GoogleToken):
    # Make sure you're calling the function from auth_controller
    return await auth_controller.google_login(google_token)


@router.put("/set-password")
async def set_password_route(payload: dict):
    email = payload.get("email")
    new_password = payload.get("new_password")
    if not email or not new_password:
        raise HTTPException(400, "Email and new password are required")

    return await auth_controller.set_password(email, new_password)