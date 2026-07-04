from django.contrib.auth import get_user_model
from django.test import TestCase

from farmers.models import Farmer
from trustscore.models import TrustScore
from trustscore.services import (
    calculate_complaint_score,
    calculate_trust_score,
    calculate_verification_score,
    recalculate_farmer_trust_score,
)

User = get_user_model()


class TrustScoreServiceTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="trust@test.com",
            username="trustuser",
            password="SecurePass123!",
            role="farmer",
            is_verified=True,
        )
        self.farmer = Farmer.objects.create(
            user=self.user,
            aadhaar_number="987654321098",
            address="Village Road",
            verification_status=True,
        )

    def test_verification_score_max(self):
        score = calculate_verification_score(self.farmer)
        self.assertEqual(score, 20)

    def test_trust_score_categories(self):
        result = calculate_trust_score(20, 30, 20, 15, 15)
        self.assertEqual(result["total_score"], 100)
        self.assertEqual(result["category"], "Excellent")

        result = calculate_trust_score(10, 10, 10, 5, 5)
        self.assertEqual(result["category"], "High Risk")

    def test_recalculate_creates_trust_score(self):
        recalculate_farmer_trust_score(self.farmer)
        self.assertTrue(TrustScore.objects.filter(farmer=self.farmer).exists())

    def test_complaint_score_no_complaints(self):
        score = calculate_complaint_score(self.farmer)
        self.assertEqual(score, 15)
