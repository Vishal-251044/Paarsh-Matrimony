from app.database import db
from datetime import datetime
from collections import defaultdict

USERS_COLLECTION = db["users"]
PROFILES_COLLECTION = db["profiles"]

PREMIUM_PRICE = 1999


async def get_dashboard_stats():
    total_users = await USERS_COLLECTION.count_documents({})

    premium_users = await PROFILES_COLLECTION.count_documents(
        {"membershipPlan": "premium"}
    )

    free_users = total_users - premium_users

    published_profiles = await PROFILES_COLLECTION.count_documents(
        {"isPublished": True}
    )

    hidden_profiles = await PROFILES_COLLECTION.count_documents(
        {"isPublished": False}
    )

    total_revenue = premium_users * PREMIUM_PRICE

    return {
        "totalUsers": total_users,
        "freeUsers": free_users,
        "premiumUsers": premium_users,
        "publishedProfiles": published_profiles,
        "hiddenProfiles": hidden_profiles,
        "totalRevenue": total_revenue
    }


async def get_monthly_logins():
    cursor = USERS_COLLECTION.find({}, {"lastLogin": 1})
    month_data = defaultdict(int)

    async for user in cursor:
        if "lastLogin" in user and user["lastLogin"]:
            dt = datetime.fromisoformat(user["lastLogin"])
            key = dt.strftime("%b")
            month_data[key] += 1

    return dict(month_data)


async def get_monthly_revenue():
    cursor = PROFILES_COLLECTION.find(
        {"membershipPlan": "premium"},
        {"membershipStartDate": 1}
    )

    month_data = defaultdict(int)

    async for profile in cursor:
        if "membershipStartDate" in profile and profile["membershipStartDate"]:
            dt = datetime.fromisoformat(profile["membershipStartDate"])
            key = dt.strftime("%b")
            month_data[key] += PREMIUM_PRICE

    return dict(month_data)
