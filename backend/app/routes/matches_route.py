# In app/routes/matches_route.py - UPDATE the import and controller initialization
from fastapi import APIRouter, HTTPException, Depends
from app.controllers.matches_controller import MatchesController
from typing import List, Dict
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/matches", tags=["matches"])

# Initialize controller
matches_controller = MatchesController()

@router.get("/user/{user_email}")
async def get_user_matches(user_email: str, limit: int = 20) -> Dict:
    """
    Get matches for a specific user
    """
    try:
        logger.info(f"Fetching matches for user: {user_email}")
        matches = await matches_controller.get_matches_for_user(user_email, limit)
        return {
            "success": True,
            "count": len(matches),
            "matches": matches
        }
    except Exception as e:
        logger.error(f"Error in get_user_matches: {str(e)}", exc_info=True)
        return {
            "success": False,
            "error": str(e),
            "count": 0,
            "matches": []
        }

@router.get("/recommended/{user_email}")
async def get_recommended_matches(user_email: str, limit: int = 10) -> Dict:
    """
    Get AI-recommended matches for a user
    """
    try:
        logger.info(f"Fetching recommended matches for: {user_email}")
        matches = await matches_controller.get_recommended_matches(user_email, limit)
        logger.info(f"Found {len(matches)} matches for {user_email}")
        
        # Debug logging
        if matches:
            logger.info(f"Sample match: {matches[0]}")
        
        return {
            "success": True,
            "count": len(matches),
            "matches": matches
        }
    except Exception as e:
        logger.error(f"Error in get_recommended_matches: {str(e)}", exc_info=True)
        # Return success with empty array instead of error
        return {
            "success": True,
            "error": str(e) if str(e) else "No matches found",
            "count": 0,
            "matches": []
        }

@router.get("/test-compatibility/{email1}/{email2}")
async def test_compatibility(email1: str, email2: str) -> Dict:
    """
    Test compatibility between two users
    """
    try:
        profile1 = await matches_controller.get_profile_by_email(email1)
        profile2 = await matches_controller.get_profile_by_email(email2)
        
        if not profile1 or not profile2:
            return {
                "success": False,
                "error": "One or both profiles not found",
                "score": 0,
                "compatible": False
            }
        
        score = matches_controller.calculate_match_score(profile1, profile2)
        
        return {
            "success": True,
            "score": score,
            "user1": profile1.get('personalInfo', {}).get('fullName', email1),
            "user2": profile2.get('personalInfo', {}).get('fullName', email2),
            "compatible": score >= 60.0
        }
    except Exception as e:
        logger.error(f"Error in test_compatibility: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "score": 0,
            "compatible": False
        }