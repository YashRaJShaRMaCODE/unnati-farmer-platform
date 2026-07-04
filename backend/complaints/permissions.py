from rest_framework import permissions


class ComplaintPermission(permissions.BasePermission):
    """
    Farmer: create and view own complaints.
    Government/Admin: review and update all complaints.
    Bank: read-only.
    Buyer: no access.
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role == "buyer":
            return False
        if request.method == "POST":
            return request.user.role == "farmer"
        return request.user.role in ("farmer", "admin", "government", "bank")

    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.role in ("admin", "government") or user.is_superuser:
            return True
        if user.role == "bank":
            return request.method in permissions.SAFE_METHODS
        if user.role == "farmer":
            return (
                hasattr(user, "farmer_profile")
                and obj.farmer_id == user.farmer_profile.id
                and request.method in permissions.SAFE_METHODS
            )
        return False
