from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase

from farmers.models import Farmer
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
