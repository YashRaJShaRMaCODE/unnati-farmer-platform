from rest_framework import serializers

from loans.models import LoanPrediction


class LoanPredictionSerializer(serializers.ModelSerializer):
    farmer_email = serializers.EmailField(source="farmer.user.email", read_only=True)

    class Meta:
        model = LoanPrediction
        fields = [
            "id",
            "farmer",
            "farmer_email",
            "trust_score",
            "land_size",
            "revenue",
            "transaction_count",
            "eligible_amount",
            "risk_category",
            "recommendation",
            "created_at",
        ]
        read_only_fields = fields


class LoanEligibilityRequestSerializer(serializers.Serializer):
    farmer_id = serializers.IntegerField(required=False)
