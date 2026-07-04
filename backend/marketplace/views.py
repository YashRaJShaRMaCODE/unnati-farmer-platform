from django.db.models import Q
from django.db import transaction as db_transaction
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.filters import OrderingFilter, SearchFilter

from marketplace.models import Listing, Transaction

from .filters import ListingFilter, TransactionFilter
from .permissions import ListingPermission, TransactionPermission
from .serializers import ListingSerializer, TransactionSerializer


class ListingViewSet(viewsets.ModelViewSet):
    queryset = Listing.objects.select_related(
        "farmer__user", "crop"
    ).all()
    serializer_class = ListingSerializer
    permission_classes = [ListingPermission]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = ListingFilter
    search_fields = ["crop__crop_name", "description", "farmer__user__email"]
    ordering_fields = ["price_per_unit", "quantity", "created_at"]
    ordering = ["-created_at"]

    def get_queryset(self):
        user = self.request.user
        if user.role == "farmer" and hasattr(user, "farmer_profile"):
            if self.action in ("list", "retrieve"):
                return self.queryset.filter(
                    Q(farmer=user.farmer_profile) | Q(status="active")
                )
            return self.queryset.filter(farmer=user.farmer_profile)
        return self.queryset

    def perform_create(self, serializer):
        serializer.save(farmer=self.request.user.farmer_profile)


class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.select_related(
        "listing__crop",
        "listing__farmer__user",
        "buyer__user",
    ).all()
    serializer_class = TransactionSerializer
    permission_classes = [TransactionPermission]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = TransactionFilter
    search_fields = [
        "listing__crop__crop_name",
        "buyer__user__email",
        "listing__farmer__user__email",
    ]
    ordering_fields = ["transaction_date", "total_amount", "status"]
    ordering = ["-transaction_date"]

    def get_queryset(self):
        user = self.request.user
        if user.role == "buyer" and hasattr(user, "buyer_profile"):
            return self.queryset.filter(buyer=user.buyer_profile)
        if user.role == "farmer" and hasattr(user, "farmer_profile"):
            return self.queryset.filter(listing__farmer=user.farmer_profile)
        if user.role in ("admin", "bank", "government"):
            return self.queryset
        return Transaction.objects.none()

    @db_transaction.atomic
    def perform_create(self, serializer):
        txn = serializer.save(buyer=self.request.user.buyer_profile)
        listing = txn.listing
        listing.quantity -= txn.quantity
        if listing.quantity <= 0:
            listing.quantity = 0
            listing.status = "sold"
        listing.save()

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        new_status = request.data.get("status")
        if new_status == "completed" and instance.status != "completed":
            from trustscore.services import recalculate_farmer_trust_score

            recalculate_farmer_trust_score(instance.listing.farmer)
        return super().partial_update(request, *args, **kwargs)
