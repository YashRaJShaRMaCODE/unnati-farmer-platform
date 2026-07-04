from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import ListingViewSet, TransactionViewSet

router = DefaultRouter()
router.register(r"listings", ListingViewSet, basename="listing")
router.register(r"transactions", TransactionViewSet, basename="transaction")

urlpatterns = [
    path("", include(router.urls)),
]
