from fastapi import APIRouter, HTTPException, status
from app.models.Watchlist import WatchlistCreate, WatchlistResponse, WatchlistInDB
from app.controllers.watchlist_controller import WatchlistController
from typing import List, Optional

router = APIRouter(
    prefix="/api/watchlist",
    tags=["watchlist"],
    responses={404: {"description": "Not found"}},
)

watchlist_controller = WatchlistController()

@router.post("/add", response_model=WatchlistResponse, status_code=status.HTTP_201_CREATED)
async def add_to_watchlist(watchlist_data: WatchlistCreate):
    """
    Add a profile to watchlist
    """
    return await watchlist_controller.add_to_watchlist(watchlist_data)

@router.delete("/remove", status_code=status.HTTP_200_OK)
async def remove_from_watchlist(user_email: str, partner_email: str):
    """
    Remove a profile from watchlist
    """
    success = await watchlist_controller.remove_from_watchlist(user_email, partner_email)
    if success:
        return {"success": True, "message": "Removed from watchlist successfully"}
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Failed to remove from watchlist"
    )

@router.get("/{user_email}", response_model=Optional[WatchlistResponse])
async def get_watchlist(user_email: str):
    """
    Get user's complete watchlist
    """
    watchlist = await watchlist_controller.get_user_watchlist(user_email)
    if not watchlist:
        return {"success": True, "message": "No watchlist found", "watchlist": None}
    return watchlist

@router.get("/check/{user_email}/{partner_email}")
async def check_watchlist(user_email: str, partner_email: str):
    """
    Check if a profile is in user's watchlist
    """
    is_in_watchlist = await watchlist_controller.is_in_watchlist(user_email, partner_email)
    return {
        "success": True,
        "is_in_watchlist": is_in_watchlist,
        "user_email": user_email,
        "partner_email": partner_email
    }

@router.get("/partners/{user_email}")
async def get_watchlist_partners(user_email: str):
    """
    Get just the partner emails from user's watchlist
    """
    partner_emails = await watchlist_controller.get_watchlist_partners(user_email)
    return {
        "success": True,
        "user_email": user_email,
        "partners": partner_emails,
        "count": len(partner_emails)
    }