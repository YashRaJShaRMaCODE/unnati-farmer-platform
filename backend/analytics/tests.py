from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from analytics.services import get_admin_dashboard, get_bank_dashboard

User = get_user_model()


class AnalyticsServiceTestCase(APITestCase):
    def test_admin_dashboard(self):
        data = get_admin_dashboard()
        self.assertIn("total_users", data)
        self.assertIn("total_farmers", data)

    def test_bank_dashboard(self):
        data = get_bank_dashboard()
        self.assertIn("average_trust_score", data)
        self.assertIn("loan_predictions", data)
