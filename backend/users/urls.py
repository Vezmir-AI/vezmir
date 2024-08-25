from django.urls import path

from . import auth_views, user_views

urlpatterns = [
    path("auth/register/", auth_views.UserRegistrationView.as_view(), name="register"),
    path("auth/login/", auth_views.CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/login/refresh/", auth_views.CustomTokenRefreshView.as_view(), name="token_refresh"),
    path("auth/logout/", auth_views.UserLogoutView.as_view(), name="logout"),
    path("user/verify-email/", user_views.VerifyEmailView.as_view(), name="verify_email"),
    path("user/resend-verification-email/", user_views.ResendEmailVerificationView.as_view(), name="resend_verification_email"),
    path("user/me/", user_views.UserInfosView.as_view(), name="get_user_infos"),
    path("user/usage/<str:type>/", user_views.UserUsageView.as_view(), name="get_user_usage"),
]
