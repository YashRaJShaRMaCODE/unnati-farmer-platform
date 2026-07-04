from rest_framework import permissions

from users.permissions import IsAdmin, IsBank, IsBuyer, IsFarmer, IsGovernment


class FarmerPermission(permissions.BasePermission):
    """
    Farmer: manage own profile.
    Admin/Bank/Government: read-only access.
    Buyer: read-only access.
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method == "POST":
            return request.user.role == "farmer"
        return request.user.role in (
            "farmer",
            "admin",
            "bank",
            "government",
            "buyer",
        )

    def has_object_permission(self, request, view, obj):
        if request.user.role == "admin" or request.user.is_superuser:
            return True
        if request.method in permissions.SAFE_METHODS:
            return True
        if request.user.role == "farmer":
            return hasattr(request.user, "farmer_profile") and obj == request.user.farmer_profile
        return False


class BuyerPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role in ("buyer", "admin")

    def has_object_permission(self, request, view, obj):
        if request.user.role == "admin" or request.user.is_superuser:
            return True
        if request.method in permissions.SAFE_METHODS:
            if request.user.role == "buyer":
                return (
                    hasattr(request.user, "buyer_profile")
                    and obj == request.user.buyer_profile
                )
            return request.user.role in ("admin", "bank", "government", "farmer")
        return (
            request.user.role == "buyer"
            and hasattr(request.user, "buyer_profile")
            and obj == request.user.buyer_profile
        )
