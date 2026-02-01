# app/models/Feedback.py
from datetime import datetime
from pydantic import BaseModel, Field, validator
from typing import Optional
from bson import ObjectId

class Feedback(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    email: str = Field(..., description="User's email address")
    experience: str = Field(..., description="User's experience feedback")
    rating: int = Field(..., ge=1, le=5, description="Rating from 1 to 5 stars")
    suggestions: Optional[str] = Field(None, description="Suggestions for improvement")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        json_encoders = {
            ObjectId: str,
            datetime: lambda dt: dt.isoformat()
        }
        schema_extra = {
            "example": {
                "email": "user@example.com",
                "experience": "Great experience using the platform!",
                "rating": 5,
                "suggestions": "Add more filter options.",
                "created_at": "2024-01-15T10:30:00Z"
            }
        }
    
    @validator('experience', 'suggestions')
    def trim_strings(cls, v):
        if v is not None:
            return v.strip()
        return v