from fastapi import APIRouter, HTTPException, status
from app.models.User import UserCreate, UserLogin
from app.controllers import auth_controller
from app.controllers.auth_controller import GoogleToken
from app.models.OTP import OTPRequest, OTPVerify
from app.database import db
import bcrypt

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


@router.put("/update-password")
async def update_password_route(payload: dict):
    """
    Update user password with old password verification
    Expected payload: {
        "email": "user@example.com",
        "old_password": "currentPassword",
        "new_password": "newSecurePassword"
    }
    """
    email = payload.get("email")
    old_password = payload.get("old_password")
    new_password = payload.get("new_password")

    if not email or not old_password or not new_password:
        raise HTTPException(
            status_code=400,
            detail="Email, old password and new password are required"
        )

    if len(new_password) < 8:
        raise HTTPException(
            status_code=400,
            detail="New password must be at least 8 characters"
        )

    # Direct database operation without controller
    try:
        # Find user by email
        user = await db.users.find_one({"email": email})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Check if user has password (not Google-only user)
        if not user.get("password"):
            raise HTTPException(
                status_code=400, 
                detail="This account uses Google login. Cannot set password directly."
            )

        # Verify old password
        if not bcrypt.checkpw(
            old_password.encode(),
            user["password"].encode()
        ):
            raise HTTPException(status_code=401, detail="Current password is incorrect")

        # Hash new password
        hashed_pw = bcrypt.hashpw(
            new_password.encode(),
            bcrypt.gensalt()
        ).decode()

        # Update password in database
        from datetime import datetime
        import pytz
        IST = pytz.timezone("Asia/Kolkata")
        
        await db.users.update_one(
            {"_id": user["_id"]},
            {
                "$set": {
                    "password": hashed_pw,
                    "updated_at": datetime.now(IST)
                }
            }
        )

        return {"message": "Password updated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Update password error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

