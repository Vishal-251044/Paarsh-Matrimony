from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class Contact(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    message: str
    status: Optional[str] = "new"   # new | read | archived
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
