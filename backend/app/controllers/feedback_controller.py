# app/controllers/feedback_controller.py
from fastapi import HTTPException, status
from app.models.Feedback import Feedback
from app.database import db
from datetime import datetime, timedelta
from bson import ObjectId
import logging

logger = logging.getLogger(__name__)

class FeedbackController:
    def __init__(self):
        self.collection = db.feedbacks
    
    async def submit_feedback(self, feedback: Feedback) -> dict:
        """
        Submit new feedback from user
        - Check if user has submitted feedback in last 24 hours
        - Store feedback in database
        """
        try:
            # Check if user has submitted feedback in last 24 hours
            twenty_four_hours_ago = datetime.utcnow() - timedelta(hours=24)
            
            recent_feedback = await self.collection.find_one({
                "email": feedback.email,
                "created_at": {"$gte": twenty_four_hours_ago}
            })
            
            if recent_feedback:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="You have already submitted feedback in the last 24 hours. Please try again tomorrow."
                )
            
            # Prepare feedback data
            feedback_dict = feedback.dict(by_alias=True)
            feedback_dict["_id"] = ObjectId()  # Generate new ObjectId
            feedback_dict["created_at"] = datetime.utcnow()
            
            # Insert into database
            result = await self.collection.insert_one(feedback_dict)
            
            if result.inserted_id:
                logger.info(f"Feedback submitted successfully by {feedback.email}")
                return {
                    "success": True,
                    "message": "Thank you for your feedback!",
                    "feedback_id": str(result.inserted_id)
                }
            else:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to submit feedback. Please try again."
                )
                
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error submitting feedback: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="An error occurred while submitting feedback. Please try again later."
            )

# Create controller instance
feedback_controller = FeedbackController()