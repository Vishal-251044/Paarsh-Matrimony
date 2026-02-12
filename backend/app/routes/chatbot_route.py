from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from app.controllers.chatbot_controller import init_chat_session, process_chat_question, get_category_questions
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/chat", tags=["Chatbot"])

# Request/Response Models
class InitChatRequest(BaseModel):
    user_email: Optional[EmailStr] = None

class InitChatResponse(BaseModel):
    sessionId: str
    welcomeMessage: str

class AskRequest(BaseModel):
    sessionId: str
    category: str
    question: str
    question_id: Optional[str] = None
    user_email: Optional[EmailStr] = None

class AskResponse(BaseModel):
    answer: str
    suggestions: list
    category: str
    question_id: str

class QuestionResponse(BaseModel):
    id: str
    question: str
    icon: Optional[str] = None
    requires_login: Optional[bool] = False

class CategoryQuestionsResponse(BaseModel):
    category: str
    questions: List[Dict[str, Any]]

# Static dataset for general categories (mirroring frontend)
STATIC_DATASET = {
    "features": [
        {
            "id": "premium_features",
            "question": "What are the premium features?",
            "requires_login": False
        },
        {
            "id": "free_features",
            "question": "What can I do with free account?",
            "requires_login": False
        },
        {
            "id": "daily_recommendations",
            "question": "How do daily recommendations work?",
            "requires_login": False
        },
        {
            "id": "matching_algorithm",
            "question": "How does your matching algorithm work?",
            "requires_login": False
        },
        {
            "id": "mobile_app",
            "question": "Do you have a mobile app?",
            "requires_login": False
        }
    ],
    "payment": [
        {
            "id": "pricing_plans",
            "question": "What are your pricing plans?",
            "requires_login": False
        },
        {
            "id": "payment_methods",
            "question": "What payment methods do you accept?",
            "requires_login": False
        },
        {
            "id": "refund_policy",
            "question": "What is your refund policy?",
            "requires_login": False
        },
        {
            "id": "auto_renewal",
            "question": "How does auto-renewal work?",
            "requires_login": False
        },
        {
            "id": "invoice_billing",
            "question": "How do I get an invoice?",
            "requires_login": False
        }
    ],
    "verification": [
        {
            "id": "verification_process",
            "question": "How do I get my profile verified?",
            "requires_login": False
        },
        {
            "id": "verification_benefits",
            "question": "What are the benefits of verification?",
            "requires_login": False
        },
        {
            "id": "photo_verification",
            "question": "What is photo verification?",
            "requires_login": False
        },
        {
            "id": "document_safety",
            "question": "Are my documents safe?",
            "requires_login": False
        },
        {
            "id": "rejection_reasons",
            "question": "Why was my verification rejected?",
            "requires_login": False
        }
    ]
}

@router.post("/init", response_model=InitChatResponse)
async def initialize_chat(request: InitChatRequest = None):
    """Initialize a new chat session"""
    try:
        user_email = request.user_email if request else None
        result = await init_chat_session(user_email)
        return InitChatResponse(**result)
    except Exception as e:
        logger.error(f"Chat init failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to initialize chat")

@router.post("/ask", response_model=AskResponse)
async def ask_question(request: AskRequest):
    """Process a question and return answer"""
    try:
        user_email = request.user_email
        
        # Validate login for personalized categories
        if request.category in ["self", "family", "partner", "watchlist"] and not user_email:
            raise HTTPException(
                status_code=401, 
                detail="Login required for this category",
                headers={"X-Login-Required": "true"}
            )
        
        result = await process_chat_question(
            session_id=request.sessionId,
            user_email=user_email,
            category=request.category,
            question_id=request.question_id or f"view_{request.category}"
        )
        
        return AskResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Question processing failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to process question")

@router.get("/categories")
async def get_categories():
    """Get all available chat categories"""
    return {
        "categories": [
            {"id": "self", "name": "My Profile", "requires_login": True},
            {"id": "family", "name": "Family", "requires_login": True},
            {"id": "partner", "name": "Partner Preferences", "requires_login": True},
            {"id": "watchlist", "name": "Watchlist", "requires_login": True},
            {"id": "features", "name": "Features", "requires_login": False},
            {"id": "payment", "name": "Payment", "requires_login": False},
            {"id": "verification", "name": "Verification", "requires_login": False}
        ]
    }

@router.get("/questions/{category}", response_model=CategoryQuestionsResponse)
async def get_questions(category: str, user_email: Optional[str] = None):
    """Get main questions for a specific category"""
    
    try:
        # Handle personalized categories (require login)
        if category in ["self", "family", "partner", "watchlist"]:
            if not user_email:
                raise HTTPException(
                    status_code=401, 
                    detail="Login required for this category",
                    headers={"X-Login-Required": "true"}
                )
            
            questions = await get_category_questions(category, user_email)
            
            # Format questions with consistent structure
            formatted_questions = []
            for q in questions:
                formatted_questions.append({
                    "id": q["id"],
                    "question": q["question"],
                    "requires_login": True,
                    "category": category
                })
            
            return {
                "category": category,
                "questions": formatted_questions
            }
        
        # Handle general categories (static data)
        elif category in STATIC_DATASET:
            return {
                "category": category,
                "questions": STATIC_DATASET[category]
            }
        
        # Category not found
        else:
            raise HTTPException(status_code=404, detail="Category not found")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to fetch questions for {category}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch questions")

@router.get("/session/{session_id}")
async def get_session(session_id: str):
    """Get chat session details"""
    try:
        from app.database import db
        session = await db.chat_sessions.find_one({"session_id": session_id})
        if session:
            if "_id" in session:
                session["_id"] = str(session["_id"])
            return session
        raise HTTPException(status_code=404, detail="Session not found")
    except Exception as e:
        logger.error(f"Failed to fetch session: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch session")