from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import CropRecordViewSet

router = DefaultRouter()
router.register(r"crops", CropRecordViewSet, basename="crop")

urlpatterns = [
    path("", include(router.urls)),
]
