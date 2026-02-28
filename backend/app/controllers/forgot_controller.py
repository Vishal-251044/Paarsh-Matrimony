from fastapi import HTTPException
from app.database import db
import os
import smtplib
from email.message import EmailMessage

class ForgotController:

    async def send_password_email(self, email: str):

        user = await db.users.find_one({"email": email})

        # Always return success message (security reason)
        if not user:
            return {"message": "If email exists, password sent."}

        password = user.get("password")

        # Setup email
        msg = EmailMessage()
        msg["From"] = f"{os.getenv('SENDER_NAME')} <{os.getenv('SENDER_EMAIL')}>"
        msg["To"] = email
        msg["Subject"] = "Paarsh Matrimony - Password Recovery"

        if password:
            msg.set_content(
                f"""
Hello {user.get('name')},

Your account password is:

{password}

Please login and change your password immediately.

Regards,
Paarsh Matrimony Team
"""
            )
        else:
            msg.set_content(
                f"""
Hello {user.get('name')},

Your account was created using Google login.
No password is set.

Please login using Google.

Regards,
Paarsh Matrimony Team
"""
            )

        # Send email
        try:
            with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
                server.login(
                    os.getenv("SENDER_EMAIL"),
                    os.getenv("SENDER_PASSWORD")
                )
                server.send_message(msg)
        except Exception as e:
            raise HTTPException(status_code=500, detail="Email sending failed")

        return {"message": "If email exists, password sent."}