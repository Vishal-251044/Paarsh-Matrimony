from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.controllers.verify_doc_controller import VerificationController
from app.models.VerifyDoc import VerificationStatusResponse, VerificationResponse
from app.database import db
import logging

router = APIRouter(prefix="/verification", tags=["Verification"])
logger = logging.getLogger(__name__)

def get_verification_controller():
    return VerificationController(db)

@router.post("/submit", response_model=VerificationResponse)
async def submit_verification(
    email: str = Form(...),
    documentType: str = Form(...),
    documentNumber: str = Form(...),
    documentImage: UploadFile = File(...),
    controller: VerificationController = Depends(get_verification_controller)
):
    """Submit a document for profile verification"""
    
    # Validate email
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is required"
        )
    
    # Validate document type
    valid_types = ["aadhar", "pan", "driving_license"]
    if documentType not in valid_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid document type. Must be one of: {', '.join(valid_types)}"
        )
    
    # Validate document number based on type
    if documentType == "aadhar":
        if not documentNumber.isdigit() or len(documentNumber) != 12:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Aadhar number must be exactly 12 digits"
            )
    elif documentType == "pan":
        if len(documentNumber) != 10 or not documentNumber.isalnum():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="PAN number must be exactly 10 alphanumeric characters"
        )
    
    # Validate image
    if not documentImage.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image"
        )
    
    # Check file size (max 5MB)
    file_size = 0
    content = await documentImage.read()
    file_size = len(content)
    await documentImage.seek(0)  # Reset file position
    
    if file_size > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Image size must be less than 5MB"
        )
    
    try:
        result = await controller.submit_verification(
            email=email,
            document_type=documentType,
            document_number=documentNumber,
            file=documentImage
        )
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Verification submission error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to submit verification request"
        )

@router.get("/status/{email}", response_model=VerificationStatusResponse)
async def get_verification_status(
    email: str,
    controller: VerificationController = Depends(get_verification_controller)
):
    """Get verification status for a user"""
    
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is required"
        )
    
    verification_status = await controller.get_verification_status(email)
    
    if not verification_status:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No verification record found"
        )
    
    return verification_status