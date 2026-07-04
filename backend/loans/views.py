from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.response import Response

from loans.models import LoanPrediction

from .filters import LoanPredictionFilter
from .permissions import LoanPermission
from .serializers import LoanEligibilityRequestSerializer, LoanPredictionSerializer
from .services import calculate_loan_eligibility


class LoanPredictionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = LoanPrediction.objects.select_related("farmer__user").all()
    serializer_class = LoanPredictionSerializer
    permission_classes = [LoanPermission]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = LoanPredictionFilter
    search_fields = ["farmer__user__email", "risk_category"]
    ordering_fields = ["created_at", "eligible_amount", "trust_score"]
    ordering = ["-created_at"]

    def get_queryset(self):
        user = self.request.user
        if user.role == "farmer" and hasattr(user, "farmer_profile"):
            return self.queryset.filter(farmer=user.farmer_profile)
        if user.role in ("admin", "bank"):
            return self.queryset
        return LoanPrediction.objects.none()

    @action(detail=False, methods=["post"], url_path="calculate")
    def calculate(self, request):
        user = request.user
        serializer = LoanEligibilityRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        if user.role == "farmer":
            if not hasattr(user, "farmer_profile"):
                return Response(
                    {"detail": "Farmer profile not found."},
                    status=status.HTTP_404_NOT_FOUND,
                )
            farmer = user.farmer_profile
        else:
            farmer_id = serializer.validated_data.get("farmer_id")
            if not farmer_id:
                return Response(
                    {"detail": "farmer_id is required."},
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

        prediction = calculate_loan_eligibility(farmer)
        return Response(
            LoanPredictionSerializer(prediction).data,
            status=status.HTTP_201_CREATED,
        )
