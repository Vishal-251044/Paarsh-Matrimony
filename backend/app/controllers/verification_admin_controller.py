from fastapi import HTTPException
from fastapi.encoders import jsonable_encoder
from app.database import db
from datetime import datetime, timedelta
import pytz
from typing import List, Optional
from bson import ObjectId
from app.models.VerifyDoc import VerificationStatus

ist = pytz.timezone('Asia/Kolkata')

# Collections
USERS_COLLECTION = db["users"]
PROFILES_COLLECTION = db["profiles"]
WATCHLIST_COLLECTION = db["watchlist"]
VERIFIED_COLLECTION = db["verified_users"]
VERIFICATION_DOCS_COLLECTION = db["verification_documents"]


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


def _ensure_timezone(dt):
    """
    Ensure datetime is timezone-aware with IST timezone
    """
    if dt is None:
        return None
    if isinstance(dt, str):
        try:
            dt = datetime.fromisoformat(dt.replace('Z', '+00:00'))
        except ValueError:
            dt = datetime.fromisoformat(dt)
    if dt.tzinfo is None:
        dt = ist.localize(dt)
    return dt


async def get_user_profile(email: str):
    """
    Get a single user profile by email with proper verification handling
    """
    profile = await PROFILES_COLLECTION.find_one({"email": email})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    # Check if user is in verified collection
    is_verified = await VERIFIED_COLLECTION.find_one({"email": email}) is not None
    
    # Get personal info and update verified status
    personal_info = profile.get("personalInfo", {})
    personal_info["verified"] = is_verified
    
    # Get verification document info with rejection data
    verification_doc = await VERIFICATION_DOCS_COLLECTION.find_one({"email": email})
    if verification_doc:
        personal_info["verificationStatus"] = verification_doc.get("status")
        personal_info["rejectionReason"] = verification_doc.get("rejectionReason")
        personal_info["rejectedAt"] = verification_doc.get("reviewedAt")
        
        # Calculate if user can resubmit (10 days after rejection)
        if verification_doc.get("status") == "rejected" and verification_doc.get("reviewedAt"):
            rejected_date = _ensure_timezone(verification_doc.get("reviewedAt"))
            can_resubmit_after = rejected_date + timedelta(days=10)
            personal_info["canResubmitAfter"] = can_resubmit_after.isoformat()
            personal_info["canResubmit"] = datetime.now(ist) >= can_resubmit_after
    
    profile["personalInfo"] = personal_info
    
    return _convert_objectid(profile)


async def get_all_users():
    """
    Fetch all user profiles and their verification document status.
    Users with pending verification docs appear first.
    """
    users_list = []
    
    # Get all verified emails
    verified_emails = []
    async for v in VERIFIED_COLLECTION.find({}, {"email": 1}):
        verified_emails.append(v["email"])
    
    # Get all verification documents with their status
    verification_docs = {}
    async for doc in VERIFICATION_DOCS_COLLECTION.find({}):
        email = doc.get("email")
        if email:
            verification_data = {
                "hasDocument": True,
                "documentType": doc.get("documentType"),
                "documentNumber": doc.get("documentNumber"),
                "documentImageUrl": doc.get("documentImageUrl"),
                "verificationStatus": doc.get("status", "pending"),
                "rejectionReason": doc.get("rejectionReason"),
                "submittedAt": doc.get("submittedAt"),
                "reviewedAt": doc.get("reviewedAt")
            }
            
            # Add resubmission info if rejected
            if doc.get("status") == "rejected" and doc.get("reviewedAt"):
                rejected_date = _ensure_timezone(doc.get("reviewedAt"))
                can_resubmit_after = rejected_date + timedelta(days=10)
                verification_data["canResubmitAfter"] = can_resubmit_after.isoformat()
                verification_data["canResubmit"] = datetime.now(ist) >= can_resubmit_after
            
            verification_docs[email] = verification_data

    # Fetch profiles
    async for user in PROFILES_COLLECTION.find({}):
        user_email = user.get("email")
        verification_data = verification_docs.get(user_email, {
            "hasDocument": False,
            "verificationStatus": None
        })
        
        # Get personal info
        personal_info = user.get("personalInfo", {})
        
        # Check if user is verified
        is_verified = user_email in verified_emails if user_email else False
        
        # Set verified flag in personalInfo
        personal_info["verified"] = is_verified
        
        user_dict = {
            "id": str(user["_id"]),
            "email": user_email,
            "personalInfo": personal_info,
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
            "verified": is_verified,
            "verificationDocument": verification_data
        }
        # Convert any nested ObjectId
        users_list.append(_convert_objectid(user_dict))
    
    # Sort users: those with pending documents first, then others
    users_list.sort(key=lambda x: (
        0 if x.get("verificationDocument", {}).get("verificationStatus") == "pending" else
        1 if x.get("verificationDocument", {}).get("hasDocument") else
        2,
        x.get("verified")  # Unverified after pending docs
    ))
    
    return jsonable_encoder(users_list)


async def get_pending_verifications():
    """
    Get all users with pending verification documents
    """
    pending_users = []
    
    async for doc in VERIFICATION_DOCS_COLLECTION.find({"status": "pending"}):
        email = doc.get("email")
        profile = await PROFILES_COLLECTION.find_one({"email": email})
        
        if profile:
            personal_info = profile.get("personalInfo", {})
            
            user_data = {
                "email": email,
                "personalInfo": personal_info,
                "verificationDocument": {
                    "documentType": doc.get("documentType"),
                    "documentNumber": doc.get("documentNumber"),
                    "documentImageUrl": doc.get("documentImageUrl"),
                    "submittedAt": doc.get("submittedAt")
                }
            }
            pending_users.append(_convert_objectid(user_data))
    
    return jsonable_encoder(pending_users)


async def verify_user(email: str):
    """
    Verify a user by adding them to the verified collection and updating document status.
    """
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")

    # Check if user profile exists
    profile = await PROFILES_COLLECTION.find_one({"email": email})
    if not profile:
        raise HTTPException(status_code=404, detail=f"User with email '{email}' not found")

    # Check if already verified
    existing = await VERIFIED_COLLECTION.find_one({"email": email})
    
    try:
        # Update verification document status if exists
        await VERIFICATION_DOCS_COLLECTION.update_one(
            {"email": email, "status": "pending"},
            {
                "$set": {
                    "status": "approved",
                    "reviewedAt": datetime.now(ist),
                    "reviewedBy": "admin"
                }
            }
        )
        
        if not existing:
            # Add to verified collection
            await VERIFIED_COLLECTION.insert_one({
                "email": email,
                "verified_at": datetime.now(ist),
                "verified_by": "admin"
            })

        # Update profile with verified flag in personalInfo
        await PROFILES_COLLECTION.update_one(
            {"email": email},
            {
                "$set": {
                    "personalInfo.verified": True
                }
            }
        )

        return jsonable_encoder({
            "success": True,
            "email": email,
            "message": f"User {email} verified successfully"
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Verification failed: {str(e)}")


async def reject_verification(email: str, rejection_reason: str):
    """
    Reject a user's verification document with improved error handling
    """
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
    
    if not rejection_reason:
        raise HTTPException(status_code=400, detail="Rejection reason is required")
    
    # First, check if any verification document exists for this email
    any_doc = await VERIFICATION_DOCS_COLLECTION.find_one({"email": email})
    
    if not any_doc:
        raise HTTPException(
            status_code=404, 
            detail=f"No verification document found for {email}"
        )
    
    # Check if there's a pending document
    pending_doc = await VERIFICATION_DOCS_COLLECTION.find_one(
        {"email": email, "status": "pending"}
    )
    
    if not pending_doc:
        current_status = any_doc.get("status", "unknown")
        raise HTTPException(
            status_code=400, 
            detail=f"Cannot reject verification for {email}. Current status is '{current_status}'. Only pending verifications can be rejected."
        )
    
    try:
        # Update verification document status
        await VERIFICATION_DOCS_COLLECTION.update_one(
            {"email": email, "status": "pending"},
            {
                "$set": {
                    "status": "rejected",
                    "rejectionReason": rejection_reason,
                    "reviewedAt": datetime.now(ist),
                    "reviewedBy": "admin"
                }
            }
        )
        
        # Also update the profile to remove any verified flag
        await PROFILES_COLLECTION.update_one(
            {"email": email},
            {
                "$set": {
                    "personalInfo.verified": False
                }
            }
        )
        
        return jsonable_encoder({
            "success": True,
            "email": email,
            "message": f"Verification rejected for {email}"
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Rejection failed: {str(e)}")


async def get_verification_status(email: str):
    """
    Get verification status for a user including rejection and resubmission info
    """
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
    
    # Check if user is verified
    is_verified = await VERIFIED_COLLECTION.find_one({"email": email}) is not None
    
    if is_verified:
        return jsonable_encoder({
            "status": "approved",
            "isVerified": True,
            "message": "User is verified"
        })
    
    # Get verification document
    doc = await VERIFICATION_DOCS_COLLECTION.find_one({"email": email})
    
    if not doc:
        return jsonable_encoder({
            "status": None,
            "isVerified": False,
            "message": "No verification document found"
        })
    
    response = {
        "status": doc.get("status"),
        "isVerified": False,
        "documentType": doc.get("documentType"),
        "documentNumber": doc.get("documentNumber"),
        "submittedAt": doc.get("submittedAt")
    }
    
    # Add rejection and resubmission info
    if doc.get("status") == "rejected":
        response["rejectionReason"] = doc.get("rejectionReason")
        response["rejectedAt"] = doc.get("reviewedAt")
        
        # Calculate if user can resubmit (10 days after rejection)
        if doc.get("reviewedAt"):
            rejected_date = _ensure_timezone(doc.get("reviewedAt"))
            can_resubmit_after = rejected_date + timedelta(days=10)
            response["canResubmitAfter"] = can_resubmit_after.isoformat()
            response["canResubmit"] = datetime.now(ist) >= can_resubmit_after
    
    return jsonable_encoder(response)


async def delete_user(email: str):
    """
    Delete a user and all related data including profile, watchlist, verified entry, and verification docs.
    """
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")

    try:
        # Delete user from all collections
        user_deleted = await USERS_COLLECTION.delete_one({"email": email})
        profile_deleted = await PROFILES_COLLECTION.delete_one({"email": email})
        await WATCHLIST_COLLECTION.delete_many({"user_email": email})
        await VERIFIED_COLLECTION.delete_one({"email": email})
        await VERIFICATION_DOCS_COLLECTION.delete_many({"email": email})

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


# Optional debug function - can be removed in production
async def debug_verification_documents(email: str = None):
    """
    Debug endpoint to check verification documents in the database
    """
    try:
        if email:
            # Find specific document
            doc = await VERIFICATION_DOCS_COLLECTION.find_one({"email": email})
            if doc:
                # Convert ObjectId to string for JSON serialization
                doc = _convert_objectid(doc)
                return jsonable_encoder({
                    "exists": True,
                    "document": doc
                })
            else:
                return jsonable_encoder({
                    "exists": False,
                    "message": f"No document found for {email}"
                })
        else:
            # Get all documents
            docs = []
            async for doc in VERIFICATION_DOCS_COLLECTION.find({}):
                docs.append(_convert_objectid(doc))
            
            return jsonable_encoder({
                "count": len(docs),
                "documents": docs
            })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Debug error: {str(e)}")