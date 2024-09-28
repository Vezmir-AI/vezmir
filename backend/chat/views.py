import os

import requests
from django.core.files.storage import default_storage
from django.db.models import F, Q
from django.http import FileResponse, StreamingHttpResponse
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from chat.models import AIModel, AIModelProvider, ChatConversation, ChatMessage
from chat.serializers import (
    AIModelProviderSerializer,
    AIModelSerializer,
    ChatConversationSerializer,
    ChatMessageSerializer,
    FormattedMessageSerializer,
)
from utils.chatbots import choose_model, generate_title, get_api_response
from utils.diffusions import generate_image  # Import the utility function
from utils.json import serialize_to_json
from utils.mail import send_feedback_email
from utils.permissions import HasPositiveBalance, IsOwner


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


class ImageGenerationView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, conv_id):
        model_name = request.data.get("model_name")
        prompt = request.data.get("content")

        try:
            model = AIModel.objects.select_related("provider").get(name=model_name)
            model_data = AIModelSerializer(model).data
            if model.model_type != "image":
                return Response(
                    {"message": "invalid_model_type", "status": "error"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            image_url, title = generate_image(model.provider.name, prompt)

            # Download the image
            response = requests.get(image_url)
            if response.status_code == 200:
                # Create the directory structure
                upload_dir = os.path.join("chat_uploads", str(conv_id))
                os.makedirs(upload_dir, exist_ok=True)

                # Extract the filename and save the image as PNG
                filename = f"{title}.png"
                file_path = os.path.join(upload_dir, filename)
                with open(file_path, "wb") as f:
                    f.write(response.content)

                user_message_serializer = ChatMessageSerializer(
                    data={
                        "user": request.user.id,
                        "chat_conversation": conv_id,
                        "content": "",
                        "role": "user",
                        "ai_model": model.id,
                        "files": [{"name": filename, "url": file_path, "path": file_path, "type": "image"}],
                        "parent": request.data.get("parent"),
                        "type": "image",
                    }
                )

                if user_message_serializer.is_valid():
                    user_message_serializer.save()
                    return Response(
                        {"data": {"model": model_data, "user_message": user_message_serializer.data}},
                        status=status.HTTP_201_CREATED,
                    )
            else:
                return Response(
                    {"message": "failed_to_download_image", "status": "error"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )
        except AIModel.DoesNotExist:
            return Response(
                {"message": "model_not_found", "status": "error"},
                status=status.HTTP_404_NOT_FOUND,
            )
        except ChatConversation.DoesNotExist:
            return Response(
                {"message": "conversation_not_found", "status": "error"},
                status=status.HTTP_404_NOT_FOUND,
            )


class UserConversationView(generics.ListCreateAPIView):
    serializer_class = ChatConversationSerializer
    permission_classes = (IsAuthenticated, IsOwner)

    # get all conversations for the user, last modified first
    def get(self, request):
        serializer = self.get_serializer(
            ChatConversation.objects.filter(user=self.request.user, is_active=True).order_by("-date_updated"),
            many=True,
        )
        return Response({"data": serializer.data})

    # create a new conversation
    def post(self, request):
        data = request.data
        data["user"] = request.user.id
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        conversation = serializer.save(user=self.request.user)

        # Create an initial "ghost" message
        ghost_message = ChatMessage.objects.create(
            chat_conversation=conversation, role=None, content=None, user=request.user
        )

        return_response = serializer.data
        return_response["initial_message"] = ghost_message.id
        return Response(
            {"data": return_response},
            status=status.HTTP_201_CREATED,
        )


class ChatMessageView(APIView):
    permission_classes = (IsAuthenticated, IsOwner)

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

        messages = ChatMessage.objects.filter(chat_conversation=conversation).order_by("date_created")
        serializer = ChatMessageSerializer(messages, many=True)
        return Response({"data": serializer.data})

    # create a new message in a conversation
    def post(self, request, conv_id):
        # verify that the conversation exists
        try:
            conversation = ChatConversation.objects.get(id=conv_id, user=request.user)
        except ChatConversation.DoesNotExist:
            return Response(
                {"message": "conversation_not_found", "status": "error"},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Query model name and its provider
        message = request.data.get("content")
        model_name = request.data.get("model_name", None)
        is_vezmir_intelligence = request.data.get("is_vezmir_intelligence", "false").lower() == "true"
        if is_vezmir_intelligence:
            model_name = choose_model(message)

        try:
            model = AIModel.objects.select_related("provider").get(name=model_name)
            model_data = AIModelSerializer(model).data
            conversation.ai_model = model
            conversation.save()
        except AIModel.DoesNotExist as e:
            print(f"ERROR: {e}, {model_name=}")
            return Response(
                {"message": "model_not_found", "status": "error"},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Handle file uploads
        uploaded_files = request.FILES.getlist("files")
        file_info = []

        if uploaded_files:
            # Create the directory structure
            upload_dir = os.path.join("chat_uploads", str(conv_id))
            os.makedirs(upload_dir, exist_ok=True)

            for file in uploaded_files:
                file_name = default_storage.get_valid_name(file.name)
                file_path = os.path.join(upload_dir, file_name)

                with default_storage.open(file_path, "wb+") as destination:
                    for chunk in file.chunks():
                        destination.write(chunk)

                file_url = request.build_absolute_uri(f"/api/chat/file/{conv_id}/{file_name}")
                file_info.append({"name": file_name, "url": file_url, "path": file_path, "type": file.content_type})

        # Create and save the user message with file information
        user_message_serializer = ChatMessageSerializer(
            data={
                "user": request.user.id,
                "chat_conversation": conv_id,
                "content": message,
                "role": "user",
                "ai_model": model.id,
                "files": file_info,
                "parent": request.data.get("parent"),
                "type": "text",
            }
        )
        if user_message_serializer.is_valid():
            user_message_serializer.save()
            return Response(
                {"data": {"model": model_data, "user_message": user_message_serializer.data}},
                status=status.HTTP_201_CREATED,
            )

        return Response(
            {"message": "invalid_data", "status": "error"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    def put(self, request, conv_id):
        try:
            conversation = ChatConversation.objects.get(id=conv_id, user=request.user)
        except ChatConversation.DoesNotExist:
            return Response(
                {"message": "conversation_not_found", "status": "error"},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = ChatConversationSerializer(conversation, data=request.data, partial=True)
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


class ChatStreamView(APIView):
    permission_classes = (IsAuthenticated, HasPositiveBalance)

    def post(self, request):
        message_id = request.data.get("message_id")
        if not message_id:
            return Response(
                {"message": "message_id_required", "status": "error"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            user_message = ChatMessage.objects.get(id=message_id, user=request.user)
            model = user_message.ai_model
        except ChatMessage.DoesNotExist:
            return Response(
                {"message": "message_not_found", "status": "error"},
                status=status.HTTP_404_NOT_FOUND,
            )

        # TODO: implement versionning of the conversation
        parent_ids = [user_message.id]
        current_message = user_message
        while current_message.parent_id:
            parent_ids.append(current_message.parent_id)
            current_message = ChatMessage.objects.get(id=current_message.parent_id)

        conversation_messages = FormattedMessageSerializer(
            ChatMessage.objects.filter(Q(id__in=parent_ids)).order_by("date_created"),
            many=True,
        ).data

        def stream_and_save():
            full_response = ""
            token_in = token_out = None
            ai_message_serializer = ChatMessageSerializer(
                data={
                    "user": request.user.id,
                    "chat_conversation": user_message.chat_conversation.id,
                    "content": "",
                    "role": "assistant",
                    "ai_model": model.id,
                    "parent": user_message.id,
                    "type": "text",
                }
            )
            ai_message_serializer.is_valid(
                raise_exception=True
            )  # TODO: handle API problems, like stop generation (i.e. data.completed=False)
            ai_message = ai_message_serializer.save()
            _ai_message_data = ai_message_serializer.data
            yield f"data: {serialize_to_json(ai_message_serializer.data)}\n\n"
            char_count = 0
            for chunk in get_api_response(
                model_name=model.name, model_provider=model.provider.name, messages=conversation_messages
            ):
                # this allows to send the response to the client as it is being generated
                if content := chunk.content:
                    full_response += content
                    # Update the serializer with the new content
                    ChatMessage.objects.filter(id=ai_message.id).update(content=full_response)
                    _ai_message_data["content"] = content
                    # Convert the serializer data to a JSON string
                    char_count += len(content)
                    yield f"data: {serialize_to_json(_ai_message_data)}\n\n"

                if model.provider != "Perplexity":
                    if usage := chunk.usage_metadata:
                        if token_in := usage.get("input_tokens"):
                            ChatMessage.objects.filter(id=user_message.id).update(num_tokens=F("num_tokens") + token_in)
                        if token_out := usage.get("output_tokens"):
                            pass

                # Perplexity specific handling
                if response := chunk.response_metadata:
                    if model.provider.name == "Perplexity" and response.get("finish_reason") == "stop":
                        estimated_tokens = char_count // 4  # Rough estimate: 1 token ≈ 4 characters
                        token_in = (
                            len("".join(msg["content"] for msg in conversation_messages if msg["content"])) // 4 + 5000
                        )  # Add the 0.005$ of Perplexity request cost
                        token_out = estimated_tokens
                        ChatMessage.objects.filter(id=user_message.id).update(num_tokens=token_in + token_out)
                    # TODO: also implement response metadata, e.g. stop reason

            # updates the user's balance
            user_message_cost = request.user.calculate_message_cost(token_in, model, is_input=True)
            ai_message_cost = request.user.calculate_message_cost(token_out, model, is_input=False)
            total_cost = user_message_cost + ai_message_cost
            request.user.update_balance(total_cost)

        response = StreamingHttpResponse(stream_and_save(), content_type="text/event-stream")
        # do not remove this, it is used by nginx to stream the response
        # https://discovergen.ai/article/creating-a-streaming-chat-application-with-django/
        response["X-Accel-Buffering"] = "no"
        response["Cache-Control"] = "no-cache"
        return response


class ChatConversationTitleView(APIView):
    permission_classes = (IsAuthenticated, IsOwner)

    def post(self, request):
        title = generate_title(request.data.get("user_message"))
        return Response({"data": {"name": title}})


class FeedbackView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        feedback_message = request.data.get("message")
        if not feedback_message:
            return Response({"status": "error", "message": "no_feedback_message"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = request.user
            user_context = f"User ID: {user.id}, Email: {user.email}"
            feedback_with_context = f"User Context:\n{user_context}\n\nFeedback Message:\n{feedback_message}"
            send_feedback_email(feedback_with_context)
            return Response({"status": "success", "message": "feedback_sent"}, status=status.HTTP_200_OK)
        except Exception as e:
            print(e)
            return Response(
                {"status": "error", "message": "feedback_sending_error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class FileAccessView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request, conv_id, filename):
        # Check if the user has access to this conversation
        try:
            ChatConversation.objects.get(id=conv_id, user=request.user)
        except ChatConversation.DoesNotExist:
            return Response(
                {"message": "conversation_not_found", "status": "error"},
                status=status.HTTP_404_NOT_FOUND,
            )

        file_path = os.path.join("chat_uploads", str(conv_id), filename)

        if default_storage.exists(file_path):
            file = default_storage.open(file_path, "rb")
            response = FileResponse(file)
            response["Content-Disposition"] = f'inline; filename="{filename}"'
            return response
        else:
            print(f"File not found: {file_path}")
            return Response(
                {"message": "file_not_found", "status": "error"},
                status=status.HTTP_404_NOT_FOUND,
            )


class UnifiedChatView(APIView):
    permission_classes = (IsAuthenticated, IsOwner)

    def post(self, request, conv_id):
        request_type = request.data.get("type", "text")  # Default to 'text' if not specified

        if request_type == "text":
            return ChatMessageView.as_view()(request._request, conv_id=conv_id)
        elif request_type == "image":
            return ImageGenerationView.as_view()(request._request, conv_id=conv_id)
        else:
            return Response({"message": "invalid_request_type", "status": "error"}, status=status.HTTP_400_BAD_REQUEST)
