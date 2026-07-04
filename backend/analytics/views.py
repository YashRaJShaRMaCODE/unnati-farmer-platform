from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from analytics.services import (
    get_admin_dashboard,
    get_bank_dashboard,
    get_buyer_dashboard,
    get_farmer_dashboard,
    get_government_dashboard,
    get_village_analytics,
)
from .permissions import AnalyticsPermission


class AdminDashboardView(APIView):
    permission_classes = [AnalyticsPermission]
    dashboard_role = "admin"

    def get(self, request):
        return Response(get_admin_dashboard())


class FarmerDashboardView(APIView):
    permission_classes = [AnalyticsPermission]
    dashboard_role = "farmer"

    def get(self, request):
        if not hasattr(request.user, "farmer_profile"):
            return Response(
                {"detail": "Farmer profile not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(get_farmer_dashboard(request.user.farmer_profile))


class GovernmentDashboardView(APIView):
    permission_classes = [AnalyticsPermission]
    dashboard_role = "government"

    def get(self, request):
        return Response(get_government_dashboard())


class BankDashboardView(APIView):
    permission_classes = [AnalyticsPermission]
    dashboard_role = "bank"

    def get(self, request):
        return Response(get_bank_dashboard())


class BuyerDashboardView(APIView):
    permission_classes = [AnalyticsPermission]
    dashboard_role = "buyer"

    def get(self, request):
        if not hasattr(request.user, "buyer_profile"):
            return Response(
                {"detail": "Buyer profile not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(get_buyer_dashboard(request.user.buyer_profile))


class VillageAnalyticsView(APIView):
    permission_classes = [AnalyticsPermission]
    dashboard_role = "village"

    def get(self, request):
        village = request.query_params.get("village")
        return Response(get_village_analytics(village))
