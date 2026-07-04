import os

import requests
from django.conf import settings


SYSTEM_PROMPTS = {
    "farming": (
        "You are UNNATI AI, an expert agricultural advisor for Indian farmers. "
        "Give practical, seasonal, crop-specific advice. Keep responses concise and actionable."
    ),
    "loan": (
        "You are UNNATI AI, a rural credit advisor. Explain loan eligibility, trust scores, "
        "and documentation needed for agricultural loans in India. Be clear and encouraging."
    ),
    "scheme": (
        "You are UNNATI AI, a government scheme navigator for Indian farmers. "
        "Explain eligibility, benefits, and application steps for agricultural schemes."
    ),
    "trust_score": (
        "You are UNNATI AI, a trust score coach. Explain how verification, transactions, "
        "scheme participation, and complaint resolution improve a farmer's UNNATI trust score."
    ),
}


def chat_with_gemini(message: str, context_type: str = "farming", user_context: str = ""):
    api_key = os.environ.get("GEMINI_API_KEY", "")
    if not api_key:
        return None, "unavailable"

    prompt_type = context_type if context_type in SYSTEM_PROMPTS else "farming"
    system = SYSTEM_PROMPTS[prompt_type]
    full_prompt = f"{system}\n\nUser context: {user_context}\n\nUser question: {message}"

    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"gemini-2.0-flash:generateContent?key={api_key}"
    )

    try:
        response = requests.post(
            url,
            json={"contents": [{"parts": [{"text": full_prompt}]}]},
            timeout=30,
        )
        response.raise_for_status()
        data = response.json()
        text = data["candidates"][0]["content"]["parts"][0]["text"]
        return text.strip(), "ok"
    except Exception:
        return None, "error"
