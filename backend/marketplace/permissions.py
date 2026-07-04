from rest_framework import permissions


class ListingPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method == "POST":
            return request.user.role == "farmer"
        return True

    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.role in ("admin",) or user.is_superuser:
            return True
        if request.method in permissions.SAFE_METHODS:
            return True
        if user.role == "farmer":
            return (
                hasattr(user, "farmer_profile")
                and obj.farmer_id == user.farmer_profile.id
            )
        return False


class TransactionPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return user_role_allowed(request.user.role, request.method)

    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.role == "admin" or user.is_superuser:
            return True
        if user.role == "buyer":
            return (
                hasattr(user, "buyer_profile")
                and obj.buyer_id == user.buyer_profile.id
            )
        if user.role == "farmer":
            return (
                hasattr(user, "farmer_profile")
                and obj.listing.farmer_id == user.farmer_profile.id
            )
        if user.role in ("bank", "government"):
            return request.method in permissions.SAFE_METHODS
        return False


def user_role_allowed(role, method):
    if role in ("admin", "buyer", "farmer"):
        return True
    if role in ("bank", "government"):
        return method in permissions.SAFE_METHODS
    return False
