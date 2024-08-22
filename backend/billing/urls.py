from django.urls import path
from . import views 

urlpatterns = [
    path("create-checkout-session/", views.CreateCheckoutSessionView.as_view(), name="create-checkout-session"),
    path("confirm-checkout-session/", views.ConfirmCheckoutSessionView.as_view(), name="confirm-checkout-session"),
    path("me/", views.GetStripeInfo.as_view(), name="my-stripe-info"),
]