from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.response import Response

from trustscore.models import TrustScore

from .filters import TrustScoreFilter
from .permissions import TrustScorePermission
from .serializers import TrustScoreSerializer
from .services import recalculate_farmer_trust_score


class TrustScoreViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TrustScore.objects.select_related("farmer__user").all()
    serializer_class = TrustScoreSerializer
    permission_classes = [TrustScorePermission]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = TrustScoreFilter
    search_fields = ["farmer__user__email", "category"]
    ordering_fields = ["total_score", "calculated_at"]
    ordering = ["-total_score"]

    def get_queryset(self):
        user = self.request.user
        if user.role == "farmer" and hasattr(user, "farmer_profile"):
            return self.queryset.filter(farmer=user.farmer_profile)
        if user.role in ("admin", "bank", "government"):
            return self.queryset
        return TrustScore.objects.none()

    @action(detail=False, methods=["post"], url_path="recalculate")
    def recalculate(self, request):
        user = request.user
        if user.role == "farmer":
            if not hasattr(user, "farmer_profile"):
                return Response(
                    {"detail": "Farmer profile not found."},
                    status=status.HTTP_404_NOT_FOUND,
                )
            score = recalculate_farmer_trust_score(user.farmer_profile)
            return Response(TrustScoreSerializer(score).data)

        farmer_id = request.data.get("farmer_id")
        if not farmer_id:
            return Response(
                {"detail": "farmer_id is required for admin/bank/government."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        from farmers.models import Farmer

        try:
            farmer = Farmer.objects.get(pk=farmer_id)
        except Farmer.DoesNotExist:
            return Response(
                {"detail": "Farmer not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        score = recalculate_farmer_trust_score(farmer)
        return Response(TrustScoreSerializer(score).data)
