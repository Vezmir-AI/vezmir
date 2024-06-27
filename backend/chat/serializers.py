from rest_framework import serializers

from .models import ChatConversation


class ChatConversationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatConversation
        fields = "__all__"
