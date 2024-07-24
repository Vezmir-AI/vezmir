from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from . import auth_views, user_views

urlpatterns = [
    path("auth/register/", auth_views.UserRegistrationView.as_view(), name="register"),
    path("auth/login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/login/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/logout/", auth_views.UserLogoutView.as_view(), name="logout"),
    path("user/balance/", user_views.GetBalanceView.as_view(), name="balance"),
]
