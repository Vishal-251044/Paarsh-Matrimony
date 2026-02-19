from fastapi import HTTPException
from fastapi.encoders import jsonable_encoder
from app.database import db
from datetime import datetime
import pytz
from bson import ObjectId

ist = pytz.timezone('Asia/Kolkata')

# Collections
VERIFIED_COLLECTION = db["verified_users"]
PROFILES_COLLECTION = db["profiles"]


def _convert_objectid(obj):
    """
    Recursively convert ObjectId to string in nested dicts/lists.
    """
    if isinstance(obj, dict):
        return {k: _convert_objectid(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [_convert_objectid(i) for i in obj]
    elif isinstance(obj, ObjectId):
        return str(obj)
    else:
        return obj


async def check_verification_status(email: str):
    """
    Check if a user is verified by checking their email in the verified_users collection
    """
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
    
    # Check if email exists in verified collection
    verified_user = await VERIFIED_COLLECTION.find_one({"email": email})
    
    is_verified = verified_user is not None
    
    # Get additional verification info if needed
    verification_info = {
        "email": email,
        "isVerified": is_verified,
        "verifiedAt": verified_user.get("verified_at") if verified_user else None
    }
    
    return jsonable_encoder(verification_info)


async def check_bulk_verification_status(emails: list):
    """
    Check verification status for multiple emails at once
    """
    if not emails:
        raise HTTPException(status_code=400, detail="Emails list is required")
    
    # Remove duplicates and None values
    unique_emails = list(set([email for email in emails if email]))
    
    if not unique_emails:
        return jsonable_encoder({})
    
    # Find all verified users from the list
    verified_users = {}
    async for user in VERIFIED_COLLECTION.find({"email": {"$in": unique_emails}}):
        verified_users[user["email"]] = {
            "isVerified": True,
            "verifiedAt": user.get("verified_at")
        }
    
    # Create result dictionary with all emails (verified status defaults to False)
    result = {}
    for email in unique_emails:
        if email in verified_users:
            result[email] = verified_users[email]
        else:
            result[email] = {
                "isVerified": False,
                "verifiedAt": None
            }
    
    return jsonable_encoder(result)


async def get_verified_users_batch(emails: list):
    """
    Get detailed verification info for multiple emails
    """
    if not emails:
        raise HTTPException(status_code=400, detail="Emails list is required")
    
    # Remove duplicates and None values
    unique_emails = list(set([email for email in emails if email]))
    
    if not unique_emails:
        return jsonable_encoder([])
    
    # Find all verified users from the list
    verified_users = []
    async for user in VERIFIED_COLLECTION.find({"email": {"$in": unique_emails}}):
        # Also get profile info if needed
        profile = await PROFILES_COLLECTION.find_one({"email": user["email"]})
        
        user_data = {
            "email": user["email"],
            "isVerified": True,
            "verifiedAt": user.get("verified_at"),
            "fullName": profile.get("personalInfo", {}).get("fullName") if profile else None
        }
        verified_users.append(_convert_objectid(user_data))
    
    return jsonable_encoder(verified_users)