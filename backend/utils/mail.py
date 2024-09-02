from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import EmailMessage
from django.template.loader import render_to_string
from django.utils import timezone


def send_verification_email(user):
    token = default_token_generator.make_token(user)
    user.email_verification_token = token
    user.email_verification_token_created_at = timezone.now()
    user.save()
    verification_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"
    html_body = render_to_string(
        "mail/email_verification.html",
        {"activation_link": verification_url, "user": user},
    )
    email = EmailMessage(
        "Please verify your email",
        html_body,
        "Vezmir AI <no-reply@vezmir.com>",
        [user.email],
    )
    email.content_subtype = "html"
    email.send()


def send_feedback_email(feedback_message):
    email = EmailMessage(
        "New Feedback Received",
        feedback_message,
        "Vezmir AI <no-reply@vezmir.com>",
        ["antoine@vezmir.com", "jb@vezmir.com"],
    )
    email.send()
