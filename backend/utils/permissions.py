from rest_framework.permissions import BasePermission


class IsOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user


class HasPositiveBalance(BasePermission):
    message = {"status": "error", "message": "insufficient_balance"}

    def has_permission(self, request, view):
        if view.get_view_name() == "Chat Message" and request.method == "POST":
            return request.user.balance > 0
        return True
