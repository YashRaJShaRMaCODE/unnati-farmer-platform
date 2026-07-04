from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.filters import OrderingFilter, SearchFilter

from farmers.models import Buyer, Farmer

from .filters import FarmerFilter
from .permissions import BuyerPermission, FarmerPermission
from .serializers import BuyerSerializer, FarmerCreateSerializer, FarmerSerializer


class FarmerViewSet(viewsets.ModelViewSet):
    queryset = Farmer.objects.select_related("user").all()
    permission_classes = [FarmerPermission]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = FarmerFilter
    search_fields = ["user__email", "user__first_name", "aadhaar_number", "address"]
    ordering_fields = ["created_at", "experience_years", "verification_status"]
    ordering = ["-created_at"]

    def get_serializer_class(self):
        if self.action == "create":
            return FarmerCreateSerializer
        return FarmerSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == "farmer" and hasattr(user, "farmer_profile"):
            return self.queryset.filter(pk=user.farmer_profile.pk)
        if user.role in ("buyer", "bank", "government"):
            return self.queryset
        if user.role == "admin" or user.is_superuser:
            return self.queryset
        return Farmer.objects.none()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class BuyerViewSet(viewsets.ModelViewSet):
    queryset = Buyer.objects.select_related("user").all()
    serializer_class = BuyerSerializer
    permission_classes = [BuyerPermission]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["user__email", "company_name"]
    ordering_fields = ["created_at"]
    ordering = ["-created_at"]

    def get_queryset(self):
        user = self.request.user
        if user.role == "buyer" and hasattr(user, "buyer_profile"):
            return self.queryset.filter(pk=user.buyer_profile.pk)
        if user.role == "admin" or user.is_superuser:
            return self.queryset
        return Buyer.objects.none()
