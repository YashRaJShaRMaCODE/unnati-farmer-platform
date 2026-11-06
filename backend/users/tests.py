from django.contrib.auth import get_user_model
from django.core.cache import cache
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
        farmer = Farmer.objects.get(user__email="farmer@test.com")
        self.assertIsNone(farmer.aadhaar_number)

    def test_registration_cannot_assign_privileged_roles(self):
        for role in ("admin", "bank", "government"):
            with self.subTest(role=role):
                response = self.client.post(
                    self.register_url,
                    {
                        "email": f"{role}@test.com",
                        "username": role,
                        "password": "SecurePass123!",
                        "password_confirm": "SecurePass123!",
                        "role": role,
                        "first_name": "Test",
                        "last_name": "User",
                    },
                    format="json",
                )
                self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
                self.assertFalse(User.objects.filter(email=f"{role}@test.com").exists())

    def test_user_cannot_change_own_role(self):
        user = User.objects.create_user(
            email="self-role@test.com", username="self-role", password="SecurePass123!"
        )
        self.client.force_authenticate(user=user)

        response = self.client.patch(self.me_url, {"role": "admin"}, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user.refresh_from_db()
        self.assertEqual(user.role, "farmer")

    def test_register_buyer_creates_profile(self):
        response = self.client.post(
            self.register_url,
            {
                "email": "buyer@test.com",
                "username": "buyer",
                "password": "SecurePass123!",
                "password_confirm": "SecurePass123!",
                "role": "buyer",
                "first_name": "Test",
                "last_name": "Buyer",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.get(email="buyer@test.com").buyer_profile)

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

    def test_login_throttle_blocks_repeated_attempts(self):
        cache.clear()
        responses = [
            self.client.post(
                self.login_url,
                {"email": "missing@test.com", "password": "wrong"},
                format="json",
            )
            for _ in range(11)
        ]
        cache.clear()
        self.assertTrue(
            all(response.status_code == status.HTTP_401_UNAUTHORIZED for response in responses[:10])
        )
        self.assertEqual(responses[10].status_code, status.HTTP_429_TOO_MANY_REQUESTS)
