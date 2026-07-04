from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import ComplaintViewSet

router = DefaultRouter()
router.register(r"complaints", ComplaintViewSet, basename="complaint")

urlpatterns = [
    path("", include(router.urls)),
]
