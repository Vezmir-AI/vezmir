from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import User
from utils.mail import send_verification_email


class GetBalanceView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        user = request.user
        balance = user.balance
        return Response({"balance": balance})


class VerifyEmailView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        token = request.data.get("token")
        if not token:
            return Response(
                {"error": "Verification token is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.get(email_verification_token=token)
        except User.DoesNotExist:
            return Response(
                {"error": "Invalid verification token"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if user.email_verified:
            return Response(
                {"message": "Email already verified"}, status=status.HTTP_200_OK
            )

        # Check if the token has expired (e.g., after 3 days)
        if (
            user.email_verification_token_created_at
            < timezone.now() - timezone.timedelta(days=3)
        ):
            return Response(
                {"error": "Verification token has expired"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.email_verified = True
        user.save()

        return Response(
            {"message": "Email successfully verified"}, status=status.HTTP_200_OK
        )


class ResendEmailVerificationView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        send_verification_email(request.user)
        return Response(
            {"message": "Email verification sent"}, status=status.HTTP_200_OK
        )
