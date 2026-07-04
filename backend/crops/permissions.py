from rest_framework import permissions


class CropRecordPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role == "buyer":
            return request.method in permissions.SAFE_METHODS
        return request.user.role in (
            "farmer",
            "admin",
            "government",
            "bank",
            "buyer",
        )

    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.role in ("admin", "government") or user.is_superuser:
            return True
        if user.role in ("bank", "buyer"):
            return request.method in permissions.SAFE_METHODS
        if user.role == "farmer":
            return (
                hasattr(user, "farmer_profile")
                and obj.farmer_id == user.farmer_profile.id
            )
        return False
