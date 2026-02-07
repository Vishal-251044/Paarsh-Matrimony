from fastapi import HTTPException
from datetime import datetime
from app.database import db
from app.models.Contact import Contact

contact_collection = db["contacts"]

async def create_contact(data: Contact):
    try:
        contact_dict = data.dict()
        contact_dict["created_at"] = datetime.utcnow()

        result = await contact_collection.insert_one(contact_dict)

        return {
            "success": True,
            "message": "Contact saved successfully",
            "id": str(result.inserted_id)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
