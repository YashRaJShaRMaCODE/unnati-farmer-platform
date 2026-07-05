"""Helpers for bulk demo data operations without triggering side effects."""

from contextlib import contextmanager
from decimal import Decimal

from django.db.models import Sum
from django.db.models.signals import post_save

from complaints.models import Complaint
from farmers.models import Farmer
from lands.models import LandRecord
from loans.models import LoanPrediction
from marketplace.models import Transaction
from schemes.models import SchemeApplication
from trustscore.models import TrustScore
from trustscore.services import (
    calculate_buyer_rating_score,
    calculate_complaint_score,
    calculate_government_score,
    calculate_transaction_score,
    calculate_trust_score,
    calculate_verification_score,
)


@contextmanager
def suppress_trust_signals():
    """Disconnect trust-score recalculation signals during bulk seeding."""
    from trustscore.signals import (
        handle_farmer_save,
        update_trust_on_complaint,
        update_trust_on_scheme_application,
        update_trust_on_transaction,
    )

    post_save.disconnect(handle_farmer_save, sender=Farmer)
    post_save.disconnect(update_trust_on_transaction, sender=Transaction)
    post_save.disconnect(update_trust_on_scheme_application, sender=SchemeApplication)
    post_save.disconnect(update_trust_on_complaint, sender=Complaint)
    try:
        yield
    finally:
        post_save.connect(handle_farmer_save, sender=Farmer)
        post_save.connect(update_trust_on_transaction, sender=Transaction)
        post_save.connect(update_trust_on_scheme_application, sender=SchemeApplication)
        post_save.connect(update_trust_on_complaint, sender=Complaint)


def recalculate_trust_score_silent(farmer):
    """Update trust score without sending notifications."""
    scores = calculate_trust_score(
        calculate_verification_score(farmer),
        calculate_transaction_score(farmer),
        calculate_buyer_rating_score(farmer),
        calculate_government_score(farmer),
        calculate_complaint_score(farmer),
    )
    trust_score, _ = TrustScore.objects.update_or_create(
        farmer=farmer,
        defaults=scores,
    )
    return trust_score


def create_loan_prediction_silent(farmer):
    """Create a loan prediction record without sending notifications."""
    trust_score_obj, _ = TrustScore.objects.get_or_create(farmer=farmer)
    trust_score = trust_score_obj.total_score

    land_size = (
        LandRecord.objects.filter(farmer=farmer).aggregate(total=Sum("total_area"))["total"]
        or Decimal("0")
    )

    completed_txns = Transaction.objects.filter(
        listing__farmer=farmer,
        status="completed",
    )
    transaction_count = completed_txns.count()
    revenue = completed_txns.aggregate(total=Sum("total_amount"))["total"] or Decimal("0")

    base_amount = Decimal("50000")
    trust_multiplier = Decimal(str(trust_score)) / Decimal("100")
    land_multiplier = min(land_size / Decimal("5"), Decimal("3"))
    revenue_multiplier = min(revenue / Decimal("100000"), Decimal("5"))
    txn_multiplier = min(Decimal(str(transaction_count)) / Decimal("5"), Decimal("2"))

    eligible_amount = base_amount * (
        Decimal("1") + trust_multiplier + land_multiplier + revenue_multiplier + txn_multiplier
    )
    eligible_amount = eligible_amount.quantize(Decimal("0.01"))

    if trust_score >= 85 and transaction_count >= 5:
        risk_category = "low"
        recommendation = (
            "Excellent credit profile. Eligible for priority loan processing "
            "with favorable interest rates."
        )
    elif trust_score >= 70:
        risk_category = "medium"
        recommendation = (
            "Good credit profile. Standard loan terms recommended with "
            "collateral verification."
        )
    else:
        risk_category = "high"
        recommendation = (
            "Higher risk profile. Consider micro-finance options, "
            "cooperative loans, or improving trust score before applying."
        )

    return LoanPrediction.objects.create(
        farmer=farmer,
        trust_score=trust_score,
        land_size=land_size,
        revenue=revenue,
        transaction_count=transaction_count,
        eligible_amount=eligible_amount,
        risk_category=risk_category,
        recommendation=recommendation,
    )
