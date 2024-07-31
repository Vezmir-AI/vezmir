import os
from abc import ABC, abstractmethod

from django.conf import settings
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic


class AbstractAPI(ABC):
    @classmethod
    def get_response(cls, messages: list[dict], model_name: str) -> str:
        # adds "be concise" to the last message
        messages[-1]["content"] = messages[-1]["content"] + "\n\nBe concise."
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


class SampleAPI(AbstractAPI):
    RESPONSE = (
        "_This is a sample response._ Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy "
        "eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua."
    )

    @classmethod
    def _get_response(cls, messages: list[dict], model_name: str) -> str:
        import time
        from collections import namedtuple

        message = namedtuple(
            "Message",
            ["content", "usage_metadata", "response_metadata"],
            defaults=[None, None, None],
        )
        for word in cls.RESPONSE.split():
            time.sleep(0.1)
            yield message(content=word + " ")
            yield message(content=" ")
        usage = {
            "prompt_tokens": sum(
                map(len, map(lambda x: x["content"].split(), messages))
            ),
            "completion_tokens": len(cls.RESPONSE),
        }
        yield message(usage_metadata=usage)
