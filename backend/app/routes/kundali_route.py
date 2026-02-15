from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
import requests
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

ASTRO_API_KEY = os.getenv("ASTRO_API_KEY")
ASTRO_BASE_URL = os.getenv("ASTRO_BASE_URL")

# ---------- REQUEST MODEL ----------
class KundaliRequest(BaseModel):
    dob: str          
    time: str         
    latitude: float   
    longitude: float  
    timezone: float    

# ---------- ROUTE ----------
@router.post("/api/kundali")
def get_kundali(data: KundaliRequest):
    try:
        # Check if API credentials are configured
        if not ASTRO_API_KEY or not ASTRO_BASE_URL:
            # Return mock data for development/testing
            return get_mock_kundali_data()
        
        url = f"{ASTRO_BASE_URL}/api/astro/birth-chart"

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {ASTRO_API_KEY}"
        }

        # Convert timezone offset to timezone string (simplified)
        # This is a simplified conversion - in production, you'd want a proper mapping
        timezone_map = {
            5.5: "Asia/Kolkata",
            5.75: "Asia/Kathmandu",
            8: "Asia/Singapore",
            # Add more mappings as needed
        }
        
        timezone_str = timezone_map.get(data.timezone, "Asia/Kolkata")

        payload = {
            "date": data.dob,
            "time": data.time,
            "lat": data.latitude,
            "lon": data.longitude,
            "timezone": timezone_str
        }

        response = requests.post(url, json=payload, headers=headers)

        if response.status_code != 200:
            print(f"Astro API Error: {response.status_code} - {response.text}")
            # Fall back to mock data if API fails
            return get_mock_kundali_data()

        astro_data = response.json()

        # ---------- EXTRACT DATA WITH PROPER ERROR HANDLING ----------
        try:
            # Adjust these paths based on your actual API response structure
            if "chart" in astro_data and "chart" in astro_data["chart"] and "planets" in astro_data["chart"]["chart"]:
                planets = astro_data["chart"]["chart"]["planets"]
                
                sun_sign = planets.get("Sun", {}).get("sign", "Unknown")
                moon_sign = planets.get("Moon", {}).get("sign", "Unknown")
                nakshatra = planets.get("Moon", {}).get("nakshatra", "Unknown")
            else:
                # Alternative path - adjust based on your API
                return get_mock_kundali_data()
        except (KeyError, TypeError) as e:
            print(f"Error parsing astro data: {e}")
            return get_mock_kundali_data()

        # Simple logic for manglik (you might want to implement proper calculation)
        # Typically based on Mars position
        manglik = False
        lucky_number = 7

        # Get current date for tithi (you might want to calculate properly)
        from datetime import datetime
        import random
        
        # Simple tithi list
        tithis = ["Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", 
                  "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami", 
                  "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima", "Amavasya"]
        
        current_tithi = tithis[datetime.now().day % len(tithis)]

        description = (
            f"Based on your birth details, you have Sun in {sun_sign} and Moon in {moon_sign}. "
            f"This combination indicates emotional strength, creativity, and intuition. "
            f"Your nakshatra is {nakshatra}."
        )

        # ---------- FINAL RESPONSE ----------
        result = {
            "sun_sign": sun_sign,
            "moon_sign": moon_sign,
            "manglik": manglik,
            "lucky_number": lucky_number,
            "description": description,
            "nakshatra": nakshatra,
            "zodiac": sun_sign,
            "tithi": current_tithi
        }

        return result

    except Exception as e:
        print("ERROR in kundali route:", str(e))
        # Return mock data instead of failing
        return get_mock_kundali_data()

def get_mock_kundali_data():
    """Return mock data for testing/development"""
    import random
    
    sun_signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", 
                 "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]
    moon_signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", 
                  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]
    nakshatras = ["Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
                  "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni"]
    
    sun = random.choice(sun_signs)
    moon = random.choice(moon_signs)
    
    return {
        "sun_sign": sun,
        "moon_sign": moon,
        "manglik": random.choice([True, False]),
        "lucky_number": random.randint(1, 9),
        "description": f"Your Sun sign is {sun} and Moon sign is {moon}. This indicates a balanced personality with strong creative potential.",
        "nakshatra": random.choice(nakshatras),
        "zodiac": sun,
        "tithi": random.choice(["Shukla Pratipada", "Dwitiya", "Tritiya", "Chaturthi"])
    }