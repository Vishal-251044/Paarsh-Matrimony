from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict

class Message(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "sender_email": "user1@example.com",
                "content": "Hello, how are you?",
                "read": False
            }
        }
    )
    
    id: Optional[str] = Field(None, alias="_id")
    conversation_id: str
    sender_email: str
    content: str
    read: bool = False
    read_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.now)

class ConversationParticipant(BaseModel):
    email: str
    name: str
    profile_img: Optional[str] = ""

class Conversation(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "participants": [
                    {"email": "user1@example.com", "name": "John Doe"},
                    {"email": "user2@example.com", "name": "Jane Smith"}
                ],
                "interest_id": "interest_123"
            }
        }
    )
    
    id: Optional[str] = Field(None, alias="_id")
    participants: List[ConversationParticipant]
    interest_id: Optional[str] = None
    last_message: Optional[dict] = None
    unread_count: dict = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

class ChatMessage(BaseModel):
    conversation_id: str
    sender_email: str
    content: str
    sender_name: Optional[str] = None

class MessageResponse(BaseModel):
    success: bool
    message: Optional[Message] = None
    messages: Optional[List[Message]] = None
    error: Optional[str] = None

class ConversationResponse(BaseModel):
    success: bool
    conversation: Optional[Conversation] = None
    conversations: Optional[List[Conversation]] = None
    error: Optional[str] = None

class ChatExportResponse(BaseModel):
    success: bool
    content: Optional[str] = None
    error: Optional[str] = None

class WebSocketMessage(BaseModel):
    type: str
    conversation_id: Optional[str] = None
    sender_email: Optional[str] = None
    sender_name: Optional[str] = None
    content: Optional[str] = None
    message_id: Optional[str] = None
    read_at: Optional[datetime] = None
    receiver_email: Optional[str] = None