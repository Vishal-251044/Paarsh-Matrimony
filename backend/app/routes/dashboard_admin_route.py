from fastapi import APIRouter
from app.controllers.dashboard_admin_controller import (
    get_dashboard_stats,
    get_monthly_logins,
    get_monthly_revenue
)

router = APIRouter(prefix="/admin/dashboard", tags=["Admin Dashboard"])


@router.get("/stats")
async def dashboard_stats():
    return await get_dashboard_stats()


@router.get("/logins")
async def monthly_logins():
    return await get_monthly_logins()


@router.get("/revenue")
async def monthly_revenue():
    return await get_monthly_revenue()
