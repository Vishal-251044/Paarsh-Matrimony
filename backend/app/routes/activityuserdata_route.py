from fastapi import APIRouter, HTTPException, status
from typing import Dict, Any, Optional
from datetime import datetime
import logging
from bson import ObjectId

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["Activity"])

# ============== MongoDB Connection ==============
from app.database import db

profiles_collection = db["profiles"]

# ============== Helper Functions ==============

def convert_objectid_to_str(doc: Dict[str, Any]) -> Dict[str, Any]:
    """Convert ObjectId to string in MongoDB document"""
    if doc and "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc

def format_profile_for_frontend(profile_data: Dict[str, Any], email: str) -> Dict[str, Any]:
    """Format profile data exactly as frontend expects in fetchProfileData function"""
    if not profile_data:
        return {}
    
    # Convert ObjectId to string
    profile_data = convert_objectid_to_str(profile_data)
    
    # Extract nested objects
    personal_info = profile_data.get("personalInfo", {})
    location_info = profile_data.get("locationInfo", {})
    religion_info = profile_data.get("religionInfo", {})
    education_info = profile_data.get("educationInfo", {})
    career_info = profile_data.get("careerInfo", {})
    
    # Format response to match frontend mapping exactly
    formatted_profile = {
        # Basic fields that frontend expects
        "email": email,
        "fullName": personal_info.get("fullName", ""),
        "profileImg": personal_info.get("profileImg", ""),
        "age": personal_info.get("age", ""),
        "height": personal_info.get("height", ""),
        "weight": personal_info.get("weight", ""),
        "bloodGroup": personal_info.get("bloodGroup", ""),
        "maritalStatus": personal_info.get("maritalStatus", ""),
        "disability": personal_info.get("disability", ""),
        "education": education_info.get("highestEducation", ""),
        "profession": career_info.get("profession", ""),
        "annualIncome": career_info.get("annualIncome", ""),
        "employmentType": career_info.get("employmentType", ""),
        "religion": religion_info.get("religion", ""),
        "caste": religion_info.get("caste", ""),
        "location": location_info.get("city", ""),
        "currentLocation": location_info.get("currentLocation", ""),
        "contactNumber": personal_info.get("contactNumber", ""),
        "whatsappNumber": personal_info.get("whatsappNumber", ""),
        "state": location_info.get("state", ""),
        
        # Online status fields
        "isOnline": False,  # Default value, implement if needed
        "lastSeen": datetime.now().isoformat(),
        
        # Additional fields that might be useful
        "gender": personal_info.get("gender", ""),
        "dob": personal_info.get("dob", ""),
        "country": location_info.get("country", "India"),
        "permanentAddress": location_info.get("permanentAddress", ""),
        "motherTongue": religion_info.get("motherTongue", ""),
        "yearOfPassing": education_info.get("yearOfPassing", ""),
        "university": education_info.get("university", ""),
        "jobTitle": career_info.get("jobTitle", ""),
        "companyName": career_info.get("companyName", ""),
        "workLocation": career_info.get("workLocation", ""),
        "aboutYourself": profile_data.get("aboutYourself", ""),
        "aboutFamily": profile_data.get("aboutFamily", ""),
        "membershipType": profile_data.get("membershipPlan", "free"),
        "isPublished": profile_data.get("isPublished", False)
    }
    
    return formatted_profile

# ============== API Endpoint for Frontend ==============

@router.get("/profile/{email}")
async def get_profile_by_email(email: str):
    """
    Get complete profile data by email
    This endpoint matches exactly what the frontend fetchProfileData function expects
    """
    try:
        logger.info(f"Fetching profile for email: {email}")
        
        # Find profile in database
        profile = await profiles_collection.find_one({"email": email})
        
        if not profile:
            logger.warning(f"Profile not found for email: {email}")
            # CHANGE THIS: Return HTTP 404 status code
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Profile not found for email: {email}"
            )
        
        # Format profile exactly as frontend expects
        formatted_profile = format_profile_for_frontend(profile, email)
        
        logger.info(f"Profile found for email: {email}")
        
        # Return in the exact structure frontend expects
        return {
            "success": True,
            "profile": formatted_profile,
            "message": "Profile retrieved successfully"
        }
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Error fetching profile for {email}: {str(e)}")
        # CHANGE THIS: Return HTTP 500 status code for server errors
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching profile: {str(e)}"
        )