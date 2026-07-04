from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.filters import OrderingFilter, SearchFilter

from schemes.models import GovernmentScheme, SchemeApplication

from .filters import GovernmentSchemeFilter, SchemeApplicationFilter
from .permissions import SchemeApplicationPermission, SchemePermission
from .serializers import GovernmentSchemeSerializer, SchemeApplicationSerializer


class GovernmentSchemeViewSet(viewsets.ModelViewSet):
    queryset = GovernmentScheme.objects.all()
    serializer_class = GovernmentSchemeSerializer
    permission_classes = [SchemePermission]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = GovernmentSchemeFilter
    search_fields = ["name", "description"]
    ordering_fields = ["start_date", "benefit_amount", "created_at"]
    ordering = ["-created_at"]


class SchemeApplicationViewSet(viewsets.ModelViewSet):
    queryset = SchemeApplication.objects.select_related(
        "farmer__user", "scheme"
    ).all()
    serializer_class = SchemeApplicationSerializer
    permission_classes = [SchemeApplicationPermission]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = SchemeApplicationFilter
    search_fields = ["farmer__user__email", "scheme__name"]
    ordering_fields = ["applied_at", "status"]
    ordering = ["-applied_at"]

    def get_queryset(self):
        user = self.request.user
        if user.role == "farmer" and hasattr(user, "farmer_profile"):
            return self.queryset.filter(farmer=user.farmer_profile)
        if user.role in ("admin", "government", "bank"):
            return self.queryset
        return SchemeApplication.objects.none()

    def perform_create(self, serializer):
        farmer = self.request.user.farmer_profile
        scheme = serializer.validated_data["scheme"]
        from schemes.services import validate_unique_application

        validate_unique_application(farmer, scheme)
        serializer.save(farmer=farmer)

    def perform_update(self, serializer):
        instance = serializer.save()
        if instance.status == "approved":
            from trustscore.services import recalculate_farmer_trust_score

            recalculate_farmer_trust_score(instance.farmer)
