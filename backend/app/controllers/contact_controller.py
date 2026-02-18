from fastapi import HTTPException
from datetime import datetime
import pytz
from app.database import db
from app.models.Contact import Contact

contact_collection = db["contacts"]
ist = pytz.timezone('Asia/Kolkata')

async def create_contact(data: Contact):
    try:
        contact_dict = data.dict()
        contact_dict["created_at"] = datetime.now(ist)

        result = await contact_collection.insert_one(contact_dict)

        return {
            "success": True,
            "message": "Contact saved successfully",
            "id": str(result.inserted_id)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
