from django.db import models
from django.conf import settings


class Farmer(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="farmer_profile"
    )

    aadhaar_number = models.CharField(
        max_length=12,
        unique=True,
        blank=True,
        null=True,
    )

    village = models.CharField(
        max_length=100,
        blank=True,
        default="",
    )

    profile_image = models.ImageField(
        upload_to="farmers/",
        blank=True,
        null=True
    )

    address = models.TextField(
        blank=True,
        default="",
    )

    experience_years = models.PositiveIntegerField(
        default=0
    )

    verification_status = models.BooleanField(
        default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return self.user.email

class Buyer(models.Model):

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="buyer_profile"
    )

    company_name = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )

    phone_number = models.CharField(
        max_length=15,
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.user.email