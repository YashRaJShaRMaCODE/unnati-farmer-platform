from decimal import Decimal

from django.db.models import Sum

from lands.models import LandRecord
from loans.models import LoanPrediction
from marketplace.models import Transaction
from trustscore.models import TrustScore


def calculate_loan_eligibility(farmer):
    trust_score_obj, _ = TrustScore.objects.get_or_create(farmer=farmer)
    trust_score = trust_score_obj.total_score

    land_size = (
        LandRecord.objects.filter(farmer=farmer).aggregate(
            total=Sum("total_area")
        )["total"]
        or Decimal("0")
    )

    completed_txns = Transaction.objects.filter(
        listing__farmer=farmer,
        status="completed",
    )
    transaction_count = completed_txns.count()
    revenue = completed_txns.aggregate(total=Sum("total_amount"))["total"] or Decimal(
        "0"
    )

    base_amount = Decimal("50000")
    trust_multiplier = Decimal(str(trust_score)) / Decimal("100")
    land_multiplier = min(land_size / Decimal("5"), Decimal("3"))
    revenue_multiplier = min(revenue / Decimal("100000"), Decimal("5"))
    txn_multiplier = min(Decimal(str(transaction_count)) / Decimal("5"), Decimal("2"))

    eligible_amount = base_amount * (
        Decimal("1")
        + trust_multiplier
        + land_multiplier
        + revenue_multiplier
        + txn_multiplier
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

    prediction = LoanPrediction.objects.create(
        farmer=farmer,
        trust_score=trust_score,
        land_size=land_size,
        revenue=revenue,
        transaction_count=transaction_count,
        eligible_amount=eligible_amount,
        risk_category=risk_category,
        recommendation=recommendation,
    )

    from notifications.services import create_notification

    create_notification(
        user=farmer.user,
        title="Loan Eligibility Calculated",
        message=f"Eligible amount: ₹{eligible_amount:,.2f} ({risk_category} risk).",
        notification_type="loan",
        link="/loan-eligibility",
    )

    return prediction
