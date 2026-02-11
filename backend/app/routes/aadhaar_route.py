# app/routes/aadhaar_route.py
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import xml.etree.ElementTree as ET
from datetime import datetime
import base64
import hashlib
import re
from typing import Optional

router = APIRouter()

# Pydantic models
class AadhaarVerificationRequest(BaseModel):
    email: str
    aadhaar_offline_xml: str  # Base64 encoded XML
    consent: bool = False

class AadhaarVerificationResponse(BaseModel):
    success: bool
    verified_data: dict
    message: str

class UpdateVerifiedFieldsRequest(BaseModel):
    email: str
    verified_name: str
    verified_dob: str
    verified_gender: str
    verification_source: str = "Aadhaar Offline"

# Helper function to validate and parse Aadhaar offline XML
def parse_aadhaar_offline_xml(xml_content: str):
    """Parse Aadhaar offline XML and extract required fields"""
    try:
        # Decode base64 if needed
        if xml_content.startswith('<?xml'):
            xml_string = xml_content
        else:
            # Try base64 decode
            xml_string = base64.b64decode(xml_content).decode('utf-8')
        
        # Parse XML
        root = ET.fromstring(xml_string)
        
        # Extract data using namespaces
        ns = {'ns': 'http://www.uidai.gov.in/offline-ekyc-uid/1.0'}
        
        # Get PoA (Proof of Address) or PoI (Proof of Identity)
        poi = root.find('.//ns:Poi', ns)
        if poi is None:
            raise ValueError("Proof of Identity not found in XML")
        
        # Extract name
        name_element = poi.find('ns:Name', ns)
        if name_element is None:
            name_element = poi.find('.//ns:Name', ns)
        
        name = name_element.text if name_element is not None else ""
        
        # Extract DOB
        dob_element = root.find('.//ns:Dob', ns)
        if dob_element is None:
            # Try alternative location
            dob_element = root.find('.//ns:DOB', ns)
        
        dob = dob_element.text if dob_element is not None else ""
        
        # Extract gender
        gender_element = root.find('.//ns:Gender', ns)
        gender = gender_element.text if gender_element is not None else ""
        
        # Validate extracted data
        if not name or not dob or not gender:
            raise ValueError("Required fields not found in XML")
        
        # Format DOB to YYYY-MM-DD if needed
        try:
            # Try to parse various date formats
            dob_formatted = ""
            if len(dob) == 8 and dob.isdigit():  # YYYYMMDD format
                dob_formatted = f"{dob[:4]}-{dob[4:6]}-{dob[6:8]}"
            elif len(dob) == 10 and dob[2] == '/' and dob[5] == '/':  # DD/MM/YYYY
                day, month, year = dob.split('/')
                dob_formatted = f"{year}-{month}-{day}"
            else:
                dob_formatted = dob
        except:
            dob_formatted = dob
        
        return {
            "name": name.strip(),
            "dob": dob_formatted,
            "gender": gender.upper() if gender else ""
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid Aadhaar XML: {str(e)}")

# Helper function to mask Aadhaar number for display (if needed)
def mask_aadhaar_number(aadhaar_xml: str):
    """Extract and mask Aadhaar number from XML"""
    try:
        root = ET.fromstring(aadhaar_xml)
        ns = {'ns': 'http://www.uidai.gov.in/offline-ekyc-uid/1.0'}
        
        uid_element = root.find('.//ns:Uid', ns)
        if uid_element is not None:
            aadhaar_no = uid_element.text
            if aadhaar_no and len(aadhaar_no) == 12:
                return f"XXXX-XXXX-{aadhaar_no[-4:]}"
    except:
        pass
    return "XXXX-XXXX-XXXX"

@router.post("/verify-aadhaar", response_model=AadhaarVerificationResponse)
async def verify_aadhaar(request: AadhaarVerificationRequest):
    """Verify Aadhaar offline XML and extract identity information"""
    try:
        # Check consent
        if not request.consent:
            raise HTTPException(
                status_code=400, 
                detail="Consent is required for identity verification"
            )
        
        # Parse and validate Aadhaar XML
        verified_data = parse_aadhaar_offline_xml(request.aadhaar_offline_xml)
        
        # Validate gender (only Male/Female for matrimony app)
        gender = verified_data["gender"]
        if gender not in ["MALE", "FEMALE", "M", "F"]:
            raise HTTPException(
                status_code=400,
                detail="Gender must be Male or Female for matrimony profiles"
            )
        
        # Standardize gender
        gender_mapping = {
            "MALE": "Male",
            "M": "Male",
            "FEMALE": "Female",
            "F": "Female"
        }
        verified_data["gender"] = gender_mapping.get(gender.upper(), gender)
        
        # Calculate age from DOB
        try:
            dob_date = datetime.strptime(verified_data["dob"], "%Y-%m-%d")
            age = datetime.now().year - dob_date.year
            if datetime.now().month < dob_date.month or (
                datetime.now().month == dob_date.month and datetime.now().day < dob_date.day
            ):
                age -= 1
            verified_data["age"] = age
            
            # Validate age for matrimony (18+)
            if age < 18:
                raise HTTPException(
                    status_code=400,
                    detail="Age must be 18 or above for matrimony profiles"
                )
            if age > 100:
                raise HTTPException(
                    status_code=400,
                    detail="Age seems invalid. Please check your DOB"
                )
        except:
            verified_data["age"] = None
        
        # Create verification hash (don't store Aadhaar data)
        verification_hash = hashlib.sha256(
            f"{request.email}{verified_data['name']}{verified_data['dob']}".encode()
        ).hexdigest()[:16]
        
        return AadhaarVerificationResponse(
            success=True,
            verified_data={
                **verified_data,
                "verification_id": verification_hash,
                "verification_timestamp": datetime.now().isoformat()
            },
            message="Aadhaar verification successful"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Verification failed: {str(e)}")

@router.post("/update-verified-fields")
async def update_verified_fields(request: UpdateVerifiedFieldsRequest):
    """Update user profile with verified fields"""
    try:
        # Import here to avoid circular imports
        from app.database import db
        
        profile_collection = db["profiles"]
        
        # Update profile with verified fields
        update_data = {
            "isIdentityVerified": True,
            "verifiedName": request.verified_name,
            "verifiedDOB": request.verified_dob,
            "verifiedGender": request.verified_gender,
            "verificationSource": request.verification_source,
            "verificationTimestamp": datetime.now().isoformat(),
            "lastUpdated": datetime.now().isoformat()
        }
        
        result = await profile_collection.update_one(
            {"email": request.email},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            # Try to create a new profile entry if doesn't exist
            profile_data = {
                "email": request.email,
                **update_data
            }
            await profile_collection.insert_one(profile_data)
        
        return {
            "success": True,
            "message": "Verified fields updated successfully",
            "verified_fields": {
                "name": request.verified_name,
                "dob": request.verified_dob,
                "gender": request.verified_gender
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update verified fields: {str(e)}")

@router.get("/verification-status/{email}")
async def get_verification_status(email: str):
    """Get identity verification status for a user"""
    try:
        from app.database import db
        
        profile_collection = db["profiles"]
        profile = await profile_collection.find_one(
            {"email": email},
            {
                "isIdentityVerified": 1,
                "verifiedName": 1,
                "verifiedDOB": 1,
                "verifiedGender": 1,
                "verificationSource": 1,
                "verificationTimestamp": 1,
                "personalInfo.fullName": 1,
                "personalInfo.dob": 1,
                "personalInfo.gender": 1
            }
        )
        
        if not profile:
            return {
                "isVerified": False,
                "message": "No verification data found"
            }
        
        is_verified = profile.get("isIdentityVerified", False)
        
        response = {
            "isVerified": is_verified,
            "verificationSource": profile.get("verificationSource"),
            "verificationTimestamp": profile.get("verificationTimestamp")
        }
        
        if is_verified:
            response["verifiedFields"] = {
                "name": profile.get("verifiedName"),
                "dob": profile.get("verifiedDOB"),
                "gender": profile.get("verifiedGender")
            }
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get verification status: {str(e)}")

@router.post("/admin/override-verification")
async def admin_override_verification(
    email: str,
    admin_token: str,  # In production, use proper JWT auth
    unlock_fields: bool = False
):
    """Admin endpoint to override verification (for corrections)"""
    # In production, add proper admin authentication
    ADMIN_TOKEN = os.getenv("ADMIN_TOKEN", "secure-admin-token")
    
    if admin_token != ADMIN_TOKEN:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    try:
        from app.database import db
        
        profile_collection = db["profiles"]
        
        update_data = {}
        if unlock_fields:
            # Allow user to edit fields again
            update_data = {
                "isIdentityVerified": False,
                "verificationOverride": True,
                "verificationOverrideBy": "admin",
                "verificationOverrideAt": datetime.now().isoformat(),
                "lastUpdated": datetime.now().isoformat()
            }
        else:
            # Reset verification completely
            update_data = {
                "isIdentityVerified": False,
                "verifiedName": None,
                "verifiedDOB": None,
                "verifiedGender": None,
                "verificationSource": None,
                "verificationTimestamp": None,
                "lastUpdated": datetime.now().isoformat()
            }
        
        await profile_collection.update_one(
            {"email": email},
            {"$set": update_data}
        )
        
        return {
            "success": True,
            "message": "Verification override successful",
            "unlocked": unlock_fields
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Override failed: {str(e)}")