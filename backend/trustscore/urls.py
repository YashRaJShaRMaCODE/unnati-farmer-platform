from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import TrustScoreViewSet

router = DefaultRouter()
router.register(r"trust-scores", TrustScoreViewSet, basename="trust-score")

urlpatterns = [
    path("", include(router.urls)),
]
