from fastapi import HTTPException
from fastapi.encoders import jsonable_encoder
from app.database import db
from datetime import datetime
from typing import List
from bson import ObjectId

# Collections
USERS_COLLECTION = db["users"]
PROFILES_COLLECTION = db["profiles"]
WATCHLIST_COLLECTION = db["watchlist"]
VERIFIED_COLLECTION = db["verified_users"]


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


async def get_all_users():
    """
    Fetch all user profiles and mark them as verified if they exist in the verified collection.
    Returns a list of user dicts compatible with the frontend display.
    """
    users_list = []

    # Get all verified emails
    verified_emails = []
    async for v in VERIFIED_COLLECTION.find({}, {"email": 1}):
        verified_emails.append(v["email"])

    # Fetch profiles
    async for user in PROFILES_COLLECTION.find({}):
        user_email = user.get("email")
        user_dict = {
            "id": str(user["_id"]),
            "email": user_email,
            "personalInfo": user.get("personalInfo", {}),
            "locationInfo": user.get("locationInfo", {}),
            "religionInfo": user.get("religionInfo", {}),
            "educationInfo": user.get("educationInfo", {}),
            "careerInfo": user.get("careerInfo", {}),
            "familyInfo": user.get("familyInfo", {}),
            "partnerInfo": user.get("partnerInfo", {}),
            "aboutYourself": user.get("aboutYourself", ""),
            "aboutFamily": user.get("aboutFamily", ""),
            "membershipPlan": user.get("membershipPlan", "free"),
            "isPublished": user.get("isPublished", False),
            "createdDate": str(user.get("createdDate", "")),
            "updatedAt": str(user.get("lastUpdated", "")),
            "verified": user_email in verified_emails if user_email else False
        }
        # Convert any nested ObjectId
        users_list.append(_convert_objectid(user_dict))

    return jsonable_encoder(users_list)


async def verify_user(email: str):
    """
    Verify a user by adding them to the verified collection.
    """
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")

    # Check if user profile exists
    profile = await PROFILES_COLLECTION.find_one({"email": email})
    if not profile:
        raise HTTPException(status_code=404, detail=f"User with email '{email}' not found")

    # Check if already verified
    existing = await VERIFIED_COLLECTION.find_one({"email": email})
    if existing:
        # User is already verified, but we'll still return success
        return jsonable_encoder({
            "success": True,
            "email": email,
            "message": f"User {email} is already verified"
        })

    try:
        # Add to verified collection
        await VERIFIED_COLLECTION.insert_one({
            "email": email,
            "verified_at": datetime.utcnow(),
            "verified_by": "admin"
        })

        # Update profile (optional - frontend checks verified collection)
        await PROFILES_COLLECTION.update_one(
            {"email": email},
            {"$set": {"verified": True}}
        )

        return jsonable_encoder({
            "success": True,
            "email": email,
            "message": f"User {email} verified successfully"
        })
    except Exception as e:
        # Clean up in case of partial failure
        await VERIFIED_COLLECTION.delete_one({"email": email})
        raise HTTPException(status_code=500, detail=f"Verification failed: {str(e)}")


async def delete_user(email: str):
    """
    Delete a user and all related data including profile, watchlist, and verified entry.
    """
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")

    try:
        # Delete user from all collections
        user_deleted = await USERS_COLLECTION.delete_one({"email": email})
        profile_deleted = await PROFILES_COLLECTION.delete_one({"email": email})
        await WATCHLIST_COLLECTION.delete_many({"user_email": email})
        await VERIFIED_COLLECTION.delete_one({"email": email})

        if user_deleted.deleted_count == 0 and profile_deleted.deleted_count == 0:
            raise HTTPException(status_code=404, detail=f"User with email '{email}' not found")

        return jsonable_encoder({
            "success": True,
            "email": email,
            "message": f"User {email} and all related data deleted successfully"
        })
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Deletion failed: {str(e)}")