from rest_framework import serializers

from .models import AIModel, AIModelProvider, ChatConversation, ChatMessage


class AIModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIModel
        fields = (
            "id",
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
        fields = ("id", "name", "user", "date_updated", "ai_model")


class ChatMessageSerializer(serializers.ModelSerializer):
    role = serializers.CharField(max_length=100, required=True, allow_null=True)
    content = serializers.CharField(max_length=10000, required=True, allow_null=True, allow_blank=True)
    ai_model = serializers.PrimaryKeyRelatedField(queryset=AIModel.objects.all(), write_only=True, allow_null=True)
    ai_model_details = AIModelSerializer(source="ai_model", read_only=True)
    files = serializers.JSONField(required=False)
    parent = serializers.PrimaryKeyRelatedField(queryset=ChatMessage.objects.all(), allow_null=True)
    children = serializers.PrimaryKeyRelatedField(read_only=True, many=True)

    class Meta:
        model = ChatMessage
        fields = (
            "id",
            "chat_conversation",
            "role",
            "content",
            "date_created",
            "completed",
            "ai_model",
            "ai_model_details",
            "user",
            "num_tokens",
            "files",
            "parent",
            "children",
        )


# serializer for chat conversation, having a list of chat messages
# each chat message is a dict {"role": role, "content": content}
class FormattedMessageSerializer(serializers.Serializer):
    role = serializers.CharField(max_length=100, required=True)
    content = serializers.CharField(max_length=10000, required=True)
    files = serializers.JSONField(required=False)

    class Meta:
        model = ChatMessage
        fields = ("role", "content", "files")
