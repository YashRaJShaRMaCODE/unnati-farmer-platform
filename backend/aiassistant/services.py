import logging
import os

import requests

logger = logging.getLogger(__name__)

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

# Try lighter models first — they often have separate free-tier quota.
GEMINI_MODELS = (
    "gemini-2.0-flash-lite",
    "gemini-2.0-flash",
    "gemini-1.5-flash-8b",
)

GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"


def chat_with_gemini(message: str, context_type: str = "farming", user_context: str = ""):
    api_key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not api_key:
        return None, "unavailable"

    prompt_type = context_type if context_type in SYSTEM_PROMPTS else "farming"
    system = SYSTEM_PROMPTS[prompt_type]
    full_prompt = f"{system}\n\nUser context: {user_context}\n\nUser question: {message}"

    headers = {
        "Content-Type": "application/json",
        "x-goog-api-key": api_key,
    }
    payload = {"contents": [{"parts": [{"text": full_prompt}]}]}

    last_state = "error"
    for model in GEMINI_MODELS:
        url = GEMINI_API_URL.format(model=model)
        try:
            response = requests.post(url, headers=headers, json=payload, timeout=30)

            if response.status_code == 429:
                last_state = "quota_exceeded"
                logger.warning("Gemini quota exceeded for model %s", model)
                continue

            if response.status_code in (401, 403):
                logger.error("Gemini auth failed (%s) for model %s", response.status_code, model)
                return None, "invalid_key"

            if response.status_code == 404:
                logger.warning("Gemini model not found: %s", model)
                continue

            response.raise_for_status()
            data = response.json()
            text = data["candidates"][0]["content"]["parts"][0]["text"]
            return text.strip(), "ok"

        except requests.RequestException as exc:
            logger.warning("Gemini request failed for model %s: %s", model, exc)
            if getattr(exc, "response", None) is not None:
                status = exc.response.status_code
                if status == 429:
                    last_state = "quota_exceeded"
                elif status in (401, 403):
                    return None, "invalid_key"
            continue
        except (KeyError, IndexError, TypeError) as exc:
            logger.warning("Unexpected Gemini response for model %s: %s", model, exc)
            continue

    return None, last_state
