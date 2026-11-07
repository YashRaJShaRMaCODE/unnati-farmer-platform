from django.contrib.auth import get_user_model
from django.test import TestCase

from crops.models import CropRecord
from farmers.models import Buyer, Farmer
from marketplace.models import Listing, Transaction
from trustscore.models import TrustScore
from trustscore.services import (
    calculate_complaint_score,
    calculate_sales_volume_score,
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

    def test_sales_volume_score_uses_only_completed_trade_value(self):
        buyer_user = User.objects.create_user(
            email="buyer@test.com", username="buyer", password="SecurePass123!", role="buyer"
        )
        buyer = Buyer.objects.create(user=buyer_user)
        crop = CropRecord.objects.create(
            farmer=self.farmer,
            crop_name="Rice",
            season="kharif",
            area_used="1.00",
            yield_amount="100.00",
            harvest_date="2026-10-01",
        )
        listing = Listing.objects.create(
            farmer=self.farmer, crop=crop, quantity="100.00", price_per_unit="1000.00"
        )
        Transaction.objects.create(
            listing=listing, buyer=buyer, quantity="200.00", total_amount="200000.00", status="completed"
        )
        Transaction.objects.create(
            listing=listing, buyer=buyer, quantity="500.00", total_amount="500000.00", status="cancelled"
        )

        self.assertEqual(calculate_sales_volume_score(self.farmer), 15)
