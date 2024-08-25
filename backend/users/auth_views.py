from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenViewBase

from .serializers import UserSerializer, CustomTokenObtainPairSerializer
from utils.mail import send_verification_email


class UserRegistrationView(APIView):
    """
    Creates the user.
    """

    permission_classes = (AllowAny,)
    serializer_class = UserSerializer

    def post(self, request):

        if request.user.is_authenticated:
            return Response(
                {"status": "error", "message": "user_already_exists"}, status=status.HTTP_400_BAD_REQUEST
            )

        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            if user:
                send_verification_email(user)
                tokens = RefreshToken.for_user(user)
                return Response(
                    {
                        "data": {
                            "refresh": str(tokens),
                            "access": str(tokens.access_token),
                        },
                    },
                    status=status.HTTP_201_CREATED,
                )
        return Response({"data": serializer.errors, "status": "error", "message": "register_failed"}, status=status.HTTP_400_BAD_REQUEST)


class UserLogoutView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        refresh_token = request.data["refresh"]
        refresh_token = RefreshToken(refresh_token)
        refresh_token.blacklist()
        return Response(status=status.HTTP_205_RESET_CONTENT)

class CustomTokenObtainPairView(TokenViewBase):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        try:
            response = super().post(request, *args, **kwargs)
        except Exception as e:
            print(e)
            return Response({"status": "error", "message": "invalid_credentials"}, status=status.HTTP_400_BAD_REQUEST)
        custom_response = {
            "data": response.data,
        }
        return Response(custom_response, status=status.HTTP_200_OK)
    
class CustomTokenRefreshView(TokenViewBase):
    def post(self, request, *args, **kwargs):
        try:
            response = super().post(request, *args, **kwargs)
        except Exception as e:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        custom_response = {
            "data": response.data,
        }
        return Response(custom_response, status=status.HTTP_200_OK)