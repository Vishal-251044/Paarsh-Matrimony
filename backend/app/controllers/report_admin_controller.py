from app.database import db
from fastapi import HTTPException
from email.message import EmailMessage
import aiosmtplib
import os

reports_collection = db["reports"]
profiles_collection = db["profiles"]
users_collection = db["users"]


# -------------------------------
# Helper: Mongo Serializer
# -------------------------------
def serialize_doc(doc):
    if "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc


# -------------------------------
# Get All Reports
# -------------------------------
async def get_all_reports():
    try:
        reports_cursor = reports_collection.find().sort("created_at", -1)
        reports = []

        async for report in reports_cursor:
            reports.append(serialize_doc(report))

        return {
            "success": True,
            "reports": reports
        }

    except Exception as e:
        print("REPORT FETCH ERROR:", e)
        raise HTTPException(status_code=500, detail="Failed to fetch reports")


# -------------------------------
# Delete User Profile
# -------------------------------
async def delete_user_profile(email: str):
    try:
        profile_res = await profiles_collection.delete_one({"email": email})
        user_res = await users_collection.delete_one({"email": email})
        await reports_collection.delete_many({"reported_email": email})

        if profile_res.deleted_count == 0 and user_res.deleted_count == 0:
            raise HTTPException(status_code=404, detail="User not found")

        return {
            "success": True,
            "message": "User profile deleted successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        print("DELETE USER ERROR:", e)
        raise HTTPException(status_code=500, detail="Failed to delete user")


# -------------------------------
# Send Warning Email
# -------------------------------
async def send_warning_email(data: dict):
    try:
        email = data.get("email")
        message = data.get("message")

        if not email or not message:
            raise HTTPException(status_code=400, detail="Email & message required")

        msg = EmailMessage()
        msg["From"] = os.getenv("SENDER_EMAIL")
        msg["To"] = email
        msg["Subject"] = "Account Warning Notice"
        msg.set_content(message)

        await aiosmtplib.send(
            msg,
            hostname="smtp.gmail.com",
            port=587,
            start_tls=True,
            username=os.getenv("SENDER_EMAIL"),
            password=os.getenv("SENDER_PASSWORD"),
        )

        return {"success": True, "message": "Email Sent"}

    except HTTPException:
        raise
    except Exception as e:
        print("EMAIL ERROR:", e)
        raise HTTPException(status_code=500, detail="Failed to send email")
