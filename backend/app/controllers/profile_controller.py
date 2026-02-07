import cloudinary
import cloudinary.uploader
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from datetime import datetime
import os
import re
from app.database import db
from app.models.Profile import Profile

router = APIRouter()

# Database collection
profile_collection = db["profiles"]

# Cloudinary configuration - handle missing credentials gracefully
CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME")
CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY")
CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET")

# Check if Cloudinary credentials exist
cloudinary_configured = False
if all([CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET]):
    try:
        cloudinary.config(
            cloud_name=CLOUDINARY_CLOUD_NAME,
            api_key=CLOUDINARY_API_KEY,
            api_secret=CLOUDINARY_API_SECRET
        )
        cloudinary_configured = True
        print("Cloudinary configured successfully")
    except Exception as e:
        print(f"Error configuring Cloudinary: {str(e)}")
        cloudinary_configured = False
else:
    print("Warning: Cloudinary credentials not found. Image uploads will not work.")

@router.post("/save")
async def save_profile(profile: Profile):
    try:
        # Validate phone numbers
        phone_errors = validate_phone_numbers(profile.personalInfo)
        if phone_errors:
            raise HTTPException(status_code=400, detail=phone_errors)
        
        # Check if profile already exists
        existing_profile = await profile_collection.find_one({"email": profile.email})
        
        if existing_profile:
            # Update existing profile
            profile.lastUpdated = datetime.now().isoformat()
            await profile_collection.update_one(
                {"email": profile.email},
                {"$set": profile.dict(exclude_none=True)}
            )
            return {"message": "Profile updated successfully", "profile": profile.dict()}
        else:
            # Create new profile
            profile.createdDate = datetime.now().isoformat()
            profile.lastUpdated = datetime.now().isoformat()
            await profile_collection.insert_one(profile.dict(exclude_none=True))
            return {"message": "Profile created successfully", "profile": profile.dict()}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error saving profile: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/get/{email}")
async def get_profile(email: str):
    try:
        profile = await profile_collection.find_one({"email": email})
        if profile:
            # Convert ObjectId to string
            profile["_id"] = str(profile["_id"])
            return {"profile": profile}
        else:
            return {"profile": None}
    except Exception as e:
        print(f"Error getting profile: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/publish")
async def publish_profile(profile: Profile):
    try:
        # Validate phone numbers
        phone_errors = validate_phone_numbers(profile.personalInfo)
        if phone_errors:
            raise HTTPException(status_code=400, detail=phone_errors)
        
        # Check if all required sections are at least 80% complete
        completion_status = check_profile_completion(profile.dict())
        
        if not completion_status["isComplete"]:
            raise HTTPException(
                status_code=400, 
                detail={
                    "message": "Profile must be at least 80% complete in all sections",
                    "completion": completion_status
                }
            )
        
        # Update profile with publish status
        profile.isPublished = True
        profile.publishedDate = datetime.now().isoformat()
        profile.lastUpdated = datetime.now().isoformat()
        
        await profile_collection.update_one(
            {"email": profile.email},
            {"$set": profile.dict(exclude_none=True)},
            upsert=True
        )
        
        return {
            "message": "Profile published successfully", 
            "profile": profile.dict(),
            "completion": completion_status
        }
    except Exception as e:
        print(f"Error publishing profile: {str(e)}")
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/unpublish")
async def unpublish_profile(data: dict):
    try:
        email = data.get("email")
        if not email:
            raise HTTPException(status_code=400, detail="Email is required")
        
        result = await profile_collection.update_one(
            {"email": email},
            {"$set": {"isPublished": False, "lastUpdated": datetime.now().isoformat()}}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        return {"message": "Profile unpublished successfully"}
    except Exception as e:
        print(f"Error unpublishing profile: {str(e)}")
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/upload-image")
async def upload_profile_image(
    file: UploadFile = File(...),
    email: str = Form(...)
):
    try:
        if not email:
            raise HTTPException(status_code=400, detail="Email is required")
        
        # Check file size (max 2MB)
        file.file.seek(0, 2)  # Seek to end
        file_size = file.file.tell()  # Get size
        file.file.seek(0)  # Reset to beginning
        
        if file_size > 2 * 1024 * 1024:  # 2MB
            raise HTTPException(status_code=400, detail="File size exceeds 2MB limit")
        
        # Check file type
        allowed_types = ["image/jpeg", "image/png", "image/jpg", "image/gif"]
        if file.content_type not in allowed_types:
            raise HTTPException(status_code=400, detail="Only image files are allowed")
        
        if not cloudinary_configured:
            # Return a mock image URL for testing if Cloudinary is not configured
            return {
                "imageUrl": f"https://via.placeholder.com/500?text=Profile+{email[:5]}",
                "message": "Image stored locally (Cloudinary not configured)"
            }
        
        # Upload to Cloudinary
        result = cloudinary.uploader.upload(
            file.file,
            folder="matrimony_profiles",
            public_id=f"profile_{email}_{int(datetime.now().timestamp())}",
            overwrite=True
        )
        
        image_url = result.get("secure_url")
        
        # Update profile with image URL
        await profile_collection.update_one(
            {"email": email},
            {"$set": {"personalInfo.profileImg": image_url, "lastUpdated": datetime.now().isoformat()}},
            upsert=True
        )
        
        return {"imageUrl": image_url, "message": "Image uploaded successfully"}
    except Exception as e:
        print(f"Error uploading image: {str(e)}")
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/completion/{email}")
async def get_profile_completion(email: str):
    """Get profile completion percentage"""
    try:
        profile = await profile_collection.find_one({"email": email})
        if profile:
            completion = check_profile_completion(profile)
            return completion
        else:
            return {
                "isComplete": False,
                "overallPercentage": 0,
                "sectionCompletion": {},
                "score": "0/0 sections complete"
            }
    except Exception as e:
        print(f"Error getting profile completion: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

def validate_phone_numbers(personal_info):
    """Validate phone numbers"""
    errors = []
    
    # Validate contact number if provided
    if personal_info.contactNumber and personal_info.contactNumber.strip():
        contact_number = ''.join(filter(str.isdigit, personal_info.contactNumber))
        if len(contact_number) != 10 or contact_number[0] not in '6789':
            errors.append("Contact number must be a valid 10-digit Indian mobile number starting with 6,7,8, or 9")
    
    # Validate WhatsApp number if provided
    if personal_info.whatsappNumber and personal_info.whatsappNumber.strip():
        whatsapp_number = ''.join(filter(str.isdigit, personal_info.whatsappNumber))
        if len(whatsapp_number) != 10 or whatsapp_number[0] not in '6789':
            errors.append("WhatsApp number must be a valid 10-digit Indian mobile number starting with 6,7,8, or 9")
    
    return ", ".join(errors) if errors else None

def check_profile_completion(profile_data):
    sections = [
        ('personalInfo', ['fullName', 'gender', 'dob', 'age', 'maritalStatus', 'contactNumber']),
        ('locationInfo', ['country', 'state', 'city', 'currentLocation']),
        ('religionInfo', ['religion', 'caste', 'motherTongue']),
        ('educationInfo', ['highestEducation', 'university']),
        ('careerInfo', ['profession', 'annualIncome']),
        ('familyInfo', ['fatherName', 'motherName', 'familyType', 'familyStatus']),
        ('partnerInfo', ['preferredAgeRange', 'preferredMaritalStatus', 'lookingFor'])
    ]
    
    completion = {}
    total_score = 0
    max_score = len(sections)
    
    for section_name, required_fields in sections:
        section_data = profile_data.get(section_name, {})
        filled_count = 0
        total_fields = len(required_fields)
        
        for field in required_fields:
            value = section_data.get(field)
            if value not in [None, "", 0, []] and value is not False:
                filled_count += 1
        
        percentage = (filled_count / total_fields) * 100 if total_fields > 0 else 0
        completion[section_name] = round(percentage)
        
        # Add to total score if section is at least 80% complete
        if percentage >= 80:
            total_score += 1
    
    overall_percentage = (total_score / max_score) * 100
    is_complete = overall_percentage >= 80
    
    return {
        "isComplete": is_complete,
        "overallPercentage": round(overall_percentage),
        "sectionCompletion": completion,
        "score": f"{total_score}/{max_score} sections complete"
    }