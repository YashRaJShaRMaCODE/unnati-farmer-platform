from rest_framework import serializers

from lands.models import LandRecord


class LandRecordSerializer(serializers.ModelSerializer):
    farmer_email = serializers.EmailField(source="farmer.user.email", read_only=True)

    class Meta:
        model = LandRecord
        fields = [
            "id",
            "farmer",
            "farmer_email",
            "survey_number",
            "total_area",
            "soil_type",
            "irrigation_type",
            "location",
            "ownership_document",
            "is_verified",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "farmer", "is_verified", "created_at", "updated_at"]
