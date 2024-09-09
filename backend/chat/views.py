import time

from django.http import StreamingHttpResponse, HttpResponse, Http404
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import base64
import os

from chat.models import AIModel, AIModelProvider, ChatConversation, ChatMessage
from chat.serializers import (
    AIModelProviderSerializer,
    AIModelSerializer,
    ChatConversationSerializer,
    ChatMessageSerializer,
    FormattedMessageSerializer,
)
from utils.chatbots import choose_model, generate_title, get_api_response
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

        messages = ChatMessage.objects.filter(chat_conversation=conversation).order_by("date_created")
        serializer = ChatMessageSerializer(messages, many=True)
        print(f"Messages: {serializer}")
        return Response({"data": serializer.data})

    # create a new message in a conversation
    def post(self, request, conv_id):
        # verify that the conversation exists
        try:
            conversation = ChatConversation.objects.get(id=conv_id, user=request.user.id)
        except ChatConversation.DoesNotExist:
            return Response(
                {"message": "conversation_not_found", "status": "error"},
                status=status.HTTP_404_NOT_FOUND,
            )
            
        # Query model name and its provider
        model_name = request.data.get("model_name")
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

        # Handle file uploads
        uploaded_files = request.FILES.getlist('files')
        print(f"Uploaded files: {uploaded_files}")
        file_paths = []
        file_info = []
        
        # Create the directory structure
        upload_dir = os.path.join('chat_uploads', str(request.user.id), str(conv_id))
        os.makedirs(upload_dir, exist_ok=True)

        for file in uploaded_files:
            file_name = default_storage.get_valid_name(file.name)
            file_path = os.path.join(upload_dir, file_name)
            
            with default_storage.open(file_path, 'wb+') as destination:
                for chunk in file.chunks():
                    destination.write(chunk)
            
            print(f"Saved file path: {file_path}")
            file_url = request.build_absolute_uri(f'/api/chat/file/{request.user.id}/{conv_id}/{file_name}')
            file_info.append({
                'name': file_name,
                'url': file_url,
                'type': file.content_type
            })
            file_paths.append(file_path)

        # Create and save the user message with file information
        user_message_serializer = ChatMessageSerializer(
            data={
                "user": request.user.id,
                "chat_conversation": conv_id,
                "content": request.data.get("content"),
                "role": "user",
                "ai_model": model.id,
                "files": file_info
            }
        )
        user_message_serializer.is_valid(raise_exception=True)
        user_message = user_message_serializer.save()

        conv_messages = FormattedMessageSerializer(
            ChatMessage.objects.filter(chat_conversation=conversation).order_by("date_created"),
            many=True,
        ).data

        def stream_and_save():
            print(f"File paths being sent to get_api_response: {file_paths}")
            full_response = ""
            token_in = token_out = None
            for chunk in get_api_response(
                model_name=model_name,
                model_provider=model_provider,
                messages=conv_messages,
                file_paths=file_paths,
            ):
                # this allows to send the response to the client as it is being generated 
                if content := chunk.content:
                    full_response += content
                    yield content
                if usage := chunk.usage_metadata:
                    if token_in := usage.get("input_tokens"):
                        ChatMessage.objects.filter(id=user_message.id).update(num_tokens=token_in)
                    if token_out := usage.get("output_tokens"):
                        pass
                if response := chunk.response_metadata: # noqa: F841
                    # TODO implement response metadata, e.g. stop reason
                    
                    pass


            # Save the complete response to the database
            ai_message_serializer = ChatMessageSerializer(
                data={
                    "user": request.user.id,
                    "chat_conversation": conv_id,
                    "content": full_response,
                    "role": "assistant",
                    "ai_model": model.id,
                    "num_tokens": token_out,
                }
            )
            ai_message_serializer.is_valid(raise_exception=True) # TODO: handle API problems, like stop generation (i.e. data.completed=False)
            ai_message_serializer.save()

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

class ChooseModelView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        user_message = request.data.get("user_message")
        if not user_message:
            return Response({"status": "error", "message": "no_user_message"}, status=status.HTTP_400_BAD_REQUEST)

        chosen_model = choose_model(user_message)
        try:
            model = AIModelSerializer(AIModel.objects.get(name=chosen_model)).data
        except AIModel.DoesNotExist:
            return Response({"status": "error", "message": "model_not_found"}, status=status.HTTP_404_NOT_FOUND)
        return Response({"data": model})

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
    permission_classes = (AllowAny,)
    def get(self, request, user_id, conv_id, filename):
        file_path = os.path.join('chat_uploads', str(user_id), conv_id, filename)

        if default_storage.exists(file_path):
            with default_storage.open(file_path, 'rb') as file:
                response = HttpResponse(file.read(), content_type='application/octet-stream')
                response['Content-Disposition'] = f'inline; filename="{filename}"'
                return response
        else:
            raise Http404
