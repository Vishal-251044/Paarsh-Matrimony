from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict
from enum import Enum

class InterestStatus(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"

class ReportStatus(str, Enum):
    PENDING = "pending"
    UNDER_REVIEW = "under_review"
    RESOLVED = "resolved"
    DISMISSED = "dismissed"

class Interest(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "sender_email": "user1@example.com",
                "receiver_email": "user2@example.com",
                "sender_name": "John Doe",
                "receiver_name": "Jane Smith",
                "message": "Hi, I'm interested in connecting with you.",
                "status": "pending"
            }
        }
    )
    
    id: Optional[str] = Field(None, alias="_id")
    sender_email: str
    receiver_email: str
    sender_name: str
    receiver_name: str
    sender_profile_img: Optional[str] = ""
    receiver_profile_img: Optional[str] = ""
    sender_membership: Optional[str] = "free"  # Track sender's membership at time of interest
    message: Optional[str] = ""
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

class Report(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "reporter_email": "user1@example.com",
                "reported_email": "user2@example.com",
                "reporter_name": "John Doe",
                "reported_name": "Jane Smith",
                "reason": "Fake Profile",
                "description": "This profile seems suspicious"
            }
        }
    )
    
    id: Optional[str] = Field(None, alias="_id")
    reporter_email: str
    reported_email: str
    reporter_name: str
    reported_name: str
    reporter_profile_img: Optional[str] = ""
    reported_profile_img: Optional[str] = ""
    reason: str
    description: Optional[str] = ""
    status: ReportStatus = ReportStatus.PENDING
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

class ActivityResponse(BaseModel):
    success: bool
    message: Optional[str] = None
    data: Optional[dict] = None
    error: Optional[str] = None

class InterestsListResponse(BaseModel):
    success: bool
    sent_interests: List[Interest] = []
    received_interests: List[Interest] = []
    error: Optional[str] = None

class ReportsListResponse(BaseModel):
    success: bool
    reports: List[Report] = []
    error: Optional[str] = None

class UserActivityResponse(BaseModel):
    success: bool
    sent_interests: List[Interest] = []
    received_interests: List[Interest] = []
    reports: List[Report] = []
    error: Optional[str] = None