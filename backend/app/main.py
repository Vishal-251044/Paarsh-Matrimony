from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import logging

# Only show ERROR logs, suppress INFO and WARNING
logging.basicConfig(level=logging.ERROR)

# Suppress specific loggers
logging.getLogger("uvicorn").setLevel(logging.ERROR)
logging.getLogger("uvicorn.access").setLevel(logging.ERROR)
logging.getLogger("uvicorn.error").setLevel(logging.ERROR)
logging.getLogger("fastapi").setLevel(logging.ERROR)

from app.utils.background_cleaner import start_scheduler

from app.routes import (
    auth_route,
    profile_route,
    payment_route,
    feedback_route,
    matches_route,
    showFeedback_route,
    contact_route,
    watchlist_route,
    watchlistData_route,
    delete_route,
    marriageAssistance_route,
    services_route,
    userServicesShow_route,
    feedback_admin_route,
    contact_admin_route,
    dashboard_admin_route,
    notification_admin_route,
    verification_admin_route,
    chatbot_route,
    similarity_route,
    kundali_route,
    activity_route,
    chat_route,
    chat_websocket,
    activityuserdata_route,
    report_admin_route,
    verify_doc_route,
    verify_tag_route,
    forgot_route
)

load_dotenv()

PORT = int(os.getenv("PORT", 5000))
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

app = FastAPI(title="FastAPI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers (same as before)
app.include_router(auth_route.router)
app.include_router(profile_route.router)
app.include_router(payment_route.router)
app.include_router(feedback_route.router)
app.include_router(matches_route.router)
app.include_router(showFeedback_route.router)
app.include_router(contact_route.router)
app.include_router(watchlist_route.router)
app.include_router(watchlistData_route.router, prefix="/api")
app.include_router(delete_route.router, prefix="/api", tags=["Delete"])
app.include_router(marriageAssistance_route.router, prefix="/api", tags=["Marriage Assistance"])
app.include_router(services_route.router)
app.include_router(userServicesShow_route.router)
app.include_router(feedback_admin_route.router)
app.include_router(contact_admin_route.router)
app.include_router(dashboard_admin_route.router)
app.include_router(notification_admin_route.router)
app.include_router(verification_admin_route.router)
app.include_router(chatbot_route.router)
app.include_router(similarity_route.router, prefix="/profile")
app.include_router(kundali_route.router)
app.include_router(activity_route.router)
app.include_router(chat_route.router)
app.include_router(chat_websocket.router)
app.include_router(activityuserdata_route.router)
app.include_router(report_admin_route.router)
app.include_router(verify_doc_route.router)
app.include_router(verify_tag_route.router, prefix="/api", tags=["verification"])
app.include_router(forgot_route.router, prefix="/auth", tags=["Forgot Password"])

@app.get("/")
async def root():
    return {"message": "Matrimony API is running"}

@app.on_event("startup")
async def startup_event():
    start_scheduler()

if __name__ == "__main__":
    import uvicorn
    # Run with suppressed logs
    uvicorn.run(
        "app.main:app", 
        host="0.0.0.0", 
        port=PORT, 
        reload=True,
        log_level="error",
        access_log=False
    )