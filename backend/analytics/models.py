from django.db import models


class DashboardSnapshot(models.Model):

    ROLE_CHOICES = [
        ("farmer", "Farmer"),
        ("buyer", "Buyer"),
        ("government", "Government"),
        ("bank", "Bank"),
        ("admin", "Admin"),
    ]

    role = models.CharField(max_length=20, choices=ROLE_CHOICES)

    data = models.JSONField(default=dict)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return f"{self.role} snapshot - {self.updated_at}"
