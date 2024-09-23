import base64

from langchain.schema import AIMessage, HumanMessage

from .lib import AnthropicAPI, GoogleAPI, GroqAPI, OpenAIAPI, PerplexityAPI


def get_api_response(model_name: str, model_provider: str, messages: list[dict]):
    formatted_messages = format_messages(messages, model_provider)
    match model_provider:
        case "OpenAI":
            yield from OpenAIAPI.get_response(formatted_messages, model_name)
        case "Anthropic":
            yield from AnthropicAPI.get_response(formatted_messages, model_name)
        case "Google":
            yield from GoogleAPI.get_response(formatted_messages, model_name)
        case "Perplexity":
            yield from PerplexityAPI.get_response(formatted_messages, model_name)


def generate_title(user_message):
    message = [
        {
            "role": "user",
            "content": f"""
    How best can you describe this conversation?
    Conversation: \n{user_message}\n\n
    Please respond with a few words, max 5.
    """,
        }
    ]

    response = GroqAPI.get_response(message, "llama3-8b-8192")
    return response.content.strip('"')


def choose_model(user_message):
    mapping = {
        "Programming code": "claude-3-5-sonnet-20240620",
        "General knowledge": "gpt-4o-mini-2024-07-18",
        "Mailing": "gpt-4o-2024-08-06",
        "Translation": "gpt-4o-mini-2024-07-18",
        "Writing": "gpt-4o-2024-08-06",
        "Mathematics": "gpt-4o-2024-08-06",
    }

    message = [
        {
            "role": "user",
            "content": (
                "Based on this prompt can you select the category that is the most close to the question just "
                'output the category : \n\nCategories : ["Programming code", "General knowledge", "Mailing", '
                f'"Translation", "Writing", Mathematics"]\n\nPrompt : {user_message}'
            ),
        }
    ]

    response = GroqAPI.get_response(message, "llama3-8b-8192")
    category = response.content.strip('"')
    try:
        chosen_model = mapping[category]
    except KeyError:
        chosen_model = "gpt-4o-mini-2024-07-18"

    return chosen_model


def format_messages(messages: list[dict], model_provider: str):
    match model_provider:
        case _:
            formatted_messages = []
            for msg in messages:
                if msg["role"] == "user":
                    formatted_messages.append(HumanMessage(content=msg["content"]))
                    if msg["files"]:
                        formatted_messages.extend(format_image_messages(msg["files"]))
                elif msg["role"] == "assistant":
                    formatted_messages.append(AIMessage(content=msg["content"]))
            return formatted_messages


def format_image_messages(files):
    image_messages = []
    for file in files:
        with open(file["path"], "rb") as image_file:
            base64_image = base64.b64encode(image_file.read()).decode("utf-8")
            image_messages.append(
                HumanMessage(
                    content=[
                        {"type": "text", "text": "Here's an image:"},
                        {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{base64_image}"}},
                    ]
                )
            )
    return image_messages
