from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import LoanPredictionViewSet

router = DefaultRouter()
router.register(r"loans", LoanPredictionViewSet, basename="loan")

urlpatterns = [
    path("", include(router.urls)),
]
