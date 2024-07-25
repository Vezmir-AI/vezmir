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
from utils.permissions import IsOwner
from utils.chatbots import get_api_response


# class to get all the models
# TODO: fetch per provider
class AIModelView(generics.ListAPIView):
    queryset = AIModel.objects.all()
    serializer_class = AIModelSerializer


# class to get all the model providers
class AIModelProviderView(generics.ListAPIView):
    queryset = AIModelProvider.objects.all()
    serializer_class = AIModelProviderSerializer


class UserConversationView(generics.ListCreateAPIView):
    queryset = ChatConversation.objects.all()
    serializer_class = ChatConversationSerializer
    permission_classes = (IsAuthenticated, IsOwner)

    # get all conversations for the user, last modified first
    def get_queryset(self):
        return ChatConversation.objects.filter(user=self.request.user).order_by(
            "-date_updated"
        )

    # create a new conversation
    def create(self, request):
        data = request.data
        data["user"] = request.user.id
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=self.request.user)
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )


class ChatMessageView(APIView):
    permission_classes = (IsAuthenticated, IsOwner)

    # get all the messages in a conversation, in chronological order
    def get(self, request, conv_id):
        try:
            conversation = ChatConversation.objects.get(id=conv_id, user=request.user)
        except ChatConversation.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        messages = ChatMessage.objects.filter(chat_conversation=conversation).order_by(
            "date_created"
        )
        serializer = ChatMessageSerializer(messages, many=True)
        return Response(serializer.data)

    # create a new message in a conversation
    def post(self, request, conv_id):
        # verify that the conversation exists
        try:
            conversation = ChatConversation.objects.get(
                id=conv_id, user=request.user.id
            )
        except ChatConversation.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        # creates the user message
        serializer = ChatMessageSerializer(
            data={
                "user": request.user.id,
                "chat_conversation": conv_id,
                "content": request.data.get("content"),
                "role": "user",
            }
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        # query model name and its provider
        model_name = request.data.get("model_name")
        model = AIModel.objects.get(name=model_name)
        model_provider = model.provider.name

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
            for chunk in get_api_response(
                model_name=model_name,
                model_provider=model_provider,
                messages=conv_messages,
            ):
                full_response += chunk
                # this allows to send the response to the client as it is being generated
                yield chunk

            # Save the complete response to the database
            ai_message_serializer = ChatMessageSerializer(
                data={
                    "user": request.user.id,
                    "chat_conversation": conv_id,
                    "content": full_response,
                    "role": "assistant",
                    "model": model.name,
                }
            )
            ai_message_serializer.is_valid(
                raise_exception=True
            )  # TODO: handle API problems, like stop generation (e.g. data.completed=False)
            ai_message_serializer.save()

        response = StreamingHttpResponse(stream_and_save(), content_type="text/event-stream")
        # do not remove this, it is used by nginx to stream the response
        # https://discovergen.ai/article/creating-a-streaming-chat-application-with-django/
        response["X-Accel-Buffering"] = "no"
        response["Cache-Control"] = "no-cache"
        return response

    # delete a conversation
    def delete(self, request, conv_id):
        try:
            conversation = ChatConversation.objects.get(id=conv_id, user=request.user)
        except ChatConversation.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        conversation.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
