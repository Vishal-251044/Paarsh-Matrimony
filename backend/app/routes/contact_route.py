from fastapi import APIRouter
from app.controllers.contact_controller import create_contact
from app.models.Contact import Contact

router = APIRouter(prefix="/api")

@router.post("/contact")
async def save_contact(data: Contact):
    return await create_contact(data)
