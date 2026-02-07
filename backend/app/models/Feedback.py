from datetime import datetime
from pydantic import BaseModel, Field, validator, ConfigDict, field_serializer
from typing import Optional
from bson import ObjectId

class Feedback(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
        json_schema_extra={
            "example": {
                "email": "user@example.com",
                "experience": "Great experience using the platform!",
                "rating": 5,
                "suggestions": "Add more filter options.",
                "created_at": "2024-01-15T10:30:00Z"
            }
        }
    )
    
    id: Optional[str] = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    email: str = Field(..., description="User's email address")
    experience: str = Field(..., description="User's experience feedback")
    rating: int = Field(..., ge=1, le=5, description="Rating from 1 to 5 stars")
    suggestions: Optional[str] = Field(None, description="Suggestions for improvement")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    @field_serializer('created_at')
    def serialize_datetime(self, dt: datetime, _info):
        return dt.isoformat()
    
    @field_serializer('id', when_used='json')
    def serialize_objectid(self, obj_id: Optional[str], _info):
        return str(obj_id) if obj_id else None
    
    @validator('experience', 'suggestions')
    def trim_strings(cls, v):
        if v is not None:
            return v.strip()
        return v