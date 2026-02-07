from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class Contact(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    message: str
    created_at: Optional[datetime] = None
