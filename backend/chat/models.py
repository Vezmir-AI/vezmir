from uuid import uuid4

from django.conf import settings
from django.db import models


class AIModelProvider(models.Model):
    name = models.CharField(max_length=100, primary_key=True)
    display_name = models.CharField(max_length=100)


class AIModel(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100, unique=True)
    display_name = models.CharField(max_length=100, null=True)
    provider = models.ForeignKey(AIModelProvider, on_delete=models.CASCADE, related_name="models")
    hint = models.CharField(max_length=100, null=True)
    is_active = models.BooleanField(default=True)
    price_per_1K_token_input = models.FloatField(default=0.0)
    price_per_1K_token_output = models.FloatField(default=0.0)


class ChatConversation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    name = models.CharField(max_length=100, default="New Chat", null=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    ai_model = models.ForeignKey(AIModel, on_delete=models.SET_NULL, null=True)
    is_active = models.BooleanField(default=True)
    date_created = models.DateTimeField(auto_now_add=True)
    date_updated = models.DateTimeField(auto_now=True)


class ChatMessage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="messages")
    chat_conversation = models.ForeignKey(ChatConversation, on_delete=models.CASCADE, related_name="messages")
    role = models.CharField(max_length=100, choices=[("assistant", "Assistant"), ("user", "User")])
    content = models.TextField()
    date_created = models.DateTimeField(auto_now_add=True)
    completed = models.BooleanField(default=True)
    ai_model = models.ForeignKey(AIModel, on_delete=models.SET_NULL, null=True)
    num_tokens = models.IntegerField(default=0)
    files = models.JSONField(null=True, blank=True)
