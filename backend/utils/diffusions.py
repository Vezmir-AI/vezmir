from .lib import OpenAIAPI


def generate_image(model_provider, prompt):
    match model_provider:
        case _:
            return OpenAIAPI.generate_image(prompt)
