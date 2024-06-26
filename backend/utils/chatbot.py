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
