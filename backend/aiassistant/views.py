from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .services import chat_with_gemini


class AIChatView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        message = request.data.get("message", "").strip()
        context_type = request.data.get("context_type", "farming")

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

        if state == "unavailable":
            return Response(
                {
                    "available": False,
                    "message": (
                        "AI Assistant is not configured. Add GEMINI_API_KEY to enable "
                        "personalized farming, loan, scheme, and trust score guidance."
                    ),
                    "fallback_tips": [
                        "Complete your farmer profile to improve trust score.",
                        "Record land and crop data for better loan eligibility.",
                        "Apply to active government schemes from the Schemes page.",
                        "Complete marketplace transactions to build transaction history.",
                    ],
                }
            )

        if state == "error":
            return Response(
                {
                    "available": False,
                    "message": "AI service temporarily unavailable. Please try again later.",
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        return Response({"available": True, "reply": reply, "context_type": context_type})
