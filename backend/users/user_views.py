from django.utils import timezone
from rest_framework import status
from rest_framework.generics import ListAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from chat.models import AIModel
from chat.serializers import ChatMessageSerializer
from utils.mail import send_verification_email

from .models import User
from .serializers import UserInfosSerializer


class UserInfosView(RetrieveUpdateDestroyAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = UserInfosSerializer

    def get(self, request):
        user = request.user
        serializer = self.serializer_class(user)
        return Response({"data": serializer.data})

    def put(self, request):
        user = request.user
        action = request.data.get("action")

        if action == "change_password":
            old_password = request.data.get("old_password")
            new_password = request.data.get("new_password")

            if not user.check_password(old_password):
                return Response(
                    {"status": "error", "message": "incorrect_current_password"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            user.set_password(new_password)
            user.save()
            return Response({"status": "success", "message": "password_changed_successfully"})

        elif action == "update_info":
            serializer = self.serializer_class(user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(
                    {
                        "data": serializer.data,
                        "status": "success",
                        "message": "user_info_updated",
                    }
                )
            return Response(
                {
                    "status": "error",
                    "message": "invalid_user_data",
                    "data": serializer.errors,  # helps the frontend to know what is wrong
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        else:
            return Response(
                {"status": "error", "message": "invalid_action"},
                status=status.HTTP_400_BAD_REQUEST,
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
                {"status": "error", "message": "token_required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.get(email_verification_token=token)
        except User.DoesNotExist:
            return Response(
                {"status": "error", "message": "invalid_verification_token"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if user.email_verified:
            return Response(
                {"status": "error", "message": "email_already_verified"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if user.email_verification_token_created_at < timezone.now() - timezone.timedelta(minutes=1):
            return Response(
                {"status": "error", "message": "token_expired"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.email_verified = True
        user.save()

        return Response(
            {"status": "success", "message": "email_verified_successfully"},
            status=status.HTTP_200_OK,
        )


class ResendEmailVerificationView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        user = request.user
        if user.email_verified:
            return Response(
                {
                    "data": {"message": "email_already_verified"},
                    "status": "error",
                    "message": "email_already_verified",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        send_verification_email(user)
        return Response(
            {"status": "success", "message": "verification_email_sent"},
            status=status.HTTP_200_OK,
        )


class UserUsageView(ListAPIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request: Request, type: str):
        user = request.user

        # TODO: money_spent is not computed correctly, need to take the past month and it is default value below,
        # so no params is passed but JB let the possiblity to make so getting usage for a specific period is possible
        # will fix/refactor it later
        params = request.query_params
        start_date, end_date = params.get("start_date"), params.get("end_date")
        if not end_date:
            end_date = timezone.now().date()
        else:
            end_date = timezone.datetime.strptime(end_date, "%Y-%m-%d").date()
        if not start_date:
            start_date = timezone.now().date() - timezone.timedelta(days=30)
        else:
            start_date = timezone.datetime.strptime(start_date, "%Y-%m-%d").date()

        ai_models = AIModel.objects.all()
        messages = ChatMessageSerializer(
            user.messages.filter(
                date_created__gte=timezone.make_aware(
                    timezone.datetime.combine(start_date, timezone.datetime.min.time())
                ),
                date_created__lte=timezone.make_aware(
                    timezone.datetime.combine(end_date, timezone.datetime.max.time())
                ),
            ),
            many=True,
        ).data

        date_range = [
            date.strftime("%Y-%m-%d")
            for date in (start_date + timezone.timedelta(days=n) for n in range((end_date - start_date).days + 1))
        ]
        response_data = [
            {
                "date": date,
                **{
                    model.provider.display_name.lower(): {
                        "tokens_in": 0,
                        "tokens_out": 0,
                        "price_in": 0,
                        "price_out": 0,
                    }
                    for model in ai_models
                },
            }
            for date in date_range
        ]

        # Create a dictionary to cache AI model information
        ai_model_cache = {
            model.name: {
                "provider_name": model.provider.display_name.lower(),
                "price_input": model.price_per_1K_token_input,
                "price_output": model.price_per_1K_token_output,
            }
            for model in ai_models
        }

        for message in messages:
            date = message["date_created"].split("T")[0]
            date_index = date_range.index(date)

            model_info = ai_model_cache[message["ai_model_details"]["name"]]
            model_name = model_info["provider_name"]
            is_user = message["role"] == "user"
            num_tokens = message["num_tokens"]

            token_key = "tokens_in" if is_user else "tokens_out"
            price_key = "price_in" if is_user else "price_out"
            price = model_info["price_input"] if is_user else model_info["price_output"]

            response_data[date_index][model_name][token_key] += num_tokens
            response_data[date_index][model_name][price_key] += (num_tokens / 1000) * price

        # computes and returns the total money spent for the user
        if type == "money_spent":
            money_spent = 0
            for date in response_data:
                for model_name in date:
                    if model_name == "date":
                        continue
                    money_spent += date[model_name]["price_in"] + date[model_name]["price_out"]

            return Response({"data": {"money_spent": money_spent}})

        # computes and returns the money spent for each model for each date
        elif type == "money_usage":
            # aggregates
            for date in response_data:
                total = 0
                for model_name in date:
                    if model_name == "date":
                        continue
                    date[model_name] = date[model_name]["price_in"] + date[model_name]["price_out"]
                    total += date[model_name]
                date["total"] = total
            return Response({"data": {"money_usage": response_data}})

        # computes and returns the token usage for each model for each date
        elif type == "token_usage":
            for date in response_data:
                total = 0
                for model_name in date:
                    if model_name == "date":
                        continue
                    date[model_name] = date[model_name]["tokens_in"] + date[model_name]["tokens_out"]
                    total += date[model_name]
                date["total"] = total
            return Response({"data": {"token_usage": response_data}})
        else:
            return Response(
                {"status": "error", "message": "invalid_type"},
                status=status.HTTP_400_BAD_REQUEST,
            )
