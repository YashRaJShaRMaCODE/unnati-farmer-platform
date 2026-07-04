from django.contrib.auth import get_user_model
from django.test import TestCase

from farmers.models import Farmer
from lands.models import LandRecord

User = get_user_model()


class LandRecordModelTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="land@test.com",
            username="landuser",
            password="SecurePass123!",
            role="farmer",
        )
        self.farmer = Farmer.objects.create(
            user=self.user,
            aadhaar_number="444455556666",
            address="Rural Area",
        )

    def test_create_land_record(self):
        land = LandRecord.objects.create(
            farmer=self.farmer,
            survey_number="SN-001",
            total_area=5.5,
            soil_type="alluvial",
            irrigation_type="canal",
            location="District A",
        )
        self.assertEqual(str(land), "SN-001 - land@test.com")
        self.assertFalse(land.is_verified)
