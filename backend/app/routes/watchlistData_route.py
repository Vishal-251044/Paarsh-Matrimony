from fastapi import APIRouter, Query
from app.controllers.watchlistData_controller import WatchlistDataController

router = APIRouter()
controller = WatchlistDataController()

@router.get("/watchlist-profiles/{user_email}")
async def get_watchlist(user_email: str):
    data = await controller.get_watchlist_profiles(user_email)
    return {"data": data}

@router.delete("/watchlist-remove")
async def remove_from_watchlist(
    user_email: str = Query(..., description="User's email"),
    partner_email: str = Query(..., description="Partner's email to remove")
):
    """Remove a partner from watchlist"""
    result = await controller.remove_from_watchlist(user_email, partner_email)
    return result