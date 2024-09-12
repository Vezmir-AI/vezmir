# defines the urls
from django.urls import path

from . import views

urlpatterns = [
    path("ai_models/", views.AIModelView.as_view()),
    path("ai_models/providers/", views.AIModelProviderView.as_view()),
    path("feedback/", views.FeedbackView.as_view()),
    path("chat/conversations/", views.UserConversationView.as_view()),
    path("chat/conversations/<uuid:conv_id>/", views.ChatMessageView.as_view()),
    path("chat/conversations/title/", views.ChatConversationTitleView.as_view()),
    path("chat/conversations/stream/", views.ChatStreamView.as_view()),
    path("chat/choose_model/", views.ChooseModelView.as_view()),
    path("chat/file/<str:conv_id>/<str:filename>/", views.FileAccessView.as_view()),
]
