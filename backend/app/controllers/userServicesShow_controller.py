from fastapi import HTTPException
from app.database import db  
from bson import ObjectId

collection = db["services"]  


async def search_services(state: str, city: str, category: str):
    try:
        query = {
            "state": {"$regex": state, "$options": "i"},
            "city": {"$regex": city, "$options": "i"},
            "category": {"$regex": category, "$options": "i"},
        }

        vendors = []
        cursor = collection.find(query)

        async for doc in cursor:
            vendors.append({
    "name": doc.get("providerName"),
    "service": doc.get("category"),
    "city": doc.get("city"),
    "state": doc.get("state"),
    "phone": doc.get("contactNumber"),
    "discount": doc.get("discountRate"),
    "token": doc.get("discountToken"),   # ADD THIS
})
        return {"vendors": vendors}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
