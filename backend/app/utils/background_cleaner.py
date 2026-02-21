# background_cleaner.py (updated for event loop issue)
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from app.database import db
from datetime import datetime
import asyncio

scheduler = AsyncIOScheduler()


async def clean_orphan_data():
    try:
        profiles = await db.profile.find({}, {"email": 1}).to_list(length=None)
        valid_emails = {p["email"] for p in profiles if p.get("email")}

        if not valid_emails:
            return

        deleted_watchlists = await db.watchlist.delete_many({
            "user_email": {"$nin": list(valid_emails)}
        })

        await db.watchlist.update_many(
            {},
            {"$pull": {"partners": {"partner_email": {"$nin": list(valid_emails)}}}}
        )

        await db.conversation.update_many(
            {},
            {"$pull": {"participants": {"email": {"$nin": list(valid_emails)}}}}
        )

        empty_convos = await db.conversation.find({"participants": {"$size": 0}}).to_list(length=None)
        if empty_convos:
            convo_ids = [c["_id"] for c in empty_convos]
            await db.conversation.delete_many({"_id": {"$in": convo_ids}})
            await db.message.delete_many({"conversation_id": {"$in": convo_ids}})

        await db.interest.delete_many({
            "$or": [
                {"sender_email": {"$nin": list(valid_emails)}},
                {"receiver_email": {"$nin": list(valid_emails)}}
            ]
        })

        await db.report.delete_many({
            "$or": [
                {"reporter_email": {"$nin": list(valid_emails)}},
                {"reported_email": {"$nin": list(valid_emails)}}
            ]
        })

    except Exception as e:
        print(f"[Cleanup][Error] {e}")


def start_scheduler():
    """
    Start APScheduler safely (prevents duplicate jobs on reload)
    """
    if not scheduler.running:
        loop = asyncio.get_event_loop()  # Use current running loop
        scheduler.add_job(
            lambda: loop.create_task(clean_orphan_data()),  
            trigger=IntervalTrigger(minutes=10),
            id="cleanup_job",
            replace_existing=True
        )
        scheduler.start()
