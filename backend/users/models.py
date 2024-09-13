from decimal import Decimal

from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)
from django.db import models

from chat.models import AIModel


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Users must have an email address")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        user = self.create_user(email, password, **extra_fields)
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user


class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    last_name = models.CharField(max_length=255, null=True, blank=True)
    first_name = models.CharField(max_length=255, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    email_verified = models.BooleanField(default=False)
    email_verification_token = models.CharField(max_length=255, null=True, blank=True)
    email_verification_token_created_at = models.DateTimeField(null=True, blank=True)

    # django admin required file
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)

    # App related fields
    is_active = models.BooleanField(default=True)
    balance = models.DecimalField(max_digits=20, decimal_places=10, default=Decimal("10.0"))
    preferred_model = models.ForeignKey(AIModel, on_delete=models.SET_NULL, null=True, blank=True)
    stripe_customer_id = models.CharField(max_length=50, blank=True, null=True)
    stripe_payment_method_id = models.CharField(max_length=50, blank=True, null=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self):
        """Return string representation of our user"""
        return self.email

    def calculate_message_cost(self, num_tokens, model, is_input):
        price_per_1k = model.price_per_1K_token_input if is_input else model.price_per_1K_token_output
        return (num_tokens / 1000) * price_per_1k

    def update_balance(self, cost):
        self.balance -= Decimal(str(cost))
        self.save()


## STATS RELATED MODELS ##


# Count of connections per day
class UserConnection(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    connection_date = models.DateField(auto_now_add=True)

    class Meta:
        unique_together = ["user", "connection_date"]


# Count of new messages per day per users
class UserMessage(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    message_date = models.DateField(auto_now_add=True)
    message_count = models.IntegerField(default=0)

    class Meta:
        unique_together = ["user", "message_date"]


# Count of new conversations per day per users
class UserConversation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    conversation_date = models.DateField(auto_now_add=True)
    conversation_count = models.IntegerField(default=0)

    class Meta:
        unique_together = ["user", "conversation_date"]


# Count of how many times users go back to past conversations
class UserBackToConversation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    back_to_conversation_date = models.DateField(auto_now_add=True)
    back_to_conversation_count = models.IntegerField(default=0)

    class Meta:
        unique_together = ["user", "back_to_conversation_date"]


# Count of how many times users go to usage page
class UserWentToUsage(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    went_to_usage_date = models.DateField(auto_now_add=True)
    went_to_usage_count = models.IntegerField(default=0)

    class Meta:
        unique_together = ["user", "went_to_usage_date"]
