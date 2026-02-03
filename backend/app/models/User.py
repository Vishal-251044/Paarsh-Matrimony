from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional

# Pydantic models
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    google_id: Optional[str] = None
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "name": "John Doe",
                "email": "john@example.com",
                "password": "securepassword123",
                "google_id": "google_123456"
            }
        }
    )

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "email": "john@example.com",
                "password": "securepassword123"
            }
        }
    )

class UserOut(BaseModel):
    id: str
    name: str
    email: EmailStr
    google_id: Optional[str] = None
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "id": "507f1f77bcf86cd799439011",
                "name": "John Doe",
                "email": "john@example.com",
                "google_id": "google_123456"
            }
        }
    )

# MongoDB document model (unchanged - this is just a function)
def user_db_model(name: str, email: str, password: str, google_id: Optional[str] = None):
    return {
        "name": name,
        "email": email,
        "password": password,
        "google_id": google_id,
    }