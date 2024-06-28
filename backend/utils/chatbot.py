from time import sleep

from .lib import OpenAI


def get_chatgpt_response(messages: list[dict], model: str = "gpt-3.5-turbo"):
    stream = OpenAI.chat.completions.create(
        model=model,
        messages=messages,
        stream=True,
    )
    for chunk in stream:
        if chunk.choices[0].delta.content is not None:
            content = chunk.choices[0].delta.content
            yield content


def get_fakegpt_response(messages: list[dict], model: str = "gpt-3.5-turbo"):
    stream = """lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum""".split()
    for chunk in stream:
        sleep(0.1)
        yield chunk
