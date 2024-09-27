from abc import ABC, abstractmethod

from django.conf import settings
from langchain_anthropic import ChatAnthropic
from langchain_community.chat_models import ChatPerplexity
from langchain_core.language_models.chat_models import BaseChatModel
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq
from langchain_openai import ChatOpenAI
from openai import OpenAI


class AbstractAPI(ABC):
    @classmethod
    def get_response(cls, messages: list[dict], model_name: str):
        chat: BaseChatModel = cls.get_chat_model(model_name)
        for chunk in chat.stream(messages, stream_usage=True):
            yield chunk

    @classmethod
    @abstractmethod
    def get_chat_model(self, model_name: str) -> BaseChatModel:
        pass


class OpenAIAPI(AbstractAPI):
    API_KEY = settings.OPENAI_API_KEY
    CLIENT = OpenAI(api_key=API_KEY)

    @classmethod
    def get_chat_model(cls, model_name: str) -> BaseChatModel:
        return ChatOpenAI(api_key=cls.API_KEY, model=model_name)

    @classmethod
    def generate_image(cls, prompt: str) -> str:
        response = cls.CLIENT.images.generate(
            model="dall-e-3",
            prompt=prompt,
            size="1024x1024",
            quality="standard",
            n=1,
        )
        return response.data[0].url


class AnthropicAPI(AbstractAPI):
    @classmethod
    def get_chat_model(self, model_name: str) -> BaseChatModel:
        API_KEY = settings.ANTHROPIC_API_KEY
        return ChatAnthropic(api_key=API_KEY, model=model_name)


class GoogleAPI(AbstractAPI):
    @classmethod
    def get_chat_model(self, model_name: str) -> BaseChatModel:
        API_KEY = settings.GOOGLE_API_KEY
        return ChatGoogleGenerativeAI(api_key=API_KEY, model=model_name)


class PerplexityAPI(AbstractAPI):
    @classmethod
    def get_chat_model(self, model_name: str) -> BaseChatModel:
        API_KEY = settings.PPLX_API_KEY
        return ChatPerplexity(api_key=API_KEY, model=model_name)


class GroqAPI:
    @classmethod
    def get_response(cls, messages: list[dict], model_name: str) -> str:
        API_KEY = settings.GROQ_API_KEY
        completion = ChatGroq(
            api_key=API_KEY,
            model=model_name,
        )
        return completion.invoke(messages)
