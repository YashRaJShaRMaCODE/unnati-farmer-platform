from rest_framework import serializers

from complaints.models import Complaint


class ComplaintSerializer(serializers.ModelSerializer):
    farmer_email = serializers.EmailField(source="farmer.user.email", read_only=True)

    class Meta:
        model = Complaint
        fields = [
            "id",
            "farmer",
            "farmer_email",
            "title",
            "description",
            "evidence",
            "status",
            "resolution_notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "farmer",
            "status",
            "resolution_notes",
            "created_at",
            "updated_at",
        ]


class ComplaintReviewSerializer(serializers.ModelSerializer):
    farmer_email = serializers.EmailField(source="farmer.user.email", read_only=True)

    class Meta:
        model = Complaint
        fields = [
            "id",
            "farmer",
            "farmer_email",
            "title",
            "description",
            "evidence",
            "status",
            "resolution_notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "farmer",
            "farmer_email",
            "title",
            "description",
            "evidence",
            "created_at",
            "updated_at",
        ]
