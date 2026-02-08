import os
import httpx
import re
from fastapi import HTTPException

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

if not OPENROUTER_API_KEY:
    raise ValueError("OPENROUTER_API_KEY not found in .env")

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"


# -------- TEXT FORMATTER --------
def format_ai_text(text: str) -> str:
    if not text:
        return ""

    # Convert **bold** → <b>bold</b>
    text = re.sub(r"\*\*(.*?)\*\*", r"<b>\1</b>", text)

    # Optional: Clean extra spaces
    text = text.strip()

    return text


# -------- CONTROLLER --------
async def marriage_assistance(data: dict):
    try:
        budget = data.get("budget")
        location = data.get("location")
        expenses = data.get("expenses", [])

        if not budget or not location:
            raise HTTPException(status_code=400, detail="Budget and location required")

        prompt = f"""
You are an Indian Marriage Financial Planner.

User Budget: {budget}
Location: {location}
Selected Expenses: {", ".join(expenses)}

Rules:
- Do NOT use ** symbols
- Use simple headings
- Use bullet points
- Keep answer concise
- Make it clean and readable

Provide:
1. Budget Distribution
2. Money Saving Tips
3. Future Financial Planning
"""

        headers = {
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
        }

        payload = {
            "model": "openrouter/auto",
            "messages": [
                {"role": "system", "content": "You are a helpful Indian financial advisor."},
                {"role": "user", "content": prompt},
            ],
            "max_tokens": 600,
        }

        async with httpx.AsyncClient(timeout=40.0) as client:
            response = await client.post(
                OPENROUTER_URL,
                headers=headers,
                json=payload,
            )

        if response.status_code != 200:
            print("OpenRouter HTTP Error:", response.text)
            raise Exception("AI HTTP Error")

        result = response.json()

        if "choices" not in result:
            print("OpenRouter Invalid Response:", result)
            raise Exception("Invalid AI response")

        raw_answer = result["choices"][0]["message"]["content"]
        formatted_answer = format_ai_text(raw_answer)

        return {
            "success": True,
            "answer": formatted_answer,
        }

    except Exception as e:
        print("Marriage AI Error:", e)

        fallback = """
<b>Marriage Budget Guidance</b>

Budget Split Idea:
• 40% Venue & Food  
• 15% Clothes & Jewelry  
• 10% Photography & Video  
• 10% Decoration & Music  
• 5% Rituals & Registration  
• 20% Savings & Emergency  

Money Saving Tips:
• Use Digital Invitations  
• Compare Vendors Before Booking  
• Avoid Unnecessary Luxury Items  
• Book Early for Discounts  

Future Financial Planning:
• Health Insurance for Both Partners  
• Emergency Fund (6 Months Expenses)  
• SIP / Mutual Fund Investments  
• Joint Bank Account for Transparency  
"""

        return {
            "success": False,
            "answer": fallback,
        }
