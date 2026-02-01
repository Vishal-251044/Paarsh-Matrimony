from fastapi import APIRouter
from app.controllers.payment_controller import router

payment_router = router

# Create main router
router = APIRouter()
router.include_router(payment_router, prefix="/payment", tags=["Payment"])