from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.controllers.contact_admin_controller import (
    get_all_contacts,
    delete_contact,
    update_contact_status,
)

router = APIRouter(prefix="/api/admin/contacts", tags=["Admin Contacts"])


class StatusUpdate(BaseModel):
    status: str


@router.get("/")
async def fetch_contacts():
    return await get_all_contacts()


@router.delete("/{contact_id}")
async def remove_contact(contact_id: str):
    deleted = await delete_contact(contact_id)
    if deleted == 0:
        raise HTTPException(status_code=404, detail="Contact not found")
    return {"message": "Deleted successfully"}


@router.patch("/{contact_id}/status")
async def change_status(contact_id: str, body: StatusUpdate):
    if body.status not in ["new", "read", "archived"]:
        raise HTTPException(status_code=400, detail="Invalid status")

    updated = await update_contact_status(contact_id, body.status)
    if updated == 0:
        raise HTTPException(status_code=404, detail="Contact not found")

    return {"message": "Status updated"}
