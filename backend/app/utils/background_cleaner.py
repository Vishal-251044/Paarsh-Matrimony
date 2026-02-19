from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.database import db
from datetime import datetime
from bson import ObjectId


scheduler = AsyncIOScheduler()


async def clean_orphan_data():

    # =========================
    # 1️⃣ Get valid profile emails
    # =========================
    profiles = await db.profile.find({}, {"email": 1}).to_list(length=None)
    valid_emails = {p["email"] for p in profiles}

    # If no profiles exist, stop (avoid deleting everything accidentally)
    if not valid_emails:
        return

    # =========================
    # 🟢 WATCHLIST CLEAN
    # =========================

    # Remove entire watchlist if owner no longer exists
    await db.watchlist.delete_many({
        "user_email": {"$nin": list(valid_emails)}
    })

    # Remove invalid partners from watchlists
    await db.watchlist.update_many(
        {},
        {
            "$pull": {
                "partners": {
                    "partner_email": {"$nin": list(valid_emails)}
                }
            }
        }
    )

    # =========================
    # 🟢 CHAT CLEAN (Optimized)
    # =========================

    # Find conversations where any participant email is invalid
    invalid_conversations = await db.conversation.find({
        "participants.email": {"$nin": list(valid_emails)}
    }).to_list(length=None)

    conversation_ids = [c["_id"] for c in invalid_conversations]

    if conversation_ids:
        # Delete conversations
        await db.conversation.delete_many({
            "_id": {"$in": conversation_ids}
        })

        # Delete related messages
        await db.message.delete_many({
            "conversation_id": {"$in": conversation_ids}
        })

    # =========================
    # 🟢 INTEREST CLEAN
    # =========================
    await db.interest.delete_many({
        "$or": [
            {"sender_email": {"$nin": list(valid_emails)}},
            {"receiver_email": {"$nin": list(valid_emails)}}
        ]
    })

    # =========================
    # 🟢 REPORT CLEAN
    # =========================
    await db.report.delete_many({
        "$or": [
            {"reporter_email": {"$nin": list(valid_emails)}},
            {"reported_email": {"$nin": list(valid_emails)}}
        ]
    })


def start_scheduler():
    """
    Start scheduler safely (prevents duplicate jobs on reload)
    """
    if not scheduler.running:
        scheduler.add_job(
            clean_orphan_data,
            "interval",        # change to "cron" for production
            minutes=10,        # change to seconds=30 for testing
            id="cleanup_job",
            replace_existing=True
        )
        scheduler.start()
