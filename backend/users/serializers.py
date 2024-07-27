from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User

from django.contrib.auth.models import update_last_login

# TODO modify to use email instead of username
# modify to allow email verification, password reset, etc
class UserSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ("id", "email", "password")

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


class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=255)
    password = serializers.CharField(max_length=128, write_only=True)
    token = serializers.CharField(max_length=255, read_only=True)

    def validate(self, data):
        username = data.get("username", None)
        password = data.get("password", None)
        
        # Check if user exists
        if not User.objects.filter(username=username).exists():
            raise serializers.ValidationError("User does not exist.")
        
        user = authenticate(username=username, password=password)
        if user is None:
            raise serializers.ValidationError(
                "A user with this username and password is not found."
            )
        try:
            refresh = RefreshToken.for_user(user)
            jwt_token = str(refresh.access_token)
            update_last_login(None, user)
        except User.DoesNotExist:
            raise serializers.ValidationError(
                "User with given username and password does not exist"
            )
        return {"username": user.username, "token": jwt_token}