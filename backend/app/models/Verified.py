from app.database import db
from datetime import datetime
from typing import Optional, Dict, Any

VERIFIED_COLLECTION = db["verified_users"]


async def add_verified_user(email: str) -> bool:
    """
    Add a user to the verified collection.
    Returns True if added, False if already exists.
    """
    try:
        # Check if already exists
        existing = await VERIFIED_COLLECTION.find_one({"email": email})
        if existing:
            return False
        
        # Insert new verified user
        result = await VERIFIED_COLLECTION.insert_one({
            "email": email,
            "verified_at": datetime.utcnow(),
            "created_at": datetime.utcnow(),
            "verified_by": "admin"
        })
        
        return result.inserted_id is not None
    except Exception as e:
        raise Exception(f"Failed to add verified user: {str(e)}")


async def is_user_verified(email: str) -> bool:
    """
    Check if a user is verified.
    """
    existing = await VERIFIED_COLLECTION.find_one({"email": email})
    return existing is not None


async def get_verified_user(email: str) -> Optional[Dict[str, Any]]:
    """
    Get verified user details.
    """
    user = await VERIFIED_COLLECTION.find_one({"email": email})
    if user:
        user["_id"] = str(user["_id"])
        return user
    return None


async def remove_verified_user(email: str) -> bool:
    """
    Remove a user from verified collection.
    Returns True if removed, False if not found.
    """
    result = await VERIFIED_COLLECTION.delete_one({"email": email})
    return result.deleted_count > 0


async def get_all_verified_emails() -> List[str]:
    """
    Get all verified email addresses.
    """
    emails = []
    async for user in VERIFIED_COLLECTION.find({}, {"email": 1}):
        emails.append(user["email"])
    return emails