from fastapi import APIRouter
from app.controllers.report_admin_controller import (
    get_all_reports,
    delete_user_profile,
    send_warning_email
)

router = APIRouter(prefix="/admin", tags=["Admin"])

router.get("/reports")(get_all_reports)
router.delete("/delete-user/{email}")(delete_user_profile)
router.post("/send-warning")(send_warning_email)
