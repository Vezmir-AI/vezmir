from rest_framework import serializers

from .models import ChatConversation, AIModel, AIModelProvider, ChatMessage


class AIModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIModel
        fields = (
            "name",
            "display_name",
            "provider",
            "is_active",
            "hint",
        )


class AIModelProviderSerializer(serializers.ModelSerializer):
    models = AIModelSerializer(many=True, read_only=True)

    class Meta:
        model = AIModelProvider
        fields = ("name", "models")


class ChatConversationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatConversation
        fields = ("id", "name", "user", "date_updated")


class ChatMessageSerializer(serializers.ModelSerializer):
    content = serializers.CharField(max_length=10000, required=True)

    class Meta:
        model = ChatMessage
        fields = (
            "id",
            "chat_conversation",
            "role",
            "content",
            "date_created",
            "completed",
            "model_name",
            "user",
            "num_tokens",
        )


# serializer for chat conversation, having a list of chat messages
# each chat message is a dict {"role": role, "content": content}
class FormattedMessageSerializer(serializers.Serializer):
    role = serializers.CharField(max_length=100, required=True)
    content = serializers.CharField(max_length=10000, required=True)

    class Meta:
        model = ChatMessage
        fields = ("role", "content")
