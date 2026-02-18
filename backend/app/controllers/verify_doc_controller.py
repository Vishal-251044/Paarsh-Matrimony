from fastapi import HTTPException, UploadFile, status
from typing import Optional
from datetime import datetime
import tempfile
import os
import logging
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
import cloudinary
import cloudinary.uploader
from app.models.VerifyDoc import (
    VerificationDocument, 
    VerificationStatus, 
    DocumentType,
    VerificationResponse,
    VerificationStatusResponse
)

logger = logging.getLogger(__name__)

# Cloudinary configuration
CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME")
CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY")
CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET")

# Check if Cloudinary is configured
if not all([CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET]):
    logger.error("Cloudinary credentials not found in environment variables")
    raise ValueError("Cloudinary credentials are required")

# Configure Cloudinary
try:
    cloudinary.config(
        cloud_name=CLOUDINARY_CLOUD_NAME,
        api_key=CLOUDINARY_API_KEY,
        api_secret=CLOUDINARY_API_SECRET
    )
    logger.info("Cloudinary configured successfully")
except Exception as e:
    logger.error(f"Failed to configure Cloudinary: {str(e)}")
    raise

class VerificationController:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.collection = db.verification_documents
    
    async def _upload_to_cloudinary(self, file: UploadFile, email: str, document_type: str) -> str:
        """Upload image directly to Cloudinary"""
        temp_file = None
        try:
            # Create a temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as tmp:
                content = await file.read()
                tmp.write(content)
                temp_file = tmp.name
            
            # Upload to Cloudinary
            upload_result = cloudinary.uploader.upload(
                temp_file,
                folder=f"verification_documents/{email}",
                public_id=f"{document_type}_{datetime.utcnow().timestamp()}",
                resource_type="image"
            )
            
            return upload_result.get("secure_url")
            
        except Exception as e:
            logger.error(f"Error uploading to Cloudinary: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to upload document image to Cloudinary: {str(e)}"
            )
        finally:
            # Clean up temp file
            if temp_file and os.path.exists(temp_file):
                try:
                    os.remove(temp_file)
                except Exception as e:
                    logger.warning(f"Failed to delete temp file {temp_file}: {str(e)}")
            await file.seek(0)  # Reset file position
    
    async def submit_verification(
        self, 
        email: str, 
        document_type: str,
        document_number: str,
        file: UploadFile
    ) -> VerificationResponse:
        """Submit a new verification request"""
        
        # Check if user already has a pending verification
        existing = await self.collection.find_one({
            "email": email,
            "status": "pending"
        })
        
        if existing:
            raise HTTPException(
                status_code=400,
                detail="You already have a pending verification request"
            )
        
        # Check if already approved
        approved = await self.collection.find_one({
            "email": email,
            "status": "approved"
        })
        
        if approved:
            raise HTTPException(
                status_code=400,
                detail="Your profile is already verified"
            )
        
        # Upload image to Cloudinary
        try:
            logger.info(f"Uploading to Cloudinary for user: {email}")
            image_url = await self._upload_to_cloudinary(file, email, document_type)
        except Exception as e:
            logger.error(f"Image upload failed: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to process document image: {str(e)}"
            )
        
        # Create verification document
        verification = VerificationDocument(
            email=email,
            documentType=document_type,
            documentNumber=document_number,
            documentImageUrl=image_url,
            status=VerificationStatus.PENDING,
            submittedAt=datetime.utcnow()
        )
        
        # Insert into database
        result = await self.collection.insert_one(verification.dict())
        
        # Return response
        return VerificationResponse(
            id=str(result.inserted_id),
            email=email,
            documentType=document_type,
            documentNumber=document_number,
            documentImageUrl=image_url,
            status=VerificationStatus.PENDING,
            submittedAt=verification.submittedAt
        )
    
    async def get_verification_status(self, email: str) -> Optional[VerificationStatusResponse]:
        """Get verification status for a user"""
        
        verification = await self.collection.find_one(
            {"email": email},
            sort=[("submittedAt", -1)]
        )
        
        if not verification:
            return None
        
        return VerificationStatusResponse(
            status=verification["status"],
            documentType=verification.get("documentType"),
            documentNumber=verification.get("documentNumber"),
            rejectionReason=verification.get("rejectionReason"),
            submittedAt=verification.get("submittedAt")
        )