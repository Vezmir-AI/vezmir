import time
from django.http import StreamingHttpResponse
from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from chat.models import ChatConversation, ChatMessage, AIModel, AIModelProvider
from chat.serializers import (
    ChatConversationSerializer,
    ChatMessageSerializer,
    AIModelSerializer,
    AIModelProviderSerializer,
    FormattedMessageSerializer,
)
from utils.permissions import IsOwner, HasPositiveBalance
from utils.chatbots import get_api_response, generate_title


# class to get all the models
# TODO: fetch per provider
class AIModelView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        serializer = AIModelSerializer(AIModel.objects.all(), many=True)
        return Response({"data": serializer.data})


# class to get all the model providers
class AIModelProviderView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        serializer = AIModelProviderSerializer(AIModelProvider.objects.all(), many=True)
        return Response({"data": serializer.data})


class UserConversationView(generics.ListCreateAPIView):
    serializer_class = ChatConversationSerializer
    permission_classes = (IsAuthenticated, IsOwner)

    # get all conversations for the user, last modified first
    def get(self, request):
        serializer = self.get_serializer(
            ChatConversation.objects.filter(
                user=self.request.user, is_active=True
            ).order_by("-date_updated"),
            many=True,
        )
        return Response({"data": serializer.data})

    # create a new conversation
    def post(self, request):
        data = request.data
        data["user"] = request.user.id
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=self.request.user)
        return Response(
            {"data": serializer.data},
            status=status.HTTP_201_CREATED,
        )


class ChatMessageView(APIView):
    permission_classes = (IsAuthenticated, IsOwner, HasPositiveBalance)

    # get all the messages in a conversation, in chronological order
    def get(self, request, conv_id):
        try:
            conversation = ChatConversation.objects.get(id=conv_id, user=request.user)
            if not conversation.is_active:
                return Response(
                    {"message": "conversation_not_found", "status": "error"},
                    status=status.HTTP_404_NOT_FOUND,
                )
        except ChatConversation.DoesNotExist:
            return Response(
                {"message": "conversation_not_found", "status": "error"},
                status=status.HTTP_404_NOT_FOUND,
            )

        messages = ChatMessage.objects.filter(chat_conversation=conversation).order_by(
            "date_created"
        )
        serializer = ChatMessageSerializer(messages, many=True)
        return Response({"data": serializer.data})

    # create a new message in a conversation
    def post(self, request, conv_id):
        # verify that the conversation exists
        try:
            conversation = ChatConversation.objects.get(
                id=conv_id, user=request.user.id
            )
        except ChatConversation.DoesNotExist:
            return Response(
                {"message": "conversation_not_found", "status": "error"},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Query model name and its provider
        model_name = request.data.get("model_name")
        if model_name == "vezmir":
            try:
                # uses the conversation last message, if any
                if conversation.messages.last():
                    model_name = conversation.messages.last().model_name
                # uses the user's last absolute message, if any
                # it is indeed first, not last (implementation detail ig)
                elif request.user.messages.first():
                    model_name = request.user.messages.first().model_name
                else:
                    model_name = "gpt-4o"
            except Exception:
                return Response(
                    {"message": "model_not_found", "status": "error"},
                    status=status.HTTP_404_NOT_FOUND,
                )
        try:
            model = AIModel.objects.select_related("provider").get(name=model_name)
            model_provider = model.provider.name
            conversation.ai_model = model
            conversation.save()
        except AIModel.DoesNotExist:
            return Response(
                {"message": "model_not_found", "status": "error"},
                status=status.HTTP_404_NOT_FOUND,
            )

        # creates the user message
        user_message_serializer = ChatMessageSerializer(
            data={
                "user": request.user.id,
                "chat_conversation": conv_id,
                "content": request.data.get("content"),
                "role": "user",
                "model_name": model.name,
            }
        )
        user_message_serializer.is_valid(raise_exception=True)
        user_message_serializer.save()
        # get the whole conversation to pass to the model
        # TODO: Use self.get? or a serializer?
        conv_messages = FormattedMessageSerializer(
            ChatMessage.objects.filter(chat_conversation=conversation).order_by(
                "date_created"
            ),
            many=True,
        ).data

        def stream_and_save():
            full_response = ""
            token_in = token_out = None
            for chunk in get_api_response(
                model_name=model_name,
                model_provider=model_provider,
                messages=conv_messages,
            ):
                # this allows to send the response to the client as it is being generated
                if content := chunk.content:
                    full_response += content
                    yield content
                if usage := chunk.usage_metadata:
                    if token_in := usage.get("input_tokens"):
                        user_message_serializer.num_tokens = token_in
                    if token_out := usage.get("output_tokens"):
                        pass
                if response := chunk.response_metadata:
                    # TODO implement response metadata, e.g. stop reason
                    pass

            # Save the complete response to the database
            ai_message_serializer = ChatMessageSerializer(
                data={
                    "user": request.user.id,
                    "chat_conversation": conv_id,
                    "content": full_response,
                    "role": "assistant",
                    "model_name": model.name,
                    "num_tokens": token_out,
                }
            )
            ai_message_serializer.is_valid(
                raise_exception=True
            )  # TODO: handle API problems, like stop generation (i.e. data.completed=False)
            ai_message_serializer.save()
            ChatMessage.objects.filter(id=user_message_serializer.data["id"]).update(
                num_tokens=token_in
            )

            # updates the user's balance
            user_message_cost = request.user.calculate_message_cost(
                token_in, model, is_input=True
            )
            ai_message_cost = request.user.calculate_message_cost(
                token_out, model, is_input=False
            )
            total_cost = user_message_cost + ai_message_cost
            request.user.update_balance(total_cost)

        response = StreamingHttpResponse(
            stream_and_save(), content_type="text/event-stream"
        )
        # do not remove this, it is used by nginx to stream the response
        # https://discovergen.ai/article/creating-a-streaming-chat-application-with-django/
        response["X-Accel-Buffering"] = "no"
        response["Cache-Control"] = "no-cache"
        return response

    def put(self, request, conv_id):
        try:
            conversation = ChatConversation.objects.get(id=conv_id, user=request.user)
        except ChatConversation.DoesNotExist:
            return Response(
                {"message": "conversation_not_found", "status": "error"},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = ChatConversationSerializer(
            conversation, data=request.data, partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response({"data": serializer.data})
        return Response(
            {"message": "invalid_data", "status": "error"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # delete a conversation
    def delete(self, request, conv_id):
        try:
            conversation = ChatConversation.objects.get(id=conv_id, user=request.user)
        except ChatConversation.DoesNotExist:
            return Response(
                {"message": "conversation_not_found", "status": "error"},
                status=status.HTTP_404_NOT_FOUND,
            )

        conversation.is_active = False
        conversation.save()
        return Response(
            {"message": "conversation_deleted", "status": "success"},
            status=status.HTTP_204_NO_CONTENT,
        )


class ChatConversationTitleView(APIView):
    permission_classes = (IsAuthenticated, IsOwner)

    def post(self, request, conv_id, _retry=True):
        try:
            conversation = ChatConversation.objects.get(id=conv_id, user=request.user)
        except ChatConversation.DoesNotExist:
            if _retry:
                time.sleep(1)
                return self.post(request, conv_id, _retry=False)
            return Response(
                {"message": "conversation_not_found", "status": "error"},
                status=status.HTTP_404_NOT_FOUND,
            )
        title = generate_title(request.data.get("user_message"))
        conversation.name = title
        conversation.save()
        return Response({"data": {"title": title}})
