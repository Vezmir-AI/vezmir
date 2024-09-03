from django.utils import timezone

from users.models import UserConnection


class UserConnectionMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        if request.user.is_authenticated:
            UserConnection.objects.get_or_create(user=request.user, connection_date=timezone.now().date())

        return response
