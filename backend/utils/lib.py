import os
from abc import ABC, abstractmethod

from dotenv import load_dotenv
from django.conf import settings
import openai

load_dotenv(os.path.join(settings.BASE_DIR, "../.env"))


class AbstractAPI(ABC):
    @classmethod
    @abstractmethod
    def get_response(
        cls, messages: list[dict], model_name: str, system_prompt: str
    ) -> str:
        pass


class OpenAIAPI(AbstractAPI):
    OpenAI: openai.OpenAI = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    @classmethod
    def get_response(
        cls, messages: list[dict], model_name: str, system_prompt: str
    ) -> str:
        response = cls.OpenAI.chat.completions.create(
            model=model_name,
            messages=messages,
            system=system_prompt,
            stream=True,
        )
        for chunk in response:
            yield chunk.choices[0].delta.content


class SampleAPI(AbstractAPI):
    @classmethod
    def get_response(
        cls, messages: list[dict], model_name: str, system_prompt: str
    ) -> str:
        import time

        response = (
            "_This is a sample response._ Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy "
            "eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et "
            "accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est "
            "Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy "
            "eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et "
            "accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est "
            "Lorem ipsum dolor sit amet."
        )
        for word in response.split():
            time.sleep(0.1)
            yield word
            yield " "
