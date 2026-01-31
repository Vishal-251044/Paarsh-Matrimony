from pydantic import BaseModel, EmailStr
from typing import Optional

# Pydantic models
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    google_id: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: str
    name: str
    email: EmailStr
    google_id: Optional[str] = None

# MongoDB document model
def user_db_model(name: str, email: str, password: str, google_id: Optional[str] = None):
    return {
        "name": name,
        "email": email,
        "password": password,
        "google_id": google_id,
    }
