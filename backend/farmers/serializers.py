from rest_framework import serializers

from farmers.models import Buyer, Farmer


class FarmerSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email", read_only=True)
    first_name = serializers.CharField(source="user.first_name", required=False)
    last_name = serializers.CharField(source="user.last_name", required=False)
    phone_number = serializers.CharField(
        source="user.phone_number", required=False, allow_blank=True
    )

    class Meta:
        model = Farmer
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "phone_number",
            "aadhaar_number",
            "village",
            "profile_image",
            "address",
            "experience_years",
            "verification_status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "verification_status", "created_at", "updated_at"]

    def update(self, instance, validated_data):
        user_data = validated_data.pop("user", {})
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        user = instance.user
        for attr, value in user_data.items():
            setattr(user, attr, value)
        user.save()
        return instance


class FarmerCreateSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source="user.first_name", required=False)
    last_name = serializers.CharField(source="user.last_name", required=False)
    phone_number = serializers.CharField(
        source="user.phone_number", required=False, allow_blank=True
    )

    class Meta:
        model = Farmer
        fields = [
            "aadhaar_number",
            "village",
            "profile_image",
            "address",
            "experience_years",
            "first_name",
            "last_name",
            "phone_number",
        ]

    def create(self, validated_data):
        user_data = validated_data.pop("user", {})
        user = self.context["request"].user
        for attr, value in user_data.items():
            setattr(user, attr, value)
        user.save()
        return Farmer.objects.create(user=user, **validated_data)


class BuyerSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email", read_only=True)
    first_name = serializers.CharField(source="user.first_name", required=False)
    last_name = serializers.CharField(source="user.last_name", required=False)

    class Meta:
        model = Buyer
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "company_name",
            "phone_number",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def update(self, instance, validated_data):
        user_data = validated_data.pop("user", {})
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        user = instance.user
        for attr, value in user_data.items():
            setattr(user, attr, value)
        user.save()
        return instance
