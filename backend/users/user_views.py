from django.utils import timezone
from rest_framework import status, generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import User
from .serializers import UserInfosSerializer
from utils.mail import send_verification_email


class UserInfosView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = UserInfosSerializer

    def get(self, request):
        user = request.user
        serializer = self.serializer_class(user)
        return Response(serializer.data)

    def put(self, request):
        user = request.user
        action = request.data.get("action")

        if action == "change_password":
            old_password = request.data.get("old_password")
            new_password = request.data.get("new_password")

            if not user.check_password(old_password):
                return Response(
                    {"error": "Current password is incorrect"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            user.set_password(new_password)
            user.save()
            return Response(
                {"message": "Password changed successfully"}, status=status.HTTP_200_OK
            )

        elif action == "update_info":
            print(request.data)
            serializer = self.serializer_class(user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                print(serializer.data)
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        else:
            return Response(
                {"error": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST
            )

    def delete(self, request):
        user = request.user
        user.is_active = False
        user.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


class VerifyEmailView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        token = request.data.get("token")
        if not token:
            return Response(
                {"message": "token_is_required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.get(email_verification_token=token)
        except User.DoesNotExist:
            return Response(
                {"message": "invalid_verification_token"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if user.email_verified:
            return Response(
                {"message": "email_already_verified"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check if the token has expired (e.g., after 3 days)
        if (
            user.email_verification_token_created_at
            < timezone.now() - timezone.timedelta(minutes=1)
        ):
            return Response(
                {"message": "token_has_expired"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.email_verified = True
        user.save()

        return Response(
            {"message": "email_verified_successfully"}, status=status.HTTP_200_OK
        )


class ResendEmailVerificationView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        user = request.user
        if user.email_verified:
            return Response(
                {"message": "Email already verified"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        send_verification_email(user)
        return Response(
            {"message": "Email verification sent"}, status=status.HTTP_200_OK
        )
