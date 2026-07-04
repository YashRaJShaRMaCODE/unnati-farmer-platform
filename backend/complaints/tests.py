from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from complaints.models import Complaint
from farmers.models import Farmer

User = get_user_model()


class ComplaintAPITestCase(APITestCase):
    def setUp(self):
        self.farmer_user = User.objects.create_user(
            email="complaint@test.com",
            username="complaintuser",
            password="SecurePass123!",
            role="farmer",
        )
        self.farmer = Farmer.objects.create(
            user=self.farmer_user,
            aadhaar_number="888899990000",
            address="Village",
        )
        self.gov_user = User.objects.create_user(
            email="gov@test.com",
            username="govuser",
            password="SecurePass123!",
            role="government",
        )

    def test_farmer_create_complaint(self):
        self.client.force_authenticate(user=self.farmer_user)
        response = self.client.post(
            reverse("complaint-list"),
            {"title": "Water Issue", "description": "No irrigation supply"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_government_update_complaint(self):
        complaint = Complaint.objects.create(
            farmer=self.farmer,
            title="Test",
            description="Test complaint",
        )
        self.client.force_authenticate(user=self.gov_user)
        response = self.client.patch(
            reverse("complaint-detail", args=[complaint.id]),
            {"status": "resolved", "resolution_notes": "Issue fixed"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        complaint.refresh_from_db()
        self.assertEqual(complaint.status, "resolved")
