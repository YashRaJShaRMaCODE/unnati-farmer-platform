"""
Integration tests for API routes, JWT auth, dashboards, trust score, and loans.
"""
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from crops.models import CropRecord
from farmers.models import Farmer
from lands.models import LandRecord
from loans.services import calculate_loan_eligibility
from trustscore.models import TrustScore
from trustscore.services import (
    calculate_trust_score,
    calculate_verification_score,
    recalculate_farmer_trust_score,
)

User = get_user_model()


class JWTAuthenticationFlowTestCase(APITestCase):
    def setUp(self):
        self.register_url = reverse("register")
        self.login_url = reverse("login")
        self.refresh_url = reverse("token_refresh")
        self.logout_url = reverse("logout")
        self.me_url = reverse("current_user")

    def test_full_jwt_lifecycle(self):
        payload = {
            "email": "jwtflow@test.com",
            "username": "jwtflow",
            "password": "SecurePass123!",
            "password_confirm": "SecurePass123!",
            "role": "farmer",
            "first_name": "JWT",
            "last_name": "Flow",
        }
        reg = self.client.post(self.register_url, payload, format="json")
        self.assertEqual(reg.status_code, status.HTTP_201_CREATED)

        login = self.client.post(
            self.login_url,
            {"email": "jwtflow@test.com", "password": "SecurePass123!"},
            format="json",
        )
        self.assertEqual(login.status_code, status.HTTP_200_OK)
        self.assertIn("access", login.data)
        self.assertIn("refresh", login.data)
        access = login.data["access"]
        refresh = login.data["refresh"]

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        me = self.client.get(self.me_url)
        self.assertEqual(me.status_code, status.HTTP_200_OK)
        self.assertEqual(me.data["email"], "jwtflow@test.com")

        refresh_resp = self.client.post(
            self.refresh_url, {"refresh": refresh}, format="json"
        )
        self.assertEqual(refresh_resp.status_code, status.HTTP_200_OK)
        self.assertIn("access", refresh_resp.data)
        new_refresh = refresh_resp.data.get("refresh", refresh)

        logout = self.client.post(
            self.logout_url, {"refresh": new_refresh}, format="json"
        )
        self.assertEqual(logout.status_code, status.HTTP_200_OK)

    def test_quick_register_and_login(self):
        quick_url = reverse("quick_register")
        resp = self.client.post(
            quick_url,
            {
                "first_name": "Ram",
                "phone_number": "9988776655",
                "village": "Rampur",
                "password": "SecurePass123!",
            },
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        email = resp.data["user"]["email"]

        login = self.client.post(
            self.login_url,
            {"email": email, "password": "SecurePass123!"},
            format="json",
        )
        self.assertEqual(login.status_code, status.HTTP_200_OK)


class RoleDashboardAccessTestCase(APITestCase):
    def _create_user(self, role, email):
        user = User.objects.create_user(
            email=email,
            username=email.split("@")[0],
            password="SecurePass123!",
            role=role,
        )
        if role == "farmer":
            Farmer.objects.create(
                user=user,
                aadhaar_number="111111111111",
                village="TestVillage",
                address="Test",
            )
        elif role == "buyer":
            from farmers.models import Buyer

            Buyer.objects.create(user=user)
        return user

    def test_dashboard_endpoints_by_role(self):
        endpoints = {
            "farmer": "/api/dashboard/farmer/",
            "buyer": "/api/dashboard/buyer/",
            "government": "/api/dashboard/government/",
            "bank": "/api/dashboard/bank/",
            "admin": "/api/dashboard/admin/",
        }
        for role, url in endpoints.items():
            user = self._create_user(role, f"{role}@dash.test")
            self.client.force_authenticate(user=user)
            resp = self.client.get(url)
            self.assertEqual(
                resp.status_code,
                status.HTTP_200_OK,
                f"{role} dashboard failed: {resp.data}",
            )

    def test_village_analytics_government_access(self):
        user = self._create_user("government", "gov@village.test")
        self.client.force_authenticate(user=user)
        resp = self.client.get("/api/dashboard/village/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn("villages", resp.data)


class TrustScoreCalculationTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="trustcalc@test.com",
            username="trustcalc",
            password="SecurePass123!",
            role="farmer",
            is_verified=True,
        )
        self.farmer = Farmer.objects.create(
            user=self.user,
            aadhaar_number="222222222222",
            village="Greenfield",
            address="Test",
            verification_status=True,
        )

    def test_verification_score_components(self):
        score = calculate_verification_score(self.farmer)
        self.assertEqual(score, 20)

    def test_trust_score_excellent_category(self):
        result = calculate_trust_score(20, 30, 20, 15, 15)
        self.assertEqual(result["total_score"], 100)
        self.assertEqual(result["category"], "Excellent")

    def test_recalculate_persists_trust_score(self):
        recalculate_farmer_trust_score(self.farmer)
        ts = TrustScore.objects.get(farmer=self.farmer)
        self.assertGreaterEqual(ts.total_score, 0)
        self.assertLessEqual(ts.total_score, 100)

    def test_simulate_api(self):
        from rest_framework.test import APIClient

        client = APIClient()
        client.force_authenticate(user=self.user)
        resp = client.post(
            "/api/trust-scores/simulate/",
            {
                "verification_score": 20,
                "transaction_score": 25,
                "buyer_rating_score": 15,
                "government_score": 10,
                "complaint_score": 12,
            },
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["simulated"]["total_score"], 82)
        self.assertEqual(resp.data["simulated"]["category"], "Good")


class LoanEligibilityFlowTestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="loanflow@test.com",
            username="loanflow",
            password="SecurePass123!",
            role="farmer",
        )
        self.farmer = Farmer.objects.create(
            user=self.user,
            aadhaar_number="333333333333",
            village="LoanVille",
            address="Test",
            verification_status=True,
        )
        TrustScore.objects.update_or_create(
            farmer=self.farmer,
            defaults={
                "verification_score": 20,
                "transaction_score": 20,
                "buyer_rating_score": 15,
                "government_score": 10,
                "complaint_score": 15,
                "total_score": 80,
                "category": "Good",
            },
        )
        LandRecord.objects.create(
            farmer=self.farmer,
            survey_number="LN-001",
            total_area=Decimal("5.0"),
            soil_type="alluvial",
            irrigation_type="canal",
            location="LoanVille",
        )
        self.client.force_authenticate(user=self.user)

    def test_calculate_loan_service(self):
        prediction = calculate_loan_eligibility(self.farmer)
        self.assertGreater(prediction.eligible_amount, Decimal("0"))
        self.assertIn(prediction.risk_category, ["low", "medium", "high"])

    def test_calculate_loan_api(self):
        resp = self.client.post("/api/loans/calculate/", {}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertIn("eligible_amount", resp.data)
        self.assertIn("risk_category", resp.data)

    def test_list_loan_predictions(self):
        calculate_loan_eligibility(self.farmer)
        resp = self.client.get("/api/loans/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(resp.data["results"]), 1)


class APIRoutesSmokeTestCase(APITestCase):
    """Verify key API routes respond correctly for authenticated farmer."""

    def setUp(self):
        self.user = User.objects.create_user(
            email="routes@test.com",
            username="routes",
            password="SecurePass123!",
            role="farmer",
        )
        self.farmer = Farmer.objects.create(
            user=self.user,
            aadhaar_number="444444444444",
            village="RouteVille",
            address="Test",
        )
        CropRecord.objects.create(
            farmer=self.farmer,
            crop_name="Wheat",
            season="rabi",
            area_used=Decimal("2"),
            yield_amount=Decimal("100"),
            harvest_date="2025-01-15",
        )
        self.client.force_authenticate(user=self.user)

    def test_core_list_endpoints(self):
        routes = [
            "/api/farmers/",
            "/api/lands/",
            "/api/crops/",
            "/api/listings/",
            "/api/transactions/",
            "/api/schemes/",
            "/api/applications/",
            "/api/complaints/",
            "/api/trust-scores/",
            "/api/loans/",
            "/api/notifications/",
        ]
        for route in routes:
            resp = self.client.get(route)
            self.assertEqual(
                resp.status_code,
                status.HTTP_200_OK,
                f"GET {route} failed with {resp.status_code}",
            )

    def test_insights_endpoints(self):
        routes = [
            "/api/farmers/me/profile-status/",
            "/api/farmers/me/badges/",
            "/api/farmers/me/achievements/",
            "/api/farmers/me/timeline/",
            "/api/farmers/me/health-card/",
            "/api/farmers/me/insights/",
            "/api/schemes/recommended/",
        ]
        for route in routes:
            resp = self.client.get(route)
            self.assertEqual(resp.status_code, status.HTTP_200_OK, route)

    def test_schema_and_docs_urls_resolve(self):
        from django.urls import resolve

        self.assertEqual(resolve("/api/schema/").url_name, "schema")
        self.assertEqual(resolve("/api/docs/").url_name, "swagger-ui")
        self.assertEqual(resolve("/api/redoc/").url_name, "redoc")

    def test_ai_chat_fallback_without_key(self):
        resp = self.client.post(
            "/api/ai/chat/",
            {"message": "How to improve trust score?", "context_type": "trust_score"},
            format="json",
        )
        self.assertIn(resp.status_code, [status.HTTP_200_OK, status.HTTP_503_SERVICE_UNAVAILABLE])
