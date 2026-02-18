from fastapi import HTTPException, status
from app.database import db
from app.models.Watchlist import WatchlistCreate, WatchlistInDB, WatchlistPartner
from bson import ObjectId
from datetime import datetime
import pytz
from typing import List, Optional
import logging

ist = pytz.timezone('Asia/Kolkata')
logger = logging.getLogger(__name__)

class WatchlistController:
    def __init__(self):
        self.collection = db["watchlists"]

    async def add_to_watchlist(self, watchlist_data: WatchlistCreate) -> WatchlistInDB:
        """
        Add a partner to user's watchlist
        If user doesn't have a watchlist document, create one
        """
        try:
            # Check if partner already exists in user's watchlist
            existing_watchlist = await self.collection.find_one({
                "user_email": watchlist_data.user_email,
                "partners.partner_email": watchlist_data.partner_email
            })
            
            if existing_watchlist:
                # Update existing partner's match_score
                result = await self.collection.update_one(
                    {
                        "user_email": watchlist_data.user_email,
                        "partners.partner_email": watchlist_data.partner_email
                    },
                    {
                        "$set": {
                            "partners.$.match_score": watchlist_data.match_score,
                            "partners.$.added_at": datetime.now(ist),
                            "updated_at": datetime.now(ist)
                        }
                    }
                )
                
                if result.modified_count == 0:
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail="Failed to update watchlist"
                    )
            else:
                # Add new partner to watchlist
                new_partner = WatchlistPartner(
                    partner_email=watchlist_data.partner_email,
                    match_score=watchlist_data.match_score
                )
                
                # Try to update existing watchlist or create new one
                result = await self.collection.update_one(
                    {"user_email": watchlist_data.user_email},
                    {
                        "$push": {"partners": new_partner.dict()},
                        "$set": {"updated_at": datetime.now(ist)},
                        "$setOnInsert": {"user_email": watchlist_data.user_email}
                    },
                    upsert=True
                )
                
                if not result.acknowledged:
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail="Failed to add to watchlist"
                    )

            # Get the updated watchlist
            watchlist = await self.collection.find_one({"user_email": watchlist_data.user_email})
            
            if not watchlist:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to retrieve watchlist"
                )
            
            # Convert ObjectId to string
            watchlist["_id"] = str(watchlist["_id"])
            
            return WatchlistInDB(**watchlist)
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error adding to watchlist: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to add to watchlist: {str(e)}"
            )

    async def remove_from_watchlist(self, user_email: str, partner_email: str) -> bool:
        """
        Remove a partner from user's watchlist
        """
        try:
            # Remove partner from array
            result = await self.collection.update_one(
                {"user_email": user_email},
                {
                    "$pull": {"partners": {"partner_email": partner_email}},
                    "$set": {"updated_at": datetime.now(ist)}
                }
            )
            
            if result.modified_count == 0:
                # Check if user has a watchlist
                user_watchlist = await self.collection.find_one({"user_email": user_email})
                if not user_watchlist:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail="Watchlist not found"
                    )
                else:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail="Profile not found in watchlist"
                    )
            
            # If no partners left, delete the entire watchlist document
            updated_watchlist = await self.collection.find_one({"user_email": user_email})
            if updated_watchlist and not updated_watchlist.get("partners"):
                await self.collection.delete_one({"user_email": user_email})
            
            return True
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error removing from watchlist: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to remove from watchlist: {str(e)}"
            )

    async def get_user_watchlist(self, user_email: str) -> Optional[WatchlistInDB]:
        """
        Get user's watchlist
        Returns None if user doesn't have a watchlist
        """
        try:
            watchlist = await self.collection.find_one({"user_email": user_email})
            
            if not watchlist:
                return None
            
            # Convert ObjectId to string
            watchlist["_id"] = str(watchlist["_id"])
            
            return WatchlistInDB(**watchlist)
            
        except Exception as e:
            logger.error(f"Error fetching watchlist: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to fetch watchlist: {str(e)}"
            )

    async def is_in_watchlist(self, user_email: str, partner_email: str) -> bool:
        """
        Check if a partner is in user's watchlist
        """
        try:
            existing = await self.collection.find_one({
                "user_email": user_email,
                "partners.partner_email": partner_email
            })
            
            return existing is not None
            
        except Exception as e:
            logger.error(f"Error checking watchlist: {str(e)}")
            return False

    async def get_watchlist_partners(self, user_email: str) -> List[str]:
        """
        Get just the partner emails from user's watchlist
        """
        try:
            watchlist = await self.collection.find_one({"user_email": user_email})
            
            if not watchlist or "partners" not in watchlist:
                return []
            
            # Extract partner emails
            partner_emails = [partner["partner_email"] for partner in watchlist["partners"]]
            return partner_emails
            
        except Exception as e:
            logger.error(f"Error getting watchlist partners: {str(e)}")
            return []