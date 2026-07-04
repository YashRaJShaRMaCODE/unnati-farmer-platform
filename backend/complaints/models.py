from django.db import models
from farmers.models import Farmer


class Complaint(models.Model):

    STATUS_CHOICES = [
        ("submitted", "Submitted"),
        ("under_review", "Under Review"),
        ("investigation", "Investigation"),
        ("resolved", "Resolved"),
        ("rejected", "Rejected"),
    ]

    farmer = models.ForeignKey(
        Farmer,
        on_delete=models.CASCADE,
        related_name="complaints"
    )

    title = models.CharField(
        max_length=255
    )

    description = models.TextField()

    evidence = models.FileField(
        upload_to="complaints/",
        blank=True,
        null=True
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="submitted"
    )

    resolution_notes = models.TextField(
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return self.title