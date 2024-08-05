from django.contrib import admin

from .models import AIModel, AIModelProvider, ChatConversation, ChatMessage

admin.site.register(AIModel)
admin.site.register(AIModelProvider)
admin.site.register(ChatConversation)
admin.site.register(ChatMessage)
