import stripe
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

stripe.api_key = settings.STRIPE_SECRET_KEY

class CreateCheckoutSessionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            checkout_session = stripe.checkout.Session.create(
                ui_mode='embedded',
                mode=request.data.get('mode'),
                payment_method_types=['card'],
                return_url=f"{settings.FRONTEND_URL}/payment-success?session_id={{CHECKOUT_SESSION_ID}}",
            )
            return Response({'clientSecret': checkout_session.client_secret})
        except Exception as e:
            return Response({'error': str(e)}, status=400)

class StripeWebhookView(APIView):
    permission_classes = (IsAuthenticated)

    def post(self, request):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')

        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
        except ValueError:
            return Response({"error": "Invalid payload"}, status=status.HTTP_400_BAD_REQUEST)
        except stripe.error.SignatureVerificationError:
            return Response({"error": "Invalid signature"}, status=status.HTTP_400_BAD_REQUEST)

        if event['type'] == 'checkout.session.completed':
            session = event['data']['object']
            
            user = request.user
            user.stripe_setup_intent = session.setup_intent
            user.save()

        return Response({"received": True}, status=status.HTTP_200_OK)