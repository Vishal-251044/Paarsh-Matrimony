from app.database import db
from bson import ObjectId

feedback_collection = db["feedbacks"]

async def get_all_feedbacks():
    feedbacks = []
    async for fb in feedback_collection.find().sort("created_at", -1):
        fb["_id"] = str(fb["_id"])
        feedbacks.append(fb)
    return feedbacks


async def delete_feedback(feedback_id: str):
    result = await feedback_collection.delete_one(
        {"_id": ObjectId(feedback_id)}
    )
    return result.deleted_count
