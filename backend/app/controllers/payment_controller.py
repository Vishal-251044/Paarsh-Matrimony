import razorpay
import os
from fastapi import APIRouter, HTTPException
from datetime import datetime, timedelta
import hmac
import hashlib
from app.database import db

router = APIRouter()

# Razorpay configuration
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")

# Database collection
profile_collection = db["profiles"]

@router.post("/create-order")
async def create_payment_order(data: dict):
    """
    Create a Razorpay order for the given plan and amount.
    """
    try:
        client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

        amount = data.get("amount")
        currency = data.get("currency", "INR")
        receipt = data.get("receipt")
        plan = data.get("plan")
        email = data.get("email")

        if not all([amount, receipt, plan, email]):
            raise HTTPException(status_code=400, detail="Missing required fields")

        order_data = {
            "amount": amount,  # amount in paise
            "currency": currency,
            "receipt": receipt,
            "notes": {
                "plan": plan,
                "email": email
            }
        }

        order = client.order.create(data=order_data)

        return {
            "id": order["id"],
            "amount": order["amount"],
            "currency": order["currency"],
            "receipt": order["receipt"]
        }

    except Exception as e:
        print(f"Error creating payment order: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create payment order: {str(e)}")


@router.post("/verify")
async def verify_payment(data: dict):
    """
    Verify Razorpay payment and update membership info in database.
    """
    try:
        razorpay_order_id = data.get("razorpay_order_id")
        razorpay_payment_id = data.get("razorpay_payment_id")
        razorpay_signature = data.get("razorpay_signature")
        plan = data.get("plan")
        email = data.get("email")

        if not all([razorpay_order_id, razorpay_payment_id, razorpay_signature, plan, email]):
            raise HTTPException(status_code=400, detail="Missing required payment details")

        # Verify payment signature
        body = razorpay_order_id + "|" + razorpay_payment_id
        generated_signature = hmac.new(
            RAZORPAY_KEY_SECRET.encode(),
            body.encode(),
            hashlib.sha256
        ).hexdigest()

        if generated_signature != razorpay_signature:
            raise HTTPException(status_code=400, detail="Payment verification failed")

        # Set membership start and expiry dates
        start_date = datetime.now()
        expiry_date = start_date + timedelta(days=365)

        # Update user's membership plan in database
        await profile_collection.update_one(
            {"email": email},
            {
                "$set": {
                    "membershipPlan": plan,
                    "membershipStartDate": start_date.isoformat(),
                    "membershipExpiryDate": expiry_date.isoformat(),
                    "lastUpdated": datetime.now().isoformat()
                }
            },
            upsert=True
        )

        return {
            "success": True,
            "message": "Payment verified and membership upgraded successfully",
            "payment_id": razorpay_payment_id,
            "plan": plan,
            "membershipStartDate": start_date.isoformat(),
            "membershipExpiryDate": expiry_date.isoformat()
        }

    except Exception as e:
        print(f"Error verifying payment: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Payment verification failed: {str(e)}")


@router.get("/check-membership/{email}")
async def check_membership(email: str):
    """
    Check user's membership status and UPDATE DATABASE if expired.
    """
    try:
        profile = await profile_collection.find_one({"email": email})

        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")

        plan = profile.get("membershipPlan", "free")
        start_str = profile.get("membershipStartDate")
        expiry_str = profile.get("membershipExpiryDate")

        is_premium = plan != "free"
        is_active = False
        current_plan = plan

        if is_premium and expiry_str:
            expiry_date = datetime.fromisoformat(expiry_str)
            now = datetime.now()
            if now <= expiry_date:
                is_active = True
            else:
                # 🔴 THIS IS THE KEY FIX - UPDATE DATABASE TO FREE
                await profile_collection.update_one(
                    {"email": email},
                    {
                        "$set": {
                            "membershipPlan": "free",  # Actually change the plan
                            "lastUpdated": datetime.now().isoformat()
                        }
                    }
                )
                # Update response values
                current_plan = "free"
                is_premium = False
                is_active = False

        return {
            "membership_plan": current_plan,  # Will be "free" if expired
            "is_premium": is_premium,
            "is_active": is_active,
            "membershipStartDate": start_str,
            "membershipExpiryDate": expiry_str
        }

    except Exception as e:
        print(f"Error checking membership: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))