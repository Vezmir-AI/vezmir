from .lib import AnthropicAPI, GoogleAPI, GroqAPI, OpenAIAPI
import random

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

def choose_model(user_message):
    mapping = {
        "Programming code": "claude-3-5-sonnet-20240620",
        "General knowledge": "gpt-4o-mini",
        "Mailing": "gpt-4o",
        "Translation": "gpt-4o-mini",
        "Writing": "gpt-4o",
        "Mathematics": "gpt-4o",
    }
    
    message = [
        {
            "role": "user",
            "content": f"Based on this prompt can you select the category that is the most close the question just output the category : \n\nCategories : [\"Programming code\", \"General knowledge\", \"Mailing\", \"Translation\", \"Writing\", Mathematics\"]\n\nPrompt : {user_message}"
        }
    ]
    
    response = GroqAPI.get_response(message, "llama3-8b-8192")
    category = response.content.strip('"')
    chosen_model = mapping[category]
    
    
    if chosen_model == "gpt-4o-mini" and random.random() < 0.3:
        chosen_model = "gemini-1.5-flash"
    elif chosen_model == "gpt-4o" and random.random() < 0.3:
        chosen_model = "gemini-1.5-pro"
    
    return chosen_model


def format_messages(messages: list[dict], model_provider: str):
    match model_provider:
        case _:
            return messages
