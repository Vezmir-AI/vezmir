from django.http import StreamingHttpResponse
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from utils.chatbot import get_chatgpt_response

from .models import ChatConversation
from .serializers import ChatConversationSerializer


@api_view(["POST"])
def init_conversation(request):
    conversation = ChatConversation.objects.create(
        name="Test Conversation",
        user="Test User",
        messages=[{"role": "user", "content": "bonjour"}],
    )
    return Response(
        {"conversation_id": conversation.id}, status=status.HTTP_201_CREATED
    )


@api_view(["GET"])
def get_conversation(request, conversation_id):
    # use the serializer to convert the model to json
    conversation = ChatConversation.objects.get(id=conversation_id)
    serializer = ChatConversationSerializer(conversation)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["PUT"])
def add_message(request, conversation_id):
    print(request.data)
    message = {"user": "user", "content": request.data["message"]}
    # model = request.data["model"]
    conversation = ChatConversation.objects.get(id=conversation_id)
    conversation.messages.append(message)
    conversation.save()
    # response = get_chatgpt_response(message["message"], model)
    response = "bite"
    conversation.messages.append({"role": "assistant", "content": response})
    return Response({"response": response}, status=status.HTTP_200_OK)


@api_view(["POST"])
def talk(request, conversation_id):
    # print(request.data)

    conversation = ChatConversation.objects.get(id=conversation_id)
    conversation.messages.append(request.data["message"])
    print(conversation.messages)
    return StreamingHttpResponse(get_chatgpt_response(conversation.messages))
