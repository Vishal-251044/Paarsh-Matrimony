from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.controllers import verify_tag_controller

router = APIRouter()


@router.get("/verification/check/{email}")
async def check_verification(email: str):
    """
    Check if a specific user is verified
    """
    return await verify_tag_controller.check_verification_status(email)


@router.post("/verification/bulk-check")
async def bulk_check_verification(emails: List[str]):
    """
    Check verification status for multiple emails at once
    """
    return await verify_tag_controller.check_bulk_verification_status(emails)


@router.post("/verification/batch-details")
async def get_verified_users_batch(emails: List[str]):
    """
    Get detailed verification info for multiple emails
    """
    return await verify_tag_controller.get_verified_users_batch(emails)