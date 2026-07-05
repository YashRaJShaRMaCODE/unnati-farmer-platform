from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .fallback_knowledge import get_fallback_reply, get_fallback_tips
from .services import chat_with_gemini


class AIChatView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        message = request.data.get("message", "").strip()
        context_type = request.data.get("context_type", "farming")
        locale = request.data.get("locale", "en")
        if locale not in ("en", "hi"):
            locale = "en"

        if not message:
            return Response(
                {"detail": "Message is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = request.user
        user_context = f"Role: {user.role}, Email: {user.email}"
        if hasattr(user, "farmer_profile"):
            farmer = user.farmer_profile
            user_context += (
                f", Verified: {farmer.verification_status}, "
                f"Experience: {farmer.experience_years} years"
            )
            if hasattr(farmer, "trust_score"):
                user_context += (
                    f", Trust Score: {farmer.trust_score.total_score} "
                    f"({farmer.trust_score.category})"
                )

        reply, state = chat_with_gemini(message, context_type, user_context)

        if state == "ok":
            return Response({"available": True, "reply": reply, "context_type": context_type})

        # AI unavailable — serve hardcoded guided answers instead of an error
        fallback_reply = get_fallback_reply(message, context_type, locale)
        return Response(
            {
                "available": True,
                "reply": fallback_reply,
                "fallback_mode": True,
                "context_type": context_type,
                "fallback_tips": get_fallback_tips(locale),
            }
        )
