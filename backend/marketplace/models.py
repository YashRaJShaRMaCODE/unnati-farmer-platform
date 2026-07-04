from django.db import models

# Create your models here.
from django.db import models
from farmers.models import Farmer
from crops.models import CropRecord
from farmers.models import Buyer


class Listing(models.Model):

    STATUS_CHOICES = [
        ("active", "Active"),
        ("sold", "Sold"),
        ("closed", "Closed"),
    ]

    farmer = models.ForeignKey(
        Farmer,
        on_delete=models.CASCADE,
        related_name="listings"
    )

    crop = models.ForeignKey(
        CropRecord,
        on_delete=models.CASCADE,
        related_name="listings"
    )

    quantity = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    price_per_unit = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    description = models.TextField(
        blank=True
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="active"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.crop.crop_name} - {self.farmer.user.email}"

class Transaction(models.Model):

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    ]

    listing = models.ForeignKey(
        Listing,
        on_delete=models.CASCADE,
        related_name="transactions"
    )

    buyer = models.ForeignKey(
        Buyer,
        on_delete=models.CASCADE,
        related_name="transactions"
    )

    quantity = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    total_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending"
    )

    transaction_date = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.listing.crop.crop_name} - {self.total_amount}"