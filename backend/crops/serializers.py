from rest_framework import serializers

from crops.models import CropRecord


class CropRecordSerializer(serializers.ModelSerializer):
    farmer_email = serializers.EmailField(source="farmer.user.email", read_only=True)

    class Meta:
        model = CropRecord
        fields = [
            "id",
            "farmer",
            "farmer_email",
            "crop_name",
            "season",
            "area_used",
            "yield_amount",
            "harvest_date",
            "created_at",
        ]
        read_only_fields = ["id", "farmer", "created_at"]
