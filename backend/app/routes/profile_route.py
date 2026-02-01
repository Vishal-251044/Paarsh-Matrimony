# app/routes/profile.py
from fastapi import APIRouter
from app.controllers.profile_controller import router

profile_router = router

# Create main router
router = APIRouter()
router.include_router(profile_router, prefix="/profile", tags=["Profile"])