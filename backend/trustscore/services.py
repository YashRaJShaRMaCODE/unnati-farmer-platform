from decimal import Decimal

from django.db.models import Avg, Count, Sum

from complaints.models import Complaint
from marketplace.models import Transaction
from schemes.models import SchemeApplication
from trustscore.models import TrustScore


VERIFICATION_MAX = 20
TRANSACTION_MAX = 30
BUYER_RATING_MAX = 20
GOVERNMENT_MAX = 15
COMPLAINT_MAX = 15


def calculate_verification_score(farmer):
    score = 0
    if farmer.verification_status:
        score += 10
    if farmer.user.is_verified:
        score += 5
    if farmer.aadhaar_number and len(farmer.aadhaar_number) == 12:
        score += 5
    return min(score, VERIFICATION_MAX)


def calculate_transaction_score(farmer):
    completed = Transaction.objects.filter(
        listing__farmer=farmer,
        status="completed",
    ).count()
    if completed == 0:
        return 0
    if completed >= 10:
        return TRANSACTION_MAX
    if completed >= 5:
        return 20
    if completed >= 2:
        return 12
    return 6


def calculate_buyer_rating_score(farmer):
    completed_txns = Transaction.objects.filter(
        listing__farmer=farmer,
        status="completed",
    )
    count = completed_txns.count()
    if count == 0:
        return 0
    total_revenue = completed_txns.aggregate(total=Sum("total_amount"))["total"] or Decimal("0")
    if total_revenue >= Decimal("500000"):
        return BUYER_RATING_MAX
    if total_revenue >= Decimal("200000"):
        return 15
    if total_revenue >= Decimal("50000"):
        return 10
    return 5


def calculate_government_score(farmer):
    applications = SchemeApplication.objects.filter(farmer=farmer)
    if not applications.exists():
        return 0
    approved = applications.filter(status="approved").count()
    total = applications.count()
    ratio = approved / total if total else 0
    if ratio >= 0.75:
        return GOVERNMENT_MAX
    if ratio >= 0.5:
        return 10
    if ratio >= 0.25:
        return 6
    return 3


def calculate_complaint_score(farmer):
    complaints = Complaint.objects.filter(farmer=farmer)
    if not complaints.exists():
        return COMPLAINT_MAX
    resolved = complaints.filter(status="resolved").count()
    rejected = complaints.filter(status="rejected").count()
    pending = complaints.exclude(status__in=["resolved", "rejected"]).count()
    total = complaints.count()

    if rejected > 0:
        return max(0, COMPLAINT_MAX - (rejected * 5))
    if pending == 0 and resolved == total:
        return COMPLAINT_MAX
    if pending <= 2:
        return 10
    return 5


def calculate_trust_score(
    verification_score,
    transaction_score,
    buyer_rating_score,
    government_score,
    complaint_score,
):
    total = (
        verification_score
        + transaction_score
        + buyer_rating_score
        + government_score
        + complaint_score
    )

    if total >= 85:
        category = "Excellent"
    elif total >= 70:
        category = "Good"
    elif total >= 50:
        category = "Average"
    else:
        category = "High Risk"

    return {
        "verification_score": verification_score,
        "transaction_score": transaction_score,
        "buyer_rating_score": buyer_rating_score,
        "government_score": government_score,
        "complaint_score": complaint_score,
        "total_score": total,
        "category": category,
    }


def recalculate_farmer_trust_score(farmer):
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

    from notifications.services import create_notification

    create_notification(
        user=farmer.user,
        title="Trust Score Updated",
        message=f"Your trust score is now {trust_score.total_score} ({trust_score.category}).",
        notification_type="trust_score",
        link="/trust-score",
    )

    return trust_score
