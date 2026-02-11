from fastapi import HTTPException
from app.models.User import UserCreate, UserLogin, user_db_model
from app.utils.jwt_handler import create_access_token
from app.database import db

import bcrypt
import os
import time
from datetime import datetime
import pytz
from pydantic import BaseModel
from google.oauth2 import id_token
from google.auth.transport import requests
from bson import ObjectId

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
IST = pytz.timezone("Asia/Kolkata")


# ---------------- GOOGLE TOKEN SCHEMA ----------------
class GoogleToken(BaseModel):
    credential: str


# ---------------- MANUAL SIGNUP ----------------
async def signup(user: UserCreate):
    if await db.users.find_one({"email": user.email}):
        raise HTTPException(400, "Email already registered")

    hashed_pw = bcrypt.hashpw(
        user.password.encode(),
        bcrypt.gensalt()
    ).decode()

    # Online + last_seen added
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


# ---------------- MANUAL LOGIN ----------------
async def login(user: UserLogin):
    existing = await db.users.find_one({"email": user.email})
    if not existing:
        raise HTTPException(404, "User not found")

    if existing.get("google_id") and not existing.get("password"):
        raise HTTPException(
            400,
            "You signed up using Google. Please login with Google."
        )

    if not bcrypt.checkpw(
        user.password.encode(),
        existing["password"].encode()
    ):
        raise HTTPException(401, "Invalid credentials")

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


# ---------------- GOOGLE LOGIN ----------------
async def google_login(google_token: GoogleToken):
    token = google_token.credential

    try:
        idinfo = id_token.verify_oauth2_token(
            token,
            requests.Request(),
            GOOGLE_CLIENT_ID,
            clock_skew_in_seconds=10
        )

        if idinfo['aud'] != GOOGLE_CLIENT_ID:
            raise HTTPException(401, "Invalid audience")

        if idinfo['exp'] < int(time.time()):
            raise HTTPException(401, "Token expired")

    except ValueError:
        raise HTTPException(401, "Invalid Google token")
    except Exception as e:
        print(f"Google token verification error: {e}")
        raise HTTPException(401, "Google authentication failed")

    email = idinfo.get("email")
    name = idinfo.get("name", "User")
    google_id = idinfo.get("sub")

    if not email:
        raise HTTPException(400, "Email not provided by Google")

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


# ---------------- SET PASSWORD ----------------
async def set_password(email: str, new_password: str):
    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(404, "User not found")

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


# ---------------- LOGOUT ----------------
async def logout(user_id: str):
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
