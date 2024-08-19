from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from . import auth_views, user_views
from .serializers import CustomTokenObtainPairSerializer

urlpatterns = [
    path("auth/register/", auth_views.UserRegistrationView.as_view(), name="register"),
    path("auth/login/", TokenObtainPairView(serializer_class=CustomTokenObtainPairSerializer).as_view(), name="token_obtain_pair"),
    path("auth/login/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/logout/", auth_views.UserLogoutView.as_view(), name="logout"),
    path("user/verify-email/", user_views.VerifyEmailView.as_view(), name="verify_email"),
    path("user/resend-verification-email/", user_views.ResendEmailVerificationView.as_view(), name="resend_verification_email"),
    path("user/me/", user_views.UserInfosView.as_view(), name="get_user_infos"),
    path("user/usage/<str:type>/", user_views.UserUsageView.as_view(), name="get_user_usage"),
]
