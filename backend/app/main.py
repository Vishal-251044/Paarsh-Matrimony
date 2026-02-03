# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from app.routes import auth_route, profile_route, payment_route, feedback_route, matches_route

load_dotenv()

PORT = int(os.getenv("PORT", 5000))
FRONTEND_URL = os.getenv("FRONTEND_URL")

app = FastAPI(title="FastAPI Backend")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(auth_route.router)
app.include_router(profile_route.router)
app.include_router(payment_route.router)
app.include_router(feedback_route.router)
app.include_router(matches_route.router)
# app.include_router(watchlist_route.router)

@app.get("/")
async def root():
    return {"message": "Matrimony API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=PORT, reload=True)