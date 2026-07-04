from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import GovernmentSchemeViewSet, SchemeApplicationViewSet

router = DefaultRouter()
router.register(r"schemes", GovernmentSchemeViewSet, basename="scheme")
router.register(r"applications", SchemeApplicationViewSet, basename="scheme-application")

urlpatterns = [
    path("", include(router.urls)),
]
