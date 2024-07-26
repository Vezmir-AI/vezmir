from .lib import OpenAIAPI, SampleAPI


def get_api_response(model_name: str, model_provider: str, messages: list[dict]):
    formatted_messages = format_messages(messages, model_provider)
    match model_provider:
        case "OpenAI":
            return OpenAIAPI.get_response(formatted_messages, model_name)
        case "sample":
            return SampleAPI.get_response(formatted_messages, model_name)


def format_messages(messages: list[dict], model_provider: str):
    match model_provider:
        case _:
            return messages
