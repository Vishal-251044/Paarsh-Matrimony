# notification_admin_controller.py
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from fastapi import HTTPException
from typing import List
from app.database import db

# Load env variables
SENDER_EMAIL = os.getenv("SENDER_EMAIL")
SENDER_PASSWORD = os.getenv("SENDER_PASSWORD")
SENDER_NAME = os.getenv("SENDER_NAME", "Paarsh Matrimony")  # Default name

# Collections
PROFILES_COLLECTION = db["profiles"]

# ----- Get users by type -----
async def get_users_by_type(user_type: str):
    users_list = []

    if user_type == "free":
        cursor = PROFILES_COLLECTION.find({"membershipPlan": {"$ne": "premium"}}, {"email": 1, "personalInfo.fullName": 1})
    elif user_type == "premium":
        cursor = PROFILES_COLLECTION.find({"membershipPlan": "premium"}, {"email": 1, "personalInfo.fullName": 1})
    elif user_type == "hidden":
        cursor = PROFILES_COLLECTION.find({"isPublished": False}, {"email": 1, "personalInfo.fullName": 1})
    elif user_type == "published":
        cursor = PROFILES_COLLECTION.find({"isPublished": True}, {"email": 1, "personalInfo.fullName": 1})
    else:
        raise HTTPException(status_code=400, detail="Invalid user type")

    async for user in cursor:
        if user.get("email"):  # Only include users with email
            users_list.append({
                "id": str(user["_id"]),
                "email": user["email"],
                "fullName": user.get("personalInfo", {}).get("fullName", "")
            })
    return users_list

# ----- Send emails -----
async def send_email_batch(emails: List[str], message: str):
    sent_count = 0

    for email in emails:
        try:
            # Create new message per email
            msg = MIMEMultipart()
            msg["From"] = f"{SENDER_NAME} <{SENDER_EMAIL}>"
            msg["To"] = email
            msg["Subject"] = "Notification from Paarsh Matrimony"

            msg.attach(MIMEText(message, "plain"))

            # Send email via Gmail SMTP
            with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
                server.login(SENDER_EMAIL, SENDER_PASSWORD)
                server.sendmail(SENDER_EMAIL, email, msg.as_string())

            sent_count += 1

        except smtplib.SMTPRecipientsRefused:
            print(f"[SKIPPED] Invalid recipient email: {email}")
            continue
        except Exception as e:
            print(f"[ERROR] Could not send to {email}: {e}")
            continue

    return sent_count

# ----- Main send notification function -----
async def send_notification(user_type: str, message: str):
    users = await get_users_by_type(user_type)
    emails = [u["email"] for u in users if u.get("email")]

    if not emails:
        raise HTTPException(status_code=404, detail=f"No users found to send notification for '{user_type}'")

    sent_count = await send_email_batch(emails, message)

    return {
        "message": f"Notification sent to {sent_count} users of type '{user_type}'",
        "total_users": len(emails),
        "sent_count": sent_count,
        "failed_count": len(emails) - sent_count
    }
