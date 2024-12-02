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

    response = GroqAPI.get_response(message, "llama-3.2-11b-vision-preview")
    return response.content.strip('"')


def choose_model(user_message):
    mapping = {
        "Programming code": "claude-3-5-sonnet-latest",
        "General knowledge": "gpt-4o-mini",
        "Mailing": "gpt-4o-2024-11-20",
        "Translation": "gpt-4o-mini",
        "Writing": "gpt-4o-2024-11-20",
        "Mathematics": "gpt-4o-2024-11-20",
    }

    # First question to check if the prompt is searchable on the internet
    internet_search_message = [
        {
            "role": "user",
            "content": (
                "Need this prompt absolutely be answered using information available on the internet? "
                "Please respond with 'yes' or 'no'.\n\nPrompt: "
                f"{user_message}"
            ),
        }
    ]

    internet_search_response = GroqAPI.get_response(internet_search_message, "llama-3.2-11b-vision-preview")
    is_searchable = internet_search_response.content.strip('"').lower()

    if is_searchable == "yes":
        return "llama-3.1-sonar-large-128k-online"

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

    response = GroqAPI.get_response(message, "llama-3.2-11b-vision-preview")
    category = response.content.strip('"')
    try:
        chosen_model = mapping[category]
    except KeyError:
        chosen_model = "gpt-4o-mini"

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
