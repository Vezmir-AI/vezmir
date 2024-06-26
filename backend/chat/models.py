from django.db import models

# Create your models here.

class ChatConversation(models.Model):
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    user = models.CharField(max_length=100)
    messages = models.JSONField()
    
    def __str__(self):
        return self.name
    