from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import User
from chat.models import AIModel


class UserSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True)
    email_verified = serializers.BooleanField(read_only=True)

    class Meta:
        model = User
        fields = ("id", "email", "password", "email_verified")

    def create(self, validated_data):
        user = User(
            email=validated_data["email"],
        )
        user.set_password(validated_data["password"])
        user.save()
        return user

    def update(self, instance, validated_data):
        instance.email = validated_data.get("email", instance.email)
        instance.password = validated_data.get("password", instance.password)
        instance.save()
        return instance


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = User.USERNAME_FIELD

    def validate(self, attrs):
        data = super().validate(attrs)
        return data


class UserInfosSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(read_only=True)
    password = serializers.CharField(write_only=True, required=False)
    last_name = serializers.CharField(required=False, allow_blank=True)
    first_name = serializers.CharField(required=False, allow_blank=True)
    preferred_model = serializers.PrimaryKeyRelatedField(
        queryset=AIModel.objects.all(), required=False
    )
    stripe_payment_method_id = serializers.CharField(read_only=True)
    email_verified = serializers.BooleanField(read_only=True)
    balance = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = User
        fields = (
            "email",
            "password",
            "last_name",
            "first_name",
            "preferred_model",
            "email_verified",
            "stripe_payment_method_id",
            "balance",
        )
