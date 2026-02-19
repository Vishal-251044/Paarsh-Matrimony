from fastapi import HTTPException
from app.models.User import UserCreate, UserLogin
from app.utils.jwt_handler import create_access_token
from app.database import db

import bcrypt
import os
import random
import time
from datetime import datetime
import aiosmtplib
import dns.resolver
import dns.exception
from email.message import EmailMessage
from datetime import timedelta
import pytz
from pydantic import BaseModel, EmailStr
from google.oauth2 import id_token
from google.auth.transport import requests
from bson import ObjectId
import httpx
import re
import socket
import asyncio

# Environment variables
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
EMAIL_USER = os.getenv("SENDER_EMAIL")
EMAIL_PASS = os.getenv("SENDER_PASSWORD")
ZEROBOUNCE_API_KEY = os.getenv("ZEROBOUNCE_API_KEY")

IST = pytz.timezone("Asia/Kolkata")


# ---------------- GOOGLE TOKEN SCHEMA ----------------
class GoogleToken(BaseModel):
    credential: str


# ---------------- MANUAL SIGNUP ----------------
async def signup(user: UserCreate):
    try:
        # OTP VERIFIED CHECK
        otp_record = await db.email_otps.find_one({
            "email": user.email,
            "verified": True
        })
        if not otp_record:
            raise HTTPException(status_code=400, detail="Email not verified")

        if await db.users.find_one({"email": user.email}):
            raise HTTPException(status_code=400, detail="Email already registered")

        hashed_pw = bcrypt.hashpw(
            user.password.encode(),
            bcrypt.gensalt()
        ).decode()

        user_doc = {
            "name": user.name,
            "email": user.email,
            "password": hashed_pw,
            "google_id": None,
            "is_online": True,
            "last_seen": datetime.now(IST),
            "created_at": datetime.now(IST),
            "updated_at": datetime.now(IST)
        }

        result = await db.users.insert_one(user_doc)
        user_id = str(result.inserted_id)

        # ✅ Remove OTP after successful signup
        await db.email_otps.delete_many({"email": user.email})

        token = create_access_token({"user_id": user_id})

        return {
            "user": {
                "id": user_id,
                "name": user.name,
                "email": user.email,
                "is_online": True,
                "last_seen": user_doc["last_seen"]
            },
            "token": token
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Signup error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


# ---------------- MANUAL LOGIN ----------------
async def login(user: UserLogin):
    try:
        existing = await db.users.find_one({"email": user.email})
        if not existing:
            raise HTTPException(status_code=404, detail="User not found")

        if existing.get("google_id") and not existing.get("password"):
            raise HTTPException(
                status_code=400,
                detail="You signed up using Google. Please login with Google."
            )

        if not bcrypt.checkpw(
            user.password.encode(),
            existing["password"].encode()
        ):
            raise HTTPException(status_code=401, detail="Invalid credentials")

        # Update online status
        await db.users.update_one(
            {"_id": existing["_id"]},
            {
                "$set": {
                    "is_online": True,
                    "last_seen": datetime.now(IST),
                    "updated_at": datetime.now(IST)
                }
            }
        )

        user_id = str(existing["_id"])
        token = create_access_token({"user_id": user_id})

        return {
            "user": {
                "id": user_id,
                "name": existing["name"],
                "email": existing["email"],
                "is_online": True,
                "last_seen": datetime.now(IST)
            },
            "token": token
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Login error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


# ---------------- GOOGLE LOGIN ----------------
async def google_login(google_token: GoogleToken):
    try:
        token = google_token.credential

        try:
            idinfo = id_token.verify_oauth2_token(
                token,
                requests.Request(),
                GOOGLE_CLIENT_ID,
                clock_skew_in_seconds=10
            )

            if idinfo['aud'] != GOOGLE_CLIENT_ID:
                raise HTTPException(status_code=401, detail="Invalid audience")

            if idinfo['exp'] < int(time.time()):
                raise HTTPException(status_code=401, detail="Token expired")

        except ValueError:
            raise HTTPException(status_code=401, detail="Invalid Google token")
        except Exception as e:
            print(f"Google token verification error: {e}")
            raise HTTPException(status_code=401, detail="Google authentication failed")

        email = idinfo.get("email")
        name = idinfo.get("name", "User")
        google_id = idinfo.get("sub")

        if not email:
            raise HTTPException(status_code=400, detail="Email not provided by Google")

        user = await db.users.find_one({
            "$or": [
                {"google_id": google_id},
                {"email": email}
            ]
        })

        if user:
            # Update existing user
            await db.users.update_one(
                {"_id": user["_id"]},
                {
                    "$set": {
                        "google_id": google_id,
                        "is_online": True,
                        "last_seen": datetime.now(IST),
                        "updated_at": datetime.now(IST)
                    }
                }
            )
            user_id = str(user["_id"])
        else:
            # New user
            result = await db.users.insert_one({
                "name": name,
                "email": email,
                "google_id": google_id,
                "password": None,
                "is_online": True,
                "last_seen": datetime.now(IST),
                "created_at": datetime.now(IST),
                "updated_at": datetime.now(IST)
            })
            user_id = str(result.inserted_id)

        access_token = create_access_token({"user_id": user_id})

        return {
            "user": {
                "id": user_id,
                "name": name,
                "email": email,
                "is_online": True,
                "last_seen": datetime.now(IST)
            },
            "token": access_token
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Google login error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


# ---------------- SET PASSWORD ----------------
async def set_password(email: str, new_password: str):
    try:
        user = await db.users.find_one({"email": email})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        hashed_pw = bcrypt.hashpw(
            new_password.encode(),
            bcrypt.gensalt()
        ).decode()

        await db.users.update_one(
            {"_id": user["_id"]},
            {
                "$set": {
                    "password": hashed_pw,
                    "updated_at": datetime.now(IST)
                }
            }
        )

        return {"message": "Password updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Set password error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


# # ---------------- EMAIL EXISTENCE VERIFICATION ----------------
# async def verify_email_exists(email: str) -> bool:
#     """Verify if email actually exists using ZeroBounce API"""
#     if not ZEROBOUNCE_API_KEY:
#         print("Warning: ZEROBOUNCE_API_KEY not set, skipping email existence verification")
#         return True  # Skip verification if no API key
    
#     try:
#         async with httpx.AsyncClient(timeout=10.0) as client:
#             response = await client.get(
#                 "https://api.zerobounce.net/v2/validate",
#                 params={
#                     "api_key": ZEROBOUNCE_API_KEY,
#                     "email": email,
#                     "ip_address": "127.0.0.1"
#                 }
#             )
            
#             if response.status_code == 200:
#                 data = response.json()
                
#                 status = data.get("status")

#                 if status in ["valid", "catch-all"]:
#                     return True
                
#                 # Only block clearly bad emails
#                 if status in ["invalid", "spamtrap", "abuse", "do_not_mail", "unknown"]:
#                     return False
                
#                 # Fallback allow
#                 return True

#             else:
#                 print(f"API error: {response.status_code}")
#                 return True  # Allow on API error to prevent blocking legitimate users
#     except asyncio.TimeoutError:
#         return True  # Allow on timeout
#     except Exception as e:
#         print(f"Email verification error: {e}")
#         return True  # Allow on error


# ---------------- SEND OTP ----------------
async def send_otp(email: EmailStr):
    try:
        # Basic email format validation
        if '@' not in email or '.' not in email.split('@')[1]:
            raise HTTPException(status_code=400, detail="Invalid email format")
        
        # Check if email has a valid domain structure
        try:
            local_part, domain = email.split('@')
            if len(local_part) == 0 or len(domain) < 4:
                raise HTTPException(status_code=400, detail="Invalid email format")
            
            # Check if domain has at least one dot and valid TLD
            if '.' not in domain or domain.endswith('.') or domain.startswith('.'):
                raise HTTPException(status_code=400, detail="Invalid email domain")
                
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid email format")
        
        # Check if user already exists
        existing_user = await db.users.find_one({"email": email})
        if existing_user:
            raise HTTPException(status_code=400, detail="User already registered. Please login.")
        
        # Validate email domain exists with MX records
        try:
            # Check MX records (mail exchange records)
            try:
                mx_records = dns.resolver.resolve(domain, 'MX')
                if not mx_records:
                    raise HTTPException(status_code=400, detail="Email domain cannot receive emails")
            except dns.resolver.NXDOMAIN:
                raise HTTPException(status_code=400, detail="Email domain does not exist")
            except dns.resolver.NoAnswer:
                # Try A records as fallback
                try:
                    a_records = dns.resolver.resolve(domain, 'A')
                    if not a_records:
                        raise HTTPException(status_code=400, detail="Email domain does not exist")
                except:
                    raise HTTPException(status_code=400, detail="Email domain does not exist")
            except Exception as e:
                print(f"DNS error for {domain}: {str(e)}")
                # Continue anyway - don't block on DNS errors
        
        except ImportError:
            print("dnspython not installed, skipping MX validation")
            # If dnspython is not installed, do basic domain check
            try:
                socket.gethostbyname(domain)
            except socket.gaierror:
                raise HTTPException(status_code=400, detail="Email domain does not exist")
        
        # Additional validation for Gmail addresses
        if domain.lower() == 'gmail.com':
            # Gmail addresses have minimum length requirements
            if len(local_part) < 6:
                raise HTTPException(status_code=400, detail="Invalid Gmail address")
            
            # Gmail usernames can only contain letters, numbers, and dots
            if not re.match(r'^[a-zA-Z0-9.]+$', local_part):
                raise HTTPException(status_code=400, detail="Invalid Gmail address format")
            
            # Gmail usernames cannot have consecutive dots
            if '..' in local_part:
                raise HTTPException(status_code=400, detail="Invalid Gmail address format")
            
            # Gmail usernames cannot start or end with dot
            if local_part.startswith('.') or local_part.endswith('.'):
                raise HTTPException(status_code=400, detail="Invalid Gmail address format")
            
        
        # if not await verify_email_exists(email):
        #     raise HTTPException(status_code=400, detail="Email address does not exist. Please check and try again.")
        
        # Generate OTP
        otp = str(random.randint(100000, 999999))
        expires_at = datetime.utcnow() + timedelta(minutes=5)

        # Clean up any existing OTPs
        await db.email_otps.delete_many({"email": email})

        # Save OTP to database
        await db.email_otps.insert_one({
            "email": email,
            "otp": otp,
            "expires_at": expires_at,
            "verified": False
        })

        # Try to send email
        try:
            await send_email_otp(email, otp)
        except HTTPException:
            # If email sending fails, clean up the OTP record
            await db.email_otps.delete_many({"email": email})
            raise
        except Exception as e:
            # If any other error occurs, clean up and raise generic error
            await db.email_otps.delete_many({"email": email})
            print(f"Email sending failed for {email}: {str(e)}")
            raise HTTPException(status_code=400, detail="Failed to send OTP")

        return {"message": "OTP sent successfully"}
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Send OTP error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


# ---------------- SEND EMAIL OTP ----------------
async def send_email_otp(to_email: str, otp: str):
    try:
        message = EmailMessage()
        message["From"] = EMAIL_USER
        message["To"] = to_email
        message["Subject"] = "Your Paarsh Matrimony OTP Code"

        message.set_content(f"""
Your Paarsh Matrimony OTP is: {otp}
This OTP will expire in 5 minutes.

If you didn't request this OTP, please ignore this email.
""")

        await aiosmtplib.send(
            message,
            hostname="smtp.gmail.com",
            port=587,
            start_tls=True,
            username=EMAIL_USER,
            password=EMAIL_PASS,
            timeout=30
        )
        
        return True

    except aiosmtplib.SMTPRecipientsRefused:
        raise HTTPException(status_code=400, detail="Email address does not exist")
    except aiosmtplib.SMTPServerDisconnected:
        raise HTTPException(status_code=400, detail="Email service temporarily unavailable. Please try again.")
    except aiosmtplib.SMTPException as e:
        raise HTTPException(status_code=400, detail="Failed to send OTP")
    except Exception as e:
        raise HTTPException(status_code=400, detail="Failed to send OTP")


# ---------------- VERIFY OTP ----------------
async def verify_otp(email: str, otp: str):
    try:
        otp = otp.strip()

        record = await db.email_otps.find_one({"email": email})

        if not record:
            raise HTTPException(status_code=404, detail="OTP not found. Please request a new OTP.")

        if record["verified"]:
            raise HTTPException(status_code=400, detail="OTP already used")

        if datetime.utcnow() > record["expires_at"]:
            raise HTTPException(status_code=400, detail="OTP expired. Please request a new OTP.")

        if record["otp"] != otp:
            raise HTTPException(status_code=400, detail="Invalid OTP")

        # ✅ Delete OTP after successful verification
        await db.email_otps.update_one(
            {"_id": record["_id"]},
            {"$set": {"verified": True}}
        )

        return {"message": "OTP verified successfully"}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")


# ---------------- LOGOUT ----------------
async def logout(user_id: str):
    try:
        await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {
                "$set": {
                    "is_online": False,
                    "last_seen": datetime.now(IST),
                    "updated_at": datetime.now(IST)
                }
            }
        )

        return {"message": "Logged out successfully"}
    except Exception as e:
        print(f"Logout error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")