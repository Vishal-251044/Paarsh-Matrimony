from textblob import TextBlob
from fastapi import HTTPException
from app.database import db
from bson import ObjectId   # IMPORTANT

feedback_collection = db["feedbacks"]


def analyze_sentiment(text: str) -> float:
    blob = TextBlob(text)
    return blob.sentiment.polarity  # -1 to 1


def serialize_feedback(doc: dict) -> dict:
    """Convert Mongo ObjectId to string"""
    if "_id" in doc and isinstance(doc["_id"], ObjectId):
        doc["_id"] = str(doc["_id"])
    return doc


async def get_top_feedbacks():
    try:
        cursor = feedback_collection.find({})
        feedbacks = await cursor.to_list(length=100)

        positive_feedbacks = []

        for fb in feedbacks:
            # FIX: convert ObjectId
            fb = serialize_feedback(fb)

            experience_text = fb.get("experience", "")
            polarity = analyze_sentiment(experience_text)

            # only positive sentiment
            if polarity > 0.2:
                fb["sentiment_score"] = polarity
                positive_feedbacks.append(fb)

        # sort by sentiment + rating
        positive_feedbacks.sort(
            key=lambda x: (
                x.get("sentiment_score", 0),
                x.get("rating", 0)
            ),
            reverse=True
        )

        # top 4
        top_feedbacks = positive_feedbacks[:4]

        return {"feedbacks": top_feedbacks}

    except Exception as e:
        print("Feedback Error:", e)
        raise HTTPException(status_code=500, detail="Failed to fetch feedbacks")
