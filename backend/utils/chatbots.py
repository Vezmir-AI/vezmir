from .lib import AnthropicAPI, GoogleAPI, GroqAPI, OpenAIAPI


def get_api_response(model_name: str, model_provider: str, messages: list[dict]):
    formatted_messages = format_messages(messages, model_provider)
    match model_provider:
        case "OpenAI":
            yield from OpenAIAPI.get_response(formatted_messages, model_name)
        case "Anthropic":
            yield from AnthropicAPI.get_response(formatted_messages, model_name)
        case "Google":
            yield from GoogleAPI.get_response(formatted_messages, model_name)


def generate_title(user_message):
    message = [
        {
            "role": "user",
            "content": f"""
    You are an AI assistant. Generate a title for the following conversation.
    The title should be a really short summary of the conversation.
    Conversation: \n{user_message}\n\n
    Please respond with the title only, in the same language as the conversation.
    """,
        }
    ]

    response = GroqAPI.get_response(message, "llama3-8b-8192")
    return response.content.strip('"')


def format_messages(messages: list[dict], model_provider: str):
    match model_provider:
        case _:
            return messages
