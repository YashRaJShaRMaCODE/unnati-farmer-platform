from rest_framework import serializers

from schemes.models import GovernmentScheme, SchemeApplication


class GovernmentSchemeSerializer(serializers.ModelSerializer):
    class Meta:
        model = GovernmentScheme
        fields = [
            "id",
            "name",
            "description",
            "eligibility_criteria",
            "benefit_amount",
            "start_date",
            "end_date",
            "is_active",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class SchemeApplicationSerializer(serializers.ModelSerializer):
    farmer_email = serializers.EmailField(source="farmer.user.email", read_only=True)
    scheme_name = serializers.CharField(source="scheme.name", read_only=True)

    class Meta:
        model = SchemeApplication
        fields = [
            "id",
            "farmer",
            "farmer_email",
            "scheme",
            "scheme_name",
            "status",
            "applied_at",
            "remarks",
        ]
        read_only_fields = ["id", "farmer", "applied_at"]
