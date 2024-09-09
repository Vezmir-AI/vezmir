from abc import ABC, abstractmethod

from django.conf import settings
from langchain_anthropic import ChatAnthropic
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq
from langchain_openai import ChatOpenAI
import base64
from langchain.schema import HumanMessage, AIMessage


class AbstractAPI(ABC):
    @classmethod
    def get_response(cls, messages: list[dict], model_name: str):
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
        
        formatted_messages = format_messages(messages)
        
        for chunk in chat.stream(formatted_messages, stream_usage=True):
            yield chunk


class AnthropicAPI(AbstractAPI):
    API_KEY = settings.ANTHROPIC_API_KEY

    @classmethod
    def _get_response(cls, messages: list[dict], model_name: str, file_paths: list[str]) -> str:
        chat = ChatAnthropic(api_key=cls.API_KEY, model=model_name)
        
        formatted_messages = format_messages(messages)
        
        for chunk in chat.stream(formatted_messages, stream_usage=True):
            yield chunk


class GoogleAPI(AbstractAPI):
    API_KEY = settings.GOOGLE_API_KEY

    @classmethod
    def _get_response(cls, messages: list[dict], model_name: str, file_paths: list[str]) -> str:
        chat = ChatGoogleGenerativeAI(api_key=cls.API_KEY, model=model_name)
        
        formatted_messages = format_messages(messages)
        
        for chunk in chat.stream(formatted_messages, stream_usage=True):
            yield chunk


class GroqAPI:
    API_KEY = settings.GROQ_API_KEY

    @classmethod
    def get_response(cls, messages: list[dict], model_name: str) -> str:
        completion = ChatGroq(
            api_key=cls.API_KEY,
            model=model_name,
        )
        return completion.invoke(messages)


def format_messages(messages):
    formatted_messages = []
    for msg in messages:
        if msg['role'] == 'user':
            formatted_messages.append(HumanMessage(content=msg['content']))
            if msg['files']:
                formatted_messages.extend(format_image_messages(msg['files']))
        elif msg['role'] == 'assistant':
            formatted_messages.append(AIMessage(content=msg['content']))
    return formatted_messages

def format_image_messages(files):
    image_messages = []
    for file in files:
        with open(file['path'], "rb") as image_file:
            base64_image = base64.b64encode(image_file.read()).decode('utf-8')
            image_messages.append(
                HumanMessage(
                    content=[
                        {"type": "text", "text": "Here's an image:"},
                        {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{base64_image}"}}
                    ]
                )
            )
    return image_messages
