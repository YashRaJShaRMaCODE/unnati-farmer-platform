from rest_framework import serializers

from loans.models import LoanPrediction


class LoanPredictionSerializer(serializers.ModelSerializer):
    farmer_email = serializers.EmailField(source="farmer.user.email", read_only=True)
    recommendation = serializers.SerializerMethodField()

    def get_recommendation(self, _prediction):
        return (
            "Demo estimate only. This is not a lender's credit assessment, loan approval, "
            "priority processing, or interest-rate offer. A lender independently assesses "
            "eligibility and terms."
        )

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
