from django.db import models

from farmers.models import Farmer


class LoanPrediction(models.Model):

    RISK_CHOICES = [
        ("low", "Low Risk"),
        ("medium", "Medium Risk"),
        ("high", "High Risk"),
    ]

    farmer = models.ForeignKey(
        Farmer,
        on_delete=models.CASCADE,
        related_name="loan_predictions",
    )

    trust_score = models.IntegerField()

    land_size = models.DecimalField(max_digits=10, decimal_places=2)

    revenue = models.DecimalField(max_digits=12, decimal_places=2)

    transaction_count = models.PositiveIntegerField(default=0)

    eligible_amount = models.DecimalField(max_digits=12, decimal_places=2)

    risk_category = models.CharField(max_length=20, choices=RISK_CHOICES)

    recommendation = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.farmer.user.email} - {self.eligible_amount}"
