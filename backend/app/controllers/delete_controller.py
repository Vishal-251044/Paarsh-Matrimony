from fastapi import HTTPException
from app.database import db
from app.utils.clean_unused_data import clean_user_related_data

async def delete_user_complete_data(email: str):
    try:
        # Collections
        user_collection = db["users"]
        profile_collection = db["profiles"]
        watchlist_collection = db["watchlists"]

        # Delete User
        user_result = await user_collection.delete_one({"email": email})

        # Delete Profile
        profile_result = await profile_collection.delete_one({"email": email})

        # Delete Watchlist (user as owner)
        watchlist_result = await watchlist_collection.delete_one({"user_email": email})

        # Also remove if user is partner in others' watchlists
        await watchlist_collection.update_many(
            {},
            {"$pull": {"partners": {"partner_email": email}}}
        )

        if user_result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
        
        await clean_user_related_data(email)

        return {
            "message": "User and all related data deleted successfully",
            "deleted": {
                "user": user_result.deleted_count,
                "profile": profile_result.deleted_count,
                "watchlist": watchlist_result.deleted_count
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
