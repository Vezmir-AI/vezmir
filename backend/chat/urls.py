# defines the urls
from django.urls import path

from . import views

urlpatterns = [
    path("init_conversation/", views.init_conversation),
    path("get_conversation/<int:conversation_id>/", views.get_conversation),
    path("add_message/<int:conversation_id>/", views.add_message),
    path("talk/<int:conversation_id>/", views.talk),
]
