from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime
from typing import Optional


# -------- REQUEST OTP --------
class OTPRequest(BaseModel):
    email: EmailStr

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "email": "xyz@example.com"
            }
        }
    )


# -------- VERIFY OTP --------
class OTPVerify(BaseModel):
    email: EmailStr
    otp: str

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "email": "xyz@example.com",
                "otp": "123456"
            }
        }
    )


# -------- OTP DB DOCUMENT MODEL --------
def otp_db_model(email: str, otp: str, expires_at: datetime):
    return {
        "email": email,
        "otp": otp,
        "expires_at": expires_at,
        "verified": False,
    }
