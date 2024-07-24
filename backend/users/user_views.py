from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import User


class GetBalanceView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        user = request.user
        balance = user.balance
        return Response({"balance": balance})
