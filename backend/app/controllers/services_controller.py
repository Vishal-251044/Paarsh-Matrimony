from bson import ObjectId
from fastapi import HTTPException
from app.models.Services import ServiceModel, UpdateServiceModel
from app.database import db

collection = db.services 

async def get_services():
    services = []
    cursor = collection.find({})
    async for document in cursor:
        document["_id"] = str(document["_id"])
        services.append(document)
    return services

async def get_service(service_id: str):
    service = await collection.find_one({"_id": ObjectId(service_id)})
    if service:
        service["_id"] = str(service["_id"])
        return service
    raise HTTPException(status_code=404, detail="Service not found")

async def create_service(service: ServiceModel):
    result = await collection.insert_one(service.dict())
    new_service = await get_service(str(result.inserted_id))
    return new_service

async def update_service(service_id: str, service: UpdateServiceModel):
    existing_service = await collection.find_one({"_id": ObjectId(service_id)})
    if not existing_service:
        raise HTTPException(status_code=404, detail="Service not found")
    updated_data = {k: v for k, v in service.dict().items() if v is not None}
    await collection.update_one({"_id": ObjectId(service_id)}, {"$set": updated_data})
    return await get_service(service_id)

async def delete_service(service_id: str):
    result = await collection.delete_one({"_id": ObjectId(service_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Service not found")
    return {"message": "Service deleted successfully"}
