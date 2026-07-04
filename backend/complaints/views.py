from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.filters import OrderingFilter, SearchFilter

from complaints.models import Complaint

from .filters import ComplaintFilter
from .permissions import ComplaintPermission
from .serializers import ComplaintReviewSerializer, ComplaintSerializer


class ComplaintViewSet(viewsets.ModelViewSet):
    queryset = Complaint.objects.select_related("farmer__user").all()
    serializer_class = ComplaintSerializer
    permission_classes = [ComplaintPermission]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = ComplaintFilter
    search_fields = ["title", "description", "farmer__user__email"]
    ordering_fields = ["created_at", "status"]
    ordering = ["-created_at"]

    def get_serializer_class(self):
        user = self.request.user
        if self.action in ("update", "partial_update") and user.role in (
            "admin",
            "government",
        ):
            return ComplaintReviewSerializer
        return ComplaintSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == "farmer" and hasattr(user, "farmer_profile"):
            return self.queryset.filter(farmer=user.farmer_profile)
        if user.role in ("admin", "government", "bank"):
            return self.queryset
        return Complaint.objects.none()

    def perform_create(self, serializer):
        serializer.save(farmer=self.request.user.farmer_profile)

    def perform_update(self, serializer):
        user = self.request.user
        if user.role in ("admin", "government") or user.is_superuser:
            instance = serializer.save()
            from trustscore.services import recalculate_farmer_trust_score

            recalculate_farmer_trust_score(instance.farmer)
        else:
            serializer.save()

    def update(self, request, *args, **kwargs):
        user = request.user
        if user.role not in ("admin", "government") and not user.is_superuser:
            return super().retrieve(request, *args, **kwargs)
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        user = request.user
        if user.role not in ("admin", "government") and not user.is_superuser:
            return super().retrieve(request, *args, **kwargs)
        return super().partial_update(request, *args, **kwargs)
