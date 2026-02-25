from fastapi import HTTPException, Depends, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import datetime, timedelta
import logging
from bson import ObjectId
from app.database import db
from app.utils.jwt_handler import decode_access_token, create_access_token

logger = logging.getLogger(__name__)

security = HTTPBearer()

async def verify_token(authorization: str = Header(None)):
    """
    Verify JWT token from Authorization header
    This is used directly in routes
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    try:
        # Extract token from "Bearer <token>"
        parts = authorization.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            raise HTTPException(
                status_code=401, 
                detail="Invalid authorization header format. Use 'Bearer <token>'"
            )
        
        token = parts[1]
        
        # Decode JWT token using your existing jwt_handler
        payload = decode_access_token(token)
        if not payload:
            raise HTTPException(status_code=401, detail="Invalid token or token expired")
        
        # Check if token is expired
        exp = payload.get("exp")
        if exp and datetime.fromtimestamp(exp) < datetime.now():
            raise HTTPException(status_code=401, detail="Token expired")
        
        # Get user_id from payload
        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token: missing user_id")
        
        # Verify user exists in database
        try:
            user = await db.users.find_one({"_id": ObjectId(user_id)})
            if not user:
                raise HTTPException(status_code=401, detail="User not found")
        except Exception as db_error:
            logger.error(f"Database error in verify_token: {str(db_error)}")
            raise HTTPException(status_code=503, detail="Database connection error")
        
        # Convert ObjectId to string
        user["_id"] = str(user["_id"])
        
        return {
            "user_id": user_id,
            "email": user.get("email"),
            "membershipType": user.get("membershipType", "free"),
            "fullName": user.get("fullName", "")
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Token verification error: {str(e)}")
        raise HTTPException(status_code=401, detail=f"Authentication failed")
    
# Alternative: Using HTTPBearer dependency
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Get current user from token (using HTTPBearer)
    This can be used as a dependency in routes
    """
    token = credentials.credentials
    
    try:
        # Decode JWT token using your existing jwt_handler
        payload = decode_access_token(token)
        if not payload:
            raise HTTPException(status_code=401, detail="Invalid token or token expired")
        
        exp = payload.get("exp")
        if exp and datetime.fromtimestamp(exp) < datetime.now():
            raise HTTPException(status_code=401, detail="Token expired")
        
        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        # Get full user details
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        
        # Convert ObjectId to string
        user["_id"] = str(user["_id"])
        
        return user
        
    except Exception as e:
        logger.error(f"Token verification error: {str(e)}")
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")

# For WebSocket authentication
async def verify_websocket_token(token: str):
    """
    Verify token for WebSocket connections
    """
    try:
        # Decode JWT token using your existing jwt_handler
        payload = decode_access_token(token)
        if not payload:
            logger.error("Invalid token or token expired")
            return None
        
        exp = payload.get("exp")
        if exp and datetime.fromtimestamp(exp) < datetime.now():
            logger.error("Token expired")
            return None
        
        user_id = payload.get("user_id")
        if not user_id:
            logger.error("Token missing user_id")
            return None
        
        # Verify user exists
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            logger.error(f"User not found for id: {user_id}")
            return None
        
        # Add user info to payload
        payload["email"] = user.get("email")
        payload["membershipType"] = user.get("membershipType", "free")
        payload["fullName"] = user.get("fullName", "")
        
        return payload
        
    except Exception as e:
        logger.error(f"WebSocket token verification error: {str(e)}")
        return None

# Function to refresh token
async def refresh_token(refresh_token: str):
    """Refresh access token using refresh token"""
    try:
        # Verify refresh token (you'll need to implement this based on your jwt_handler)
        payload = decode_access_token(refresh_token)
        if not payload:
            return None
        
        user_id = payload.get("user_id")
        if not user_id:
            return None
        
        # Get user
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            return None
        
        # Create new access token
        new_token = create_access_token(
            data={"user_id": user_id, "email": user.get("email")}
        )
        
        return {"access_token": new_token, "token_type": "bearer"}
        
    except Exception as e:
        logger.error(f"Token refresh error: {str(e)}")
        return None            