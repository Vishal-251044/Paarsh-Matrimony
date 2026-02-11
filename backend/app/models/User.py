from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional
from datetime import datetime


# ---------------- USER CREATE ----------------
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    google_id: Optional[str] = None

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "name": "xyz",
                "email": "xyz@example.com",
                "password": "securepassword123",
                "google_id": "google_123456"
            }
        }
    )


# ---------------- USER LOGIN ----------------
class UserLogin(BaseModel):
    email: EmailStr
    password: str

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "email": "xyz@example.com",
                "password": "securepassword123"
            }
        }
    )


# ---------------- USER OUT ----------------
class UserOut(BaseModel):
    id: str
    name: str
    email: EmailStr
    google_id: Optional[str] = None
    is_online: Optional[bool] = False
    last_seen: Optional[datetime] = None

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "id": "507f1f77bcf86cd799439011",
                "name": "xyz",
                "email": "xyz@example.com",
                "google_id": "google_123456",
                "is_online": True,
                "last_seen": "2026-01-01T10:30:00Z"
            }
        }
    )


# ---------------- MONGODB DOCUMENT MODEL ----------------
def user_db_model(
    name: str,
    email: str,
    password: str,
    google_id: Optional[str] = None
):
    return {
        "name": name,
        "email": email,
        "password": password,
        "google_id": google_id,
        "is_online": False,
        "last_seen": None,
    }
