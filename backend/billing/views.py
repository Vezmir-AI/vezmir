from django.conf import settings
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
import stripe

stripe.api_key = settings.STRIPE_SECRET_KEY


class CreateCheckoutSessionView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        user = request.user
        try:
            if user.stripe_customer_id:
                customer = stripe.Customer.retrieve(user.stripe_customer_id)
            else:
                customer = stripe.Customer.create(email=user.email)
            checkout_session = stripe.checkout.Session.create(
                ui_mode="embedded",
                mode="setup",
                payment_method_types=["card"],
                return_url=f"{settings.FRONTEND_URL}/setup-payment-success?session_id={{CHECKOUT_SESSION_ID}}",
                customer=customer.id,
            )
            user.stripe_customer_id = customer.id
            user.save()
            return Response({"data": {"clientSecret": checkout_session.client_secret}})
        except stripe.error.StripeError as e:
            print(e)
            return Response({"message": "stripe_error", "status": "error"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(e)
            return Response({"message": "server_error", "status": "error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ConfirmCheckoutSessionView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request: Request):
        session_id = request.data.get("session_id")
        session = stripe.checkout.Session.retrieve(
            session_id, expand=["setup_intent.payment_method"]
        )
        if session.setup_intent.status == "succeeded":
            user = request.user
            user.stripe_payment_method_id = session.setup_intent.payment_method.id
            user.save()
            return Response(
                {"message": "payment_method_confirmed", "status": "success"}
            )
        else:
            return Response({"message": "setup_intent_not_successful", "status": "error"}, status=status.HTTP_400_BAD_REQUEST)


class GetStripeInfo(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        user = request.user

        try:
            payment_methods = stripe.PaymentMethod.list(
                customer=user.stripe_customer_id, type="card"
            )
            print(payment_methods)
            formatted_methods = [
                {
                    "type": pm.type,
                    "last4": pm.card.last4,
                    "brand": pm.card.brand,
                    "exp_month": pm.card.exp_month,
                    "exp_year": pm.card.exp_year,
                    "id": pm.id,
                    "selected": pm.id == user.stripe_payment_method_id,
                }
                for pm in payment_methods.data
            ]

            # Prepare the response data
            response_data = {
                "payment_methods": formatted_methods,
            }

            return Response({"data": response_data})

        except stripe.error.StripeError as e:
            print(e)
            return Response({"message": "stripe_error", "status": "error"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(e)
            return Response(
                {"message": "server_error", "status": "error"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def post(self, request):
        user = request.user
        payment_method_id = request.data.get("payment_method_id")
        try:
            user.stripe_payment_method_id = payment_method_id
            user.save()
            return Response({"message": "payment_method_updated", "status": "success"})
        except Exception as e:
            print(e)
            return Response(
                {"message": "server_error", "status": "error"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
