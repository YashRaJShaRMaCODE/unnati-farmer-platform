from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import LandRecordViewSet

router = DefaultRouter()
router.register(r"lands", LandRecordViewSet, basename="land")

urlpatterns = [
    path("", include(router.urls)),
]
