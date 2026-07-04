from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from farmers.models import Farmer

User = get_user_model()


class AuthAPITestCase(APITestCase):
    def setUp(self):
        self.register_url = reverse("register")
        self.login_url = reverse("login")
        self.me_url = reverse("current_user")

    def test_register_farmer(self):
        payload = {
            "email": "farmer@test.com",
            "username": "farmer1",
            "password": "SecurePass123!",
            "password_confirm": "SecurePass123!",
            "role": "farmer",
            "first_name": "Test",
            "last_name": "Farmer",
        }
        response = self.client.post(self.register_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email="farmer@test.com").exists())

    def test_login_and_me(self):
        user = User.objects.create_user(
            email="login@test.com",
            username="loginuser",
            password="SecurePass123!",
            role="farmer",
        )
        Farmer.objects.create(
            user=user,
            aadhaar_number="123456789012",
            address="Test Address",
        )
        login_response = self.client.post(
            self.login_url,
            {"email": "login@test.com", "password": "SecurePass123!"},
            format="json",
        )
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        access = login_response.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        me_response = self.client.get(self.me_url)
        self.assertEqual(me_response.status_code, status.HTTP_200_OK)
        self.assertEqual(me_response.data["email"], "login@test.com")
