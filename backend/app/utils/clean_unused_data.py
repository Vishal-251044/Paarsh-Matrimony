from app.database import db
from datetime import datetime


async def clean_user_related_data(email: str):
    """
    Remove all related data of a user
    from Watchlist, Chat, Activity collections
    """

    # =========================
    # 🟢 WATCHLIST
    # =========================
    await db.watchlist.delete_many({
        "$or": [
            {"user_email": email},
            {"partners.partner_email": email}
        ]
    })

    # =========================
    # 🟢 CHAT
    # =========================

    # Find conversations where user is participant
    conversations = await db.conversation.find({
        "participants.email": email
    }).to_list(length=None)

    conversation_ids = [str(c["_id"]) for c in conversations]

    # Delete conversations
    await db.conversation.delete_many({
        "participants.email": email
    })

    # Delete messages of those conversations
    if conversation_ids:
        await db.message.delete_many({
            "conversation_id": {"$in": conversation_ids}
        })

    # =========================
    # 🟢 INTERESTS
    # =========================
    await db.interest.delete_many({
        "$or": [
            {"sender_email": email},
            {"receiver_email": email}
        ]
    })

    # =========================
    # 🟢 REPORTS
    # =========================
    await db.report.delete_many({
        "$or": [
            {"reporter_email": email},
            {"reported_email": email}
        ]
    })

    return {
        "success": True,
        "cleaned_for": email,
        "cleaned_at": datetime.now().isoformat()
    }
