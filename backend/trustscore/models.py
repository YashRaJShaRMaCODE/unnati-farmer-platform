from django.db import models
from farmers.models import Farmer


class TrustScore(models.Model):

    farmer = models.OneToOneField(
        Farmer,
        on_delete=models.CASCADE,
        related_name="trust_score"
    )

    verification_score = models.IntegerField(default=0)

    transaction_score = models.IntegerField(default=0)

    buyer_rating_score = models.IntegerField(default=0)

    government_score = models.IntegerField(default=0)

    complaint_score = models.IntegerField(default=0)

    total_score = models.IntegerField(default=0)

    category = models.CharField(
        max_length=20,
        default="Average"
    )

    calculated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return f"{self.farmer.user.email} - {self.total_score}"