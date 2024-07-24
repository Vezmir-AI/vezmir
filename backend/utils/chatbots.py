from .lib import OpenAIAPI, SampleAPI


def get_api_response(model_name: str, model_provider: str, messages: list[dict]):
    formatted_messages, system_prompt = format_messages(messages, model_provider)
    match model_provider:
        case "OpenAI":
            return OpenAIAPI.get_response(formatted_messages, model_name, system_prompt)
        case "sample":
            return SampleAPI.get_response(formatted_messages, model_name, system_prompt)


def format_messages(messages: list[dict], model_provider: str):
    match model_provider:
        case "OpenAI":
            system_prompt = None
            if messages[0]["role"] == "system":
                system_prompt = messages[0]["content"]
                messages = messages[1:]
            return messages, system_prompt
        case _:
            return messages
