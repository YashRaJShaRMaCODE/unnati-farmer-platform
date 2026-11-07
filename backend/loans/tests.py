from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase

from farmers.models import Farmer
from loans.models import LoanPrediction
from loans.serializers import LoanPredictionSerializer
from loans.services import calculate_loan_eligibility
from trustscore.models import TrustScore

User = get_user_model()


class LoanEligibilityTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="loan@test.com",
            username="loanuser",
            password="SecurePass123!",
            role="farmer",
        )
        self.farmer = Farmer.objects.create(
            user=self.user,
            aadhaar_number="111122223333",
            address="Farm Road",
            verification_status=True,
        )
        TrustScore.objects.update_or_create(
            farmer=self.farmer,
            defaults={
                "verification_score": 20,
                "transaction_score": 30,
                "buyer_rating_score": 20,
                "government_score": 15,
                "complaint_score": 15,
                "total_score": 100,
                "category": "Excellent",
            },
        )

    def test_calculate_loan_eligibility(self):
        prediction = calculate_loan_eligibility(self.farmer)
        self.assertGreater(prediction.eligible_amount, Decimal("0"))
        self.assertIn(
            prediction.risk_category,
            ["low", "medium", "high"],
        )
        self.assertTrue(prediction.recommendation)
        self.assertIn("Demo estimate only", prediction.recommendation)
        self.assertNotIn("favorable interest rates", prediction.recommendation)

    def test_prediction_api_text_never_trusts_legacy_recommendation_copy(self):
        prediction = LoanPrediction.objects.create(
            farmer=self.farmer,
            trust_score=100,
            land_size=Decimal("1"),
            revenue=Decimal("0"),
            transaction_count=0,
            eligible_amount=Decimal("50000"),
            risk_category="low",
            recommendation="Eligible for priority loan processing with favorable interest rates.",
        )

        text = LoanPredictionSerializer(prediction).data["recommendation"]

        self.assertIn("not a lender's credit assessment", text)
        self.assertNotIn("favorable interest rates", text)
