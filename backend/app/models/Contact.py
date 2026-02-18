from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
import pytz

ist = pytz.timezone('Asia/Kolkata')

class Contact(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    message: str
    status: Optional[str] = "new"   # new | read | archived
    created_at: Optional[datetime] = Field(default_factory=lambda: datetime.now(ist))
