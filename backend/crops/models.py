from django.db import models

# Create your models here.
from django.db import models
from farmers.models import Farmer


class CropRecord(models.Model):

    SEASON_CHOICES = [
        ("kharif", "Kharif"),
        ("rabi", "Rabi"),
        ("zaid", "Zaid"),
    ]

    farmer = models.ForeignKey(
        Farmer,
        on_delete=models.CASCADE,
        related_name="crops"
    )

    crop_name = models.CharField(
        max_length=100
    )

    season = models.CharField(
        max_length=20,
        choices=SEASON_CHOICES
    )

    area_used = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    yield_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    harvest_date = models.DateField()

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.crop_name} - {self.farmer.user.email}"