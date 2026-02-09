from fastapi import APIRouter, Body
from app.controllers.userServicesShow_controller import search_services

router = APIRouter(prefix="/api/vendors", tags=["Vendors"])


@router.post("/search")
async def search_vendors(payload: dict = Body(...)):
    state = payload.get("state")
    city = payload.get("city")
    service = payload.get("service")

    if not state or not city or not service:
        return {"vendors": [], "message": "Missing required fields"}

    return await search_services(state, city, service)
