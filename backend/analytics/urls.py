from django.urls import path

from .views import (
    AdminDashboardView,
    BankDashboardView,
    BuyerDashboardView,
    FarmerDashboardView,
    GovernmentDashboardView,
    VillageAnalyticsView,
)

urlpatterns = [
    path("admin/", AdminDashboardView.as_view(), name="admin-dashboard"),
    path("farmer/", FarmerDashboardView.as_view(), name="farmer-dashboard"),
    path("buyer/", BuyerDashboardView.as_view(), name="buyer-dashboard"),
    path("government/", GovernmentDashboardView.as_view(), name="government-dashboard"),
    path("bank/", BankDashboardView.as_view(), name="bank-dashboard"),
    path("village/", VillageAnalyticsView.as_view(), name="village-dashboard"),
]
