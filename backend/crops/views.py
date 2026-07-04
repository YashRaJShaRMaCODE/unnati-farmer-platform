from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.filters import OrderingFilter, SearchFilter

from crops.models import CropRecord

from .filters import CropRecordFilter
from .permissions import CropRecordPermission
from .serializers import CropRecordSerializer


class CropRecordViewSet(viewsets.ModelViewSet):
    queryset = CropRecord.objects.select_related("farmer__user").all()
    serializer_class = CropRecordSerializer
    permission_classes = [CropRecordPermission]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = CropRecordFilter
    search_fields = ["crop_name", "farmer__user__email"]
    ordering_fields = ["harvest_date", "yield_amount", "created_at"]
    ordering = ["-created_at"]

    def get_queryset(self):
        user = self.request.user
        if user.role == "farmer" and hasattr(user, "farmer_profile"):
            return self.queryset.filter(farmer=user.farmer_profile)
        if user.role in ("admin", "government", "bank", "buyer"):
            return self.queryset
        return CropRecord.objects.none()

    def perform_create(self, serializer):
        serializer.save(farmer=self.request.user.farmer_profile)
