from fastapi import HTTPException
from bson import ObjectId
from datetime import datetime
from app.database import db

watchlist_collection = db.watchlists
profile_collection = db.profiles
users_collection = db.users   # 🔴 IMPORTANT – for online status


class WatchlistDataController:

    async def get_watchlist_profiles(self, user_email: str):
        try:
            # 1. Find user's watchlist
            watchlist = await watchlist_collection.find_one(
                {"user_email": user_email}
            )

            if not watchlist or not watchlist.get("partners"):
                return []

            partners = watchlist["partners"]

            # 2. Extract partner emails
            partner_emails = [p["partner_email"] for p in partners]

            # 3. Fetch partner profiles
            profiles_cursor = profile_collection.find(
                {"email": {"$in": partner_emails}}
            )

            profiles = await profiles_cursor.to_list(length=None)

            # 4. Map match scores
            score_map = {
                p["partner_email"]: p.get("match_score", 0)
                for p in partners
            }

            result = []

            for profile in profiles:

                # Convert Mongo ObjectId to string
                if "_id" in profile:
                    profile["_id"] = str(profile["_id"])

                email = profile.get("email")

                # Attach match score
                profile["match_score"] = score_map.get(email, 0)

                # ---------- ONLINE / OFFLINE STATUS (FIXED) ----------
                user_status = await users_collection.find_one(
                    {"email": email}
                )

                if user_status:
                    is_online = user_status.get("is_online", False)
                    last_seen = user_status.get("last_seen")

                    profile["isOnline"] = is_online

                    if not is_online and last_seen:
                        try:
                            profile["lastSeen"] = last_seen.isoformat()
                        except:
                            profile["lastSeen"] = None
                    else:
                        profile["lastSeen"] = None
                else:
                    profile["isOnline"] = False
                    profile["lastSeen"] = None
                # ------------------------------------------------------

                result.append(profile)

            return result or []

        except Exception as e:
            print("WatchlistDataController Error:", e)
            raise HTTPException(
                status_code=500,
                detail=f"Failed to fetch watchlist profiles: {str(e)}"
            )

    async def remove_from_watchlist(self, user_email: str, partner_email: str):
        """Remove a partner from user's watchlist"""
        try:
            # Find the watchlist document
            watchlist = await watchlist_collection.find_one(
                {"user_email": user_email}
            )

            if not watchlist:
                return {
                    "success": False,
                    "error": "Watchlist not found for this user"
                }

            partners = watchlist.get("partners", [])

            # Check if partner exists
            partner_exists = any(
                p["partner_email"] == partner_email for p in partners
            )

            if not partner_exists:
                return {
                    "success": False,
                    "error": "Partner not found in watchlist"
                }

            # Remove partner
            updated_partners = [
                p for p in partners if p["partner_email"] != partner_email
            ]

            # Update DB
            result = await watchlist_collection.update_one(
                {"user_email": user_email},
                {
                    "$set": {
                        "partners": updated_partners,
                        "updated_at": datetime.utcnow()
                    }
                }
            )

            if result.modified_count > 0:
                return {
                    "success": True,
                    "message": "Partner removed from watchlist successfully"
                }
            else:
                return {
                    "success": False,
                    "error": "Failed to remove partner from watchlist"
                }

        except Exception as e:
            print(f"Error removing from watchlist: {e}")
            return {
                "success": False,
                "error": f"Server error: {str(e)}"
            }
