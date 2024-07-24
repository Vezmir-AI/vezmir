# defines the urls
from django.urls import path

from . import views

urlpatterns = [
    path("ai_models/", views.AIModelView.as_view()),
    path("ai_models/providers/", views.AIModelProviderView.as_view()),
    path("chat/conversations/", views.UserConversationView.as_view()),
    path("chat/conversations/<uuid:conv_id>/", views.ChatMessageView.as_view()),
]
