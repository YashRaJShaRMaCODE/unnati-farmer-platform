from django.contrib import admin
from django.urls import include, path
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("users.urls")),
    path("api/", include("farmers.urls")),
    path("api/", include("farmers.insights_urls")),
    path("api/", include("lands.urls")),
    path("api/", include("crops.urls")),
    path("api/", include("marketplace.urls")),
    path("api/", include("schemes.urls")),
    path("api/", include("complaints.urls")),
    path("api/", include("trustscore.urls")),
    path("api/", include("loans.urls")),
    path("api/", include("notifications.urls")),
    path("api/dashboard/", include("analytics.urls")),
    path("api/ai/", include("aiassistant.urls")),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/docs/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    path(
        "api/redoc/",
        SpectacularRedocView.as_view(url_name="schema"),
        name="redoc",
    ),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
