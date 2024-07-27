from django.contrib.auth import authenticate
from rest_framework import generics, permissions, status
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken

from .serializers import UserSerializer


class UserRegistrationView(APIView):
    """
    Creates the user.
    """

    permission_classes = [permissions.AllowAny]
    serializer_class = UserSerializer

    def post(self, request):

        if request.user.is_authenticated:
            return Response(
                {"error": "Useralready exists"}, status=status.HTTP_400_BAD_REQUEST
            )

        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            if user:
                tokens = RefreshToken.for_user(user)
                return Response(
                    {
                        "refresh": str(tokens),
                        "access": str(tokens.access_token),
                    },
                    status=status.HTTP_201_CREATED,
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserLogoutView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        refresh_token = request.data["refresh"]
        refresh_token = RefreshToken(refresh_token)
        refresh_token.blacklist()
        return Response(status=status.HTTP_205_RESET_CONTENT)
