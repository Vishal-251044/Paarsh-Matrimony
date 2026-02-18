from pydantic import BaseModel, EmailStr, Field, ConfigDict, field_validator, field_serializer
from datetime import datetime
import pytz
from typing import List, Optional
import re

ist = pytz.timezone('Asia/Kolkata')

class WatchlistPartner(BaseModel):
    """Individual partner in watchlist"""
    partner_email: EmailStr
    match_score: float = Field(..., ge=0, le=100)
    added_at: datetime = Field(default_factory=lambda: datetime.now(ist))
    
    @field_validator('match_score', mode='before')
    @classmethod
    def validate_match_score(cls, v):
        # Accept string and convert to float
        if isinstance(v, str):
            try:
                v = re.sub(r'[^\d.]', '', v)
                return float(v)
            except (ValueError, TypeError):
                raise ValueError('match_score must be a number')
        return v

class WatchlistBase(BaseModel):
    user_email: EmailStr
    partners: List[WatchlistPartner] = Field(default_factory=list)
    updated_at: datetime = Field(default_factory=lambda: datetime.now(ist))

class WatchlistCreate(BaseModel):
    """Data for adding a new partner to watchlist"""
    user_email: EmailStr
    partner_email: EmailStr
    match_score: float = Field(..., ge=0, le=100)

class WatchlistResponse(WatchlistBase):
    id: str = Field(alias="_id")

    model_config = ConfigDict(
        populate_by_name=True,
        json_encoders={datetime: lambda dt: dt.isoformat()},
    )
    
    @field_serializer('updated_at')
    def serialize_dt(self, dt: datetime, _info):
        return dt.isoformat()

class WatchlistInDB(WatchlistResponse):
    pass