import jwt
import os
from datetime import datetime, timedelta
import pytz
import logging

logger = logging.getLogger(__name__)
ist = pytz.timezone('Asia/Kolkata')
JWT_SECRET = os.getenv("JWT_SECRET", "supersecret")

def create_access_token(data: dict, expires_delta: int = 60*60*24):
    to_encode = data.copy()
    expire = datetime.now(ist) + timedelta(seconds=expires_delta)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm="HS256")

def decode_access_token(token: str):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        
        # Optional: Add more validation
        if "exp" not in payload:
            logger.warning("Token missing expiration")
            return None
            
        return payload
    except jwt.ExpiredSignatureError:
        logger.error("Token has expired")
        return None
    except jwt.InvalidTokenError as e:
        logger.error(f"Invalid token: {str(e)}")
        return None
    except Exception as e:
        logger.error(f"Unexpected error decoding token: {str(e)}")
        return None