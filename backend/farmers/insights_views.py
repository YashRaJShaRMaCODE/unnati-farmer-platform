from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from farmers.services import (
    get_activity_timeline,
    get_farmer_achievements,
    get_farmer_badges,
    get_health_card,
    get_profile_completion,
    simulate_trust_score,
)
from schemes.services import recommend_schemes_for_farmer


class FarmerProfileStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not hasattr(request.user, "farmer_profile"):
            return Response(
                {"detail": "Farmer profile required."},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(get_profile_completion(request.user.farmer_profile))


class FarmerBadgesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        farmer_id = request.query_params.get("farmer_id")
        if farmer_id:
            from farmers.models import Farmer

            try:
                farmer = Farmer.objects.get(pk=farmer_id)
            except Farmer.DoesNotExist:
                return Response({"detail": "Farmer not found."}, status=404)
        elif hasattr(request.user, "farmer_profile"):
            farmer = request.user.farmer_profile
        else:
            return Response({"detail": "Farmer not found."}, status=404)
        return Response({"badges": get_farmer_badges(farmer)})


class FarmerAchievementsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not hasattr(request.user, "farmer_profile"):
            return Response({"detail": "Farmer profile required."}, status=404)
        return Response(
            {"achievements": get_farmer_achievements(request.user.farmer_profile)}
        )


class FarmerActivityTimelineView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not hasattr(request.user, "farmer_profile"):
            return Response({"detail": "Farmer profile required."}, status=404)
        return Response(
            {"timeline": get_activity_timeline(request.user.farmer_profile)}
        )


class FarmerHealthCardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        farmer_id = request.query_params.get("farmer_id")
        if farmer_id and request.user.role in ("admin", "bank", "government", "buyer"):
            from farmers.models import Farmer

            try:
                farmer = Farmer.objects.get(pk=farmer_id)
            except Farmer.DoesNotExist:
                return Response({"detail": "Farmer not found."}, status=404)
        elif hasattr(request.user, "farmer_profile"):
            farmer = request.user.farmer_profile
        else:
            return Response({"detail": "Farmer profile required."}, status=404)
        return Response(get_health_card(farmer))


class FarmerInsightsView(APIView):
    """Combined insights for dashboard — reduces API calls."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not hasattr(request.user, "farmer_profile"):
            return Response({"detail": "Farmer profile required."}, status=404)
        farmer = request.user.farmer_profile
        return Response(
            {
                "profile_completion": get_profile_completion(farmer),
                "badges": get_farmer_badges(farmer),
                "achievements": get_farmer_achievements(farmer),
                "activity_timeline": get_activity_timeline(farmer)[:10],
                "scheme_recommendations": recommend_schemes_for_farmer(farmer),
            }
        )


class TrustScoreSimulatorView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = simulate_trust_score(
            int(request.data.get("verification_score", 0)),
            int(request.data.get("transaction_score", 0)),
            int(request.data.get("buyer_rating_score", 0)),
            int(request.data.get("government_score", 0)),
            int(request.data.get("complaint_score", 0)),
        )
        current = None
        if hasattr(request.user, "farmer_profile"):
            from trustscore.models import TrustScore

            ts = TrustScore.objects.filter(farmer=request.user.farmer_profile).first()
            if ts:
                current = {
                    "total_score": ts.total_score,
                    "category": ts.category,
                    "breakdown": {
                        "verification_score": ts.verification_score,
                        "transaction_score": ts.transaction_score,
                        "buyer_rating_score": ts.buyer_rating_score,
                        "government_score": ts.government_score,
                        "complaint_score": ts.complaint_score,
                    },
                }
        return Response({"simulated": data, "current": current})


class SchemeRecommendationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not hasattr(request.user, "farmer_profile"):
            return Response({"detail": "Farmer profile required."}, status=404)
        return Response(
            {
                "recommendations": recommend_schemes_for_farmer(
                    request.user.farmer_profile
                )
            }
        )
