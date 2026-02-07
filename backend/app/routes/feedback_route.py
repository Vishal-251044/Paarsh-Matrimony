from fastapi import APIRouter, HTTPException, status
from app.controllers.feedback_controller import feedback_controller
from app.models.Feedback import Feedback

router = APIRouter(
    prefix="/feedback",
    tags=["Feedback"],
    responses={404: {"description": "Not found"}},
)

@router.post("/submit", status_code=status.HTTP_201_CREATED)
async def submit_feedback(feedback: Feedback):
    """
    Submit new feedback
    - User can only submit one feedback per 24 hours (based on email)
    - No authentication required - frontend sends email directly
    """
    try:
        return await feedback_controller.submit_feedback(feedback)
    except HTTPException as he:
        # Re-raise HTTP exceptions
        raise he
    except Exception as e:
        # Catch any other exceptions
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Server error: {str(e)}"
        )