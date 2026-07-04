from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from crops.models import CropRecord
from farmers.models import Farmer

User = get_user_model()


class CropAPITestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="cropapi@test.com",
            username="cropapi",
            password="SecurePass123!",
            role="farmer",
        )
        self.farmer = Farmer.objects.create(
            user=self.user,
            aadhaar_number="555566667777",
            address="Farm",
        )
        self.client.force_authenticate(user=self.user)

    def test_create_crop(self):
        url = reverse("crop-list")
        payload = {
            "crop_name": "Wheat",
            "season": "rabi",
            "area_used": "2.5",
            "yield_amount": "100",
            "harvest_date": "2025-03-15",
        }
        response = self.client.post(url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(CropRecord.objects.count(), 1)
