from rest_framework import permissions


class SchemePermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.role in ("admin", "government")


class SchemeApplicationPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role in (
            "farmer",
            "admin",
            "government",
            "bank",
        )

    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.role in ("admin", "government") or user.is_superuser:
            return True
        if user.role == "bank":
            return request.method in permissions.SAFE_METHODS
        if user.role == "farmer":
            if request.method in permissions.SAFE_METHODS:
                return (
                    hasattr(user, "farmer_profile")
                    and obj.farmer_id == user.farmer_profile.id
                )
            return (
                hasattr(user, "farmer_profile")
                and obj.farmer_id == user.farmer_profile.id
                and obj.status == "submitted"
            )
        return False
