from rest_framework import permissions


class AnalyticsPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        dashboard = getattr(view, "dashboard_role", None)
        if dashboard == "admin":
            return request.user.role == "admin" or request.user.is_superuser
        if dashboard == "farmer":
            return request.user.role == "farmer"
        if dashboard == "government":
            return request.user.role in ("government", "admin") or request.user.is_superuser
        if dashboard == "bank":
            return request.user.role in ("bank", "admin") or request.user.is_superuser
        if dashboard == "buyer":
            return request.user.role == "buyer"
        if dashboard == "village":
            return request.user.role in (
                "government",
                "admin",
                "bank",
            ) or request.user.is_superuser
        return False
