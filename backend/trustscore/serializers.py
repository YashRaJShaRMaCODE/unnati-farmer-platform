from rest_framework import serializers

from trustscore.models import TrustScore


class TrustScoreSerializer(serializers.ModelSerializer):
    farmer_email = serializers.EmailField(source="farmer.user.email", read_only=True)

    class Meta:
        model = TrustScore
        fields = [
            "id",
            "farmer",
            "farmer_email",
            "verification_score",
            "transaction_score",
            "buyer_rating_score",
            "government_score",
            "complaint_score",
            "total_score",
            "category",
            "calculated_at",
        ]
        read_only_fields = fields
