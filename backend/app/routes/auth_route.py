from fastapi import APIRouter, HTTPException, status
from app.models.User import UserCreate, UserLogin
from app.controllers import auth_controller
from app.controllers.auth_controller import GoogleToken
from app.models.OTP import OTPRequest, OTPVerify

router = APIRouter(prefix="/auth", tags=["Auth"])


# ---------------- SIGNUP ----------------
@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup(user: UserCreate):
    return await auth_controller.signup(user)


# ---------------- LOGIN ----------------
@router.post("/login")
async def login(user: UserLogin):
    return await auth_controller.login(user)


# ---------------- GOOGLE LOGIN ----------------
@router.post("/google")
async def google_auth(google_token: GoogleToken):
    return await auth_controller.google_login(google_token)


# ---------------- SET PASSWORD ----------------
@router.put("/set-password")
async def set_password_route(payload: dict):
    email = payload.get("email")
    new_password = payload.get("new_password")

    if not email or not new_password:
        raise HTTPException(
            status_code=400,
            detail="Email and new password are required"
        )

    return await auth_controller.set_password(email, new_password)


@router.post("/send-otp")
async def send_otp_route(payload: OTPRequest):
    return await auth_controller.send_otp(payload.email)

@router.post("/verify-otp")
async def verify_otp_route(payload: OTPVerify):
    return await auth_controller.verify_otp(payload.email, payload.otp)


# ---------------- LOGOUT ----------------
@router.post("/logout")
async def logout_route(payload: dict):
    user_id = payload.get("user_id")

    if not user_id:
        raise HTTPException(
            status_code=400,
            detail="User ID required"
        )

    return await auth_controller.logout(user_id)
