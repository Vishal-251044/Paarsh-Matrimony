from app.database import db
from bson import ObjectId
from datetime import datetime

contact_collection = db["contacts"]

def safe_object_id(id: str):
    try:
        return ObjectId(id)
    except:
        return None


async def get_all_contacts():
    contacts = []
    async for c in contact_collection.find().sort("created_at", -1):
        c["_id"] = str(c["_id"])
        c["status"] = c.get("status", "new")
        c["created_at"] = c.get("created_at", datetime.utcnow())
        contacts.append(c)
    return contacts


async def delete_contact(contact_id: str):
    oid = safe_object_id(contact_id)
    if not oid:
        return 0

    result = await contact_collection.delete_one({"_id": oid})
    return result.deleted_count


async def update_contact_status(contact_id: str, status: str):
    oid = safe_object_id(contact_id)
    if not oid:
        return 0

    result = await contact_collection.update_one(
        {"_id": oid},
        {"$set": {"status": status}}
    )
    return result.modified_count
