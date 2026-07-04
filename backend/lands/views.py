from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.filters import OrderingFilter, SearchFilter

from lands.models import LandRecord

from .filters import LandRecordFilter
from .permissions import LandRecordPermission
from .serializers import LandRecordSerializer


class LandRecordViewSet(viewsets.ModelViewSet):
    queryset = LandRecord.objects.select_related("farmer__user").all()
    serializer_class = LandRecordSerializer
    permission_classes = [LandRecordPermission]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = LandRecordFilter
    search_fields = ["survey_number", "location", "farmer__user__email"]
    ordering_fields = ["total_area", "created_at", "is_verified"]
    ordering = ["-created_at"]

    def get_queryset(self):
        user = self.request.user
        if user.role == "farmer" and hasattr(user, "farmer_profile"):
            return self.queryset.filter(farmer=user.farmer_profile)
        if user.role in ("admin", "government", "bank"):
            return self.queryset
        return LandRecord.objects.none()

    def perform_create(self, serializer):
        serializer.save(farmer=self.request.user.farmer_profile)
