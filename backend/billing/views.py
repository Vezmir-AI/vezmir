import stripe
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

stripe.api_key = settings.STRIPE_SECRET_KEY

class CreateCheckoutSessionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            checkout_session = stripe.checkout.Session.create(
                ui_mode='embedded',
                mode='setup',
                payment_method_types=['card'],
                customer=request.user.stripe_customer_id,  # Assuming you have this field in your User model
                return_url=f"{settings.FRONTEND_URL}/payment-success?session_id={{CHECKOUT_SESSION_ID}}",
            )
            return Response({'clientSecret': checkout_session.client_secret})
        except Exception as e:
            return Response({'error': str(e)}, status=400)