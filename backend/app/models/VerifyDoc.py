from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime
from enum import Enum

class DocumentType(str, Enum):
    AADHAR = "aadhar"
    PAN = "pan"
    DRIVING_LICENSE = "driving_license"

class VerificationStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class VerificationDocument(BaseModel):
    email: EmailStr
    documentType: DocumentType
    documentNumber: str
    documentImageUrl: str
    status: VerificationStatus = VerificationStatus.PENDING
    rejectionReason: Optional[str] = None
    submittedAt: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        arbitrary_types_allowed = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class VerificationResponse(BaseModel):
    id: str
    email: EmailStr
    documentType: DocumentType
    documentNumber: str
    documentImageUrl: str
    status: VerificationStatus
    rejectionReason: Optional[str] = None
    submittedAt: datetime

class VerificationStatusResponse(BaseModel):
    status: VerificationStatus
    documentType: Optional[DocumentType] = None
    documentNumber: Optional[str] = None
    rejectionReason: Optional[str] = None
    submittedAt: Optional[datetime] = None