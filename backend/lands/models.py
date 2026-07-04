from django.db import models

from farmers.models import Farmer


class LandRecord(models.Model):

    SOIL_TYPE_CHOICES = [
        ("alluvial", "Alluvial"),
        ("black", "Black"),
        ("red", "Red"),
        ("laterite", "Laterite"),
        ("sandy", "Sandy"),
        ("clay", "Clay"),
    ]

    IRRIGATION_CHOICES = [
        ("canal", "Canal"),
        ("well", "Well"),
        ("drip", "Drip"),
        ("sprinkler", "Sprinkler"),
        ("rainfed", "Rainfed"),
    ]

    farmer = models.ForeignKey(
        Farmer,
        on_delete=models.CASCADE,
        related_name="land_records",
    )

    survey_number = models.CharField(max_length=100)

    total_area = models.DecimalField(max_digits=10, decimal_places=2)

    soil_type = models.CharField(max_length=20, choices=SOIL_TYPE_CHOICES)

    irrigation_type = models.CharField(max_length=20, choices=IRRIGATION_CHOICES)

    location = models.CharField(max_length=255)

    ownership_document = models.FileField(
        upload_to="lands/",
        blank=True,
        null=True,
    )

    is_verified = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        unique_together = ["farmer", "survey_number"]

    def __str__(self):
        return f"{self.survey_number} - {self.farmer.user.email}"
