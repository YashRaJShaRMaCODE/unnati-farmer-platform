from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from farmers.models import Buyer, Farmer

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "username",
            "first_name",
            "last_name",
            "phone_number",
            "role",
            "is_verified",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "is_verified", "created_at", "updated_at"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "email",
            "username",
            "password",
            "password_confirm",
            "first_name",
            "last_name",
            "phone_number",
            "role",
        ]

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError(
                {"password_confirm": "Passwords do not match."}
            )
        role = attrs.get("role", "farmer")
        if role not in dict(User.ROLE_CHOICES):
            raise serializers.ValidationError({"role": "Invalid role."})
        return attrs

    def create(self, validated_data):
        validated_data.pop("password_confirm")
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()

        if user.role == "buyer":
            Buyer.objects.create(user=user)

        return user


class QuickFarmerRegisterSerializer(serializers.Serializer):
    """Minimal onboarding: name, phone, village only."""

    first_name = serializers.CharField(max_length=150)
    phone_number = serializers.CharField(max_length=15)
    village = serializers.CharField(max_length=100)
    password = serializers.CharField(write_only=True, validators=[validate_password])

    def validate_phone_number(self, value):
        if User.objects.filter(phone_number=value).exists():
            raise serializers.ValidationError("Phone number already registered.")
        return value

    def create(self, validated_data):
        phone = validated_data["phone_number"]
        email = f"{phone.replace('+', '').replace(' ', '')}@unnati.farmer"
        counter = 1
        base_email = email
        while User.objects.filter(email=email).exists():
            email = f"{phone.replace('+', '')}{counter}@unnati.farmer"
            counter += 1

        user = User.objects.create_user(
            email=email,
            username=f"farmer_{phone.replace('+', '').replace(' ', '')}",
            password=validated_data["password"],
            first_name=validated_data["first_name"],
            phone_number=phone,
            role="farmer",
        )
        farmer = Farmer.objects.create(
            user=user,
            village=validated_data["village"],
            address=validated_data["village"],
            aadhaar_number=None,
        )
        return user


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
