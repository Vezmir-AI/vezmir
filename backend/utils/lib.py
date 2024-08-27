import os
from abc import ABC, abstractmethod

from django.conf import settings
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq


class AbstractAPI(ABC):
    @classmethod
    def get_response(cls, messages: list[dict], model_name: str) -> str:
        # adds "be concise" to the last message
        # messages[-1]["content"] = messages[-1]["content"] + "\n\nBe concise."
        yield from cls._get_response(messages, model_name)

    @classmethod
    @abstractmethod
    def _get_response(self, messages: list[dict], model_name: str) -> str:
        pass


class OpenAIAPI(AbstractAPI):
    API_KEY = settings.OPENAI_API_KEY

    @classmethod
    def _get_response(cls, messages: list[dict], model_name: str) -> str:
        chat = ChatOpenAI(
            api_key=cls.API_KEY,
            model=model_name,
        )
        for chunk in chat.stream(messages, stream_usage=True):
            yield chunk


class AnthropicAPI(AbstractAPI):
    API_KEY = settings.ANTHROPIC_API_KEY

    @classmethod
    def _get_response(cls, messages: list[dict], model_name: str) -> str:
        chat = ChatAnthropic(
            api_key=cls.API_KEY,
            model=model_name,
        )
        for chunk in chat.stream(messages, stream_usage=True):
            yield chunk


class GoogleAPI(AbstractAPI):
    API_KEY = settings.GOOGLE_API_KEY

    @classmethod
    def _get_response(cls, messages: list[dict], model_name: str) -> str:
        chat = ChatGoogleGenerativeAI(
            api_key=cls.API_KEY,
            model=model_name,
        )
        for chunk in chat.stream(messages):
            yield chunk


class GroqAPI():
    API_KEY = settings.GROQ_API_KEY

    @classmethod
    def get_response(cls, messages: list[dict], model_name: str) -> str:
        completion = ChatGroq(
            api_key=cls.API_KEY,
            model=model_name,
        )
        return completion.invoke(messages)
