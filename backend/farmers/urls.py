from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import BuyerViewSet, FarmerViewSet

router = DefaultRouter()
router.register(r"farmers", FarmerViewSet, basename="farmer")
router.register(r"buyers", BuyerViewSet, basename="buyer")

urlpatterns = [
    path("", include(router.urls)),
]
