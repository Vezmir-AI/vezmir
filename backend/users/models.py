from django.db import models
from decimal import Decimal
from django.contrib.auth.models import (
    AbstractBaseUser,
    PermissionsMixin,
    BaseUserManager,
)
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
    balance = models.DecimalField(max_digits=100, decimal_places=10, default=0)
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
        price_per_1k = (
            model.price_per_1K_token_input
            if is_input
            else model.price_per_1K_token_output
        )
        return (num_tokens / 1000) * price_per_1k

    def update_balance(self, cost):
        print("Updating balance", cost)
        self.balance -= Decimal(str(cost))
        self.save()
