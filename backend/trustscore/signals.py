from django.db.models.signals import post_save
from django.dispatch import receiver

from complaints.models import Complaint
from farmers.models import Farmer
from marketplace.models import Transaction
from schemes.models import SchemeApplication
from trustscore.models import TrustScore

from .services import recalculate_farmer_trust_score


@receiver(post_save, sender=Farmer)
def handle_farmer_save(sender, instance, created, **kwargs):
    if created:
        TrustScore.objects.get_or_create(farmer=instance)
    recalculate_farmer_trust_score(instance)


@receiver(post_save, sender=Transaction)
def update_trust_on_transaction(sender, instance, **kwargs):
    if instance.status == "completed":
        recalculate_farmer_trust_score(instance.listing.farmer)


@receiver(post_save, sender=SchemeApplication)
def update_trust_on_scheme_application(sender, instance, **kwargs):
    recalculate_farmer_trust_score(instance.farmer)


@receiver(post_save, sender=Complaint)
def update_trust_on_complaint(sender, instance, **kwargs):
    recalculate_farmer_trust_score(instance.farmer)
