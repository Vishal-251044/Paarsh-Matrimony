from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.models.Services import ServiceModel, UpdateServiceModel
from app.controllers import services_controller

router = APIRouter(prefix="/api/services", tags=["Services"])

@router.get("/", response_model=List[dict])
async def get_all_services():
    return await services_controller.get_services()

@router.post("/", response_model=dict)
async def add_service(service: ServiceModel):
    return await services_controller.create_service(service)

@router.put("/{service_id}", response_model=dict)
async def update_service(service_id: str, service: UpdateServiceModel):
    return await services_controller.update_service(service_id, service)

@router.delete("/{service_id}")
async def delete_service(service_id: str):
    return await services_controller.delete_service(service_id)
