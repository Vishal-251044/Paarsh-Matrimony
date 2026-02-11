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
            # PROTECT CORE FIELDS: Once set, name, dob, and gender cannot be changed
            if existing_profile.get("personalInfo", {}).get("fullName"):
                profile.personalInfo.fullName = existing_profile["personalInfo"]["fullName"]
            
            if existing_profile.get("personalInfo", {}).get("dob"):
                profile.personalInfo.dob = existing_profile["personalInfo"]["dob"]
            
            if existing_profile.get("personalInfo", {}).get("gender"):
                profile.personalInfo.gender = existing_profile["personalInfo"]["gender"]

            # ================= MEMBERSHIP READ-ONLY =================
            profile.membershipStartDate = existing_profile.get("membershipStartDate")
            profile.membershipExpiryDate = existing_profile.get("membershipExpiryDate")
            profile.membershipPlan = existing_profile.get("membershipPlan", "free")
            
            # Remove any membership fields from the update to prevent accidental writes
            profile_dict = profile.dict(exclude_none=True)
            # Remove membership fields from the update payload
            profile_dict.pop("membershipStartDate", None)
            profile_dict.pop("membershipExpiryDate", None)
            profile_dict.pop("membershipPlan", None)
            
            # Update existing profile (excluding membership fields)
            profile.lastUpdated = datetime.now().isoformat()
            profile_dict["lastUpdated"] = profile.lastUpdated
            
            await profile_collection.update_one(
                {"email": profile.email},
                {"$set": profile_dict}
            )
            
            # Return the complete profile with original membership data
            return {
                "message": "Profile updated successfully", 
                "profile": profile.dict(),
                "coreFieldsProtected": True
            }
        else:
            # Create new profile - always start with free plan
            profile.createdDate = datetime.now().isoformat()
            profile.lastUpdated = datetime.now().isoformat()
            profile.membershipPlan = "free"
            profile.membershipStartDate = None
            profile.membershipExpiryDate = None
            
            # Only include non-membership fields in initial creation
            profile_dict = profile.dict(exclude_none=True)
            
            await profile_collection.insert_one(profile_dict)
            return {
                "message": "Profile created successfully", 
                "profile": profile_dict,
                "coreFieldsProtected": False
            }
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
        
        # Get existing profile to preserve membership data
        existing_profile = await profile_collection.find_one({"email": profile.email})
        
        # Prepare update data - only publish-related fields
        update_data = {
            "isPublished": True,
            "publishedDate": datetime.now().isoformat(),
            "lastUpdated": datetime.now().isoformat()
        }
        
        # Add other profile fields but EXCLUDE membership fields
        profile_dict = profile.dict(exclude_none=True)
        # Remove membership fields
        profile_dict.pop("membershipStartDate", None)
        profile_dict.pop("membershipExpiryDate", None)
        profile_dict.pop("membershipPlan", None)
        
        # Merge update data with profile data
        update_data.update(profile_dict)
        
        await profile_collection.update_one(
            {"email": profile.email},
            {"$set": update_data}
        )
        
        # Get the updated profile to return
        updated_profile = await profile_collection.find_one({"email": profile.email})
        if updated_profile:
            updated_profile["_id"] = str(updated_profile["_id"])
        
        return {
            "message": "Profile published successfully", 
            "profile": updated_profile,
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
        
        # Update profile with image URL - preserve membership data
        await profile_collection.update_one(
            {"email": email},
            {"$set": {"personalInfo.profileImg": image_url, "lastUpdated": datetime.now().isoformat()}}
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


@router.post("/update-membership-dates")
async def update_membership_dates(data: dict):
    """API to update membership dates from payment system - ONLY endpoint that can modify membership data"""
    try:
        email = data.get("email")
        membership_start_date = data.get("membershipStartDate")
        membership_expiry_date = data.get("membershipExpiryDate")
        membership_plan = data.get("membershipPlan", "free")
        
        if not email:
            raise HTTPException(status_code=400, detail="Email is required")
        
        # Validate dates
        if membership_start_date:
            try:
                datetime.fromisoformat(membership_start_date.replace('Z', '+00:00'))
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid membershipStartDate format")
        
        if membership_expiry_date:
            try:
                datetime.fromisoformat(membership_expiry_date.replace('Z', '+00:00'))
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid membershipExpiryDate format")
        
        update_data = {
            "membershipPlan": membership_plan,
            "lastUpdated": datetime.now().isoformat()
        }
        
        if membership_start_date:
            update_data["membershipStartDate"] = membership_start_date
        
        if membership_expiry_date:
            update_data["membershipExpiryDate"] = membership_expiry_date
        
        result = await profile_collection.update_one(
            {"email": email},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            # Create a basic profile if it doesn't exist
            profile_data = {
                "email": email,
                "membershipPlan": membership_plan,
                "createdDate": datetime.now().isoformat(),
                "lastUpdated": datetime.now().isoformat()
            }
            
            if membership_start_date:
                profile_data["membershipStartDate"] = membership_start_date
            
            if membership_expiry_date:
                profile_data["membershipExpiryDate"] = membership_expiry_date
            
            await profile_collection.insert_one(profile_data)
            return {
                "message": "Membership dates created",
                "membershipStartDate": membership_start_date,
                "membershipExpiryDate": membership_expiry_date
            }
        
        return {
            "message": "Membership dates updated successfully",
            "membershipStartDate": membership_start_date,
            "membershipExpiryDate": membership_expiry_date
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating membership dates: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/membership-dates/{email}")
async def get_membership_dates(email: str):
    """Get only membership dates for a user"""
    try:
        profile = await profile_collection.find_one(
            {"email": email},
            {"membershipStartDate": 1, "membershipExpiryDate": 1, "membershipPlan": 1, "_id": 0}
        )
        
        if profile:
            return profile
        else:
            return {
                "message": "No membership data found",
                "membershipStartDate": None,
                "membershipExpiryDate": None,
                "membershipPlan": "free"
            }
    except Exception as e:
        print(f"Error getting membership dates: {str(e)}")
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
    # Only check the sections that are actually required for publishing
    sections = [
        ('personalInfo', ['fullName', 'gender', 'dob', 'age', 'maritalStatus', 'contactNumber', 'profileImg']),
        ('locationInfo', ['country', 'state', 'city']),  # Removed currentLocation
        ('religionInfo', ['religion', 'caste']),  # Removed motherTongue
        ('educationInfo', ['highestEducation']),  # Only highestEducation is required
        ('careerInfo', ['profession', 'employmentType', 'annualIncome']),  # Added employmentType
        ('familyInfo', ['fatherName', 'fatherOccupation', 'motherName', 'familyType', 'familyStatus']),
        ('partnerInfo', ['preferredAgeRange', 'preferredMaritalStatus', 'preferredReligion', 
                        'preferredCaste', 'preferredEducation', 'preferredProfession', 
                        'preferredIncome', 'preferredLocation'])
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
            # Check if value exists and is not empty
            if value is not None and value != "" and value != 0 and value != []:
                # Special check for profileImg - ensure it's not a placeholder
                if field == 'profileImg':
                    if value and isinstance(value, str) and len(value) > 10 and not value.startswith('data:,'):
                        filled_count += 1
                else:
                    filled_count += 1
        
        # Calculate percentage
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