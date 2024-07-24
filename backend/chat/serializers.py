from rest_framework import serializers

from .models import ChatConversation, AIModel, AIModelProvider, ChatMessage


class AIModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIModel
        fields = ("name", "provider", "is_active", "price_per_1K_token")


class AIModelProviderSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIModelProvider
        fields = ("name",)


class ChatConversationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatConversation
        fields = ("id", "name", "user", "date_updated")


class ChatMessageSerializer(serializers.ModelSerializer):
    content = serializers.CharField(max_length=10000, required=True)

    class Meta:
        model = ChatMessage
        fields = (
            "chat_conversation",
            "role",
            "content",
            "date_created",
            "completed",
            "model_name",
            "user",
        )
