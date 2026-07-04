from decimal import Decimal

from django.db.models import Count, Sum

from complaints.models import Complaint
from crops.models import CropRecord
from lands.models import LandRecord
from loans.models import LoanPrediction
from marketplace.models import Listing, Transaction
from schemes.models import GovernmentScheme, SchemeApplication
from trustscore.models import TrustScore
from trustscore.services import calculate_trust_score, recalculate_farmer_trust_score


def get_profile_completion(farmer):
    """Progressive onboarding: 20% per milestone up to 100%."""
    milestones = []
    percent = 0

    user = farmer.user
    if user.first_name and farmer.village and user.phone_number:
        percent += 20
        milestones.append({"key": "basic", "label": "Basic Info", "done": True})
    else:
        milestones.append({"key": "basic", "label": "Basic Info", "done": False})

    if farmer.aadhaar_number and len(farmer.aadhaar_number) == 12:
        percent += 20
        milestones.append({"key": "aadhaar", "label": "Aadhaar Verified", "done": True})
    else:
        milestones.append({"key": "aadhaar", "label": "Aadhaar Verified", "done": False})

    land_count = LandRecord.objects.filter(farmer=farmer).count()
    if land_count > 0:
        percent += 20
        milestones.append({"key": "land", "label": "Land Record", "done": True})
    else:
        milestones.append({"key": "land", "label": "Land Record", "done": False})

    crop_count = CropRecord.objects.filter(farmer=farmer).count()
    if crop_count > 0:
        percent += 20
        milestones.append({"key": "crop", "label": "Crop Record", "done": True})
    else:
        milestones.append({"key": "crop", "label": "Crop Record", "done": False})

    has_document = LandRecord.objects.filter(
        farmer=farmer, ownership_document__isnull=False
    ).exclude(ownership_document="").exists()
    if farmer.verification_status or has_document or farmer.profile_image:
        percent += 20
        milestones.append({"key": "documents", "label": "Documents & Verification", "done": True})
    else:
        milestones.append({"key": "documents", "label": "Documents & Verification", "done": False})

    reward_badges = []
    if percent >= 20:
        reward_badges.append("Getting Started")
    if percent >= 40:
        reward_badges.append("Profile Builder")
    if percent >= 60:
        reward_badges.append("Farm Ready")
    if percent >= 80:
        reward_badges.append("Almost Complete")
    if percent >= 100:
        reward_badges.append("Profile Champion")

    return {
        "percent": percent,
        "milestones": milestones,
        "reward_badges": reward_badges,
        "next_step": _next_onboarding_step(milestones),
    }


def _next_onboarding_step(milestones):
    for m in milestones:
        if not m["done"]:
            return m["label"]
    return "Profile complete!"


def get_farmer_badges(farmer):
    badges = []
    trust = TrustScore.objects.filter(farmer=farmer).first()

    if farmer.verification_status:
        badges.append(
            {"id": "verified_farmer", "label": "Verified Farmer", "icon": "shield", "tier": "gold"}
        )

    completed_txns = Transaction.objects.filter(
        listing__farmer=farmer, status="completed"
    ).count()
    if completed_txns >= 5:
        badges.append(
            {"id": "trusted_seller", "label": "Trusted Seller", "icon": "star", "tier": "gold"}
        )
    elif completed_txns >= 1:
        badges.append(
            {"id": "active_seller", "label": "Active Seller", "icon": "star", "tier": "silver"}
        )

    approved_schemes = SchemeApplication.objects.filter(
        farmer=farmer, status="approved"
    ).count()
    if approved_schemes >= 2:
        badges.append(
            {"id": "scheme_champion", "label": "Scheme Champion", "icon": "award", "tier": "gold"}
        )
    elif approved_schemes >= 1:
        badges.append(
            {"id": "scheme_participant", "label": "Scheme Participant", "icon": "award", "tier": "silver"}
        )

    if trust:
        if trust.total_score >= 85:
            badges.append(
                {"id": "excellent_trust", "label": "Excellent Trust Score", "icon": "trophy", "tier": "gold"}
            )
            badges.append(
                {"id": "gold_farmer", "label": "Gold Farmer", "icon": "medal", "tier": "gold"}
            )
        elif trust.total_score >= 70:
            badges.append(
                {"id": "silver_farmer", "label": "Silver Farmer", "icon": "medal", "tier": "silver"}
            )
        elif trust.total_score >= 50:
            badges.append(
                {"id": "bronze_farmer", "label": "Bronze Farmer", "icon": "medal", "tier": "bronze"}
            )

    top_seller = (
        Transaction.objects.filter(status="completed")
        .values("listing__farmer")
        .annotate(cnt=Count("id"))
        .order_by("-cnt")
        .first()
    )
    if top_seller and top_seller["listing__farmer"] == farmer.id and completed_txns >= 3:
        badges.append(
            {"id": "top_seller", "label": "Top Seller", "icon": "crown", "tier": "gold"}
        )

    return badges


def get_farmer_achievements(farmer):
    achievements = []
    checks = [
        (
            "first_land",
            "First Land Added",
            LandRecord.objects.filter(farmer=farmer).exists(),
        ),
        (
            "first_crop",
            "First Crop Added",
            CropRecord.objects.filter(farmer=farmer).exists(),
        ),
        (
            "first_listing",
            "First Marketplace Listing",
            Listing.objects.filter(farmer=farmer).exists(),
        ),
        (
            "trust_80",
            "Trust Score Above 80",
            TrustScore.objects.filter(farmer=farmer, total_score__gte=80).exists(),
        ),
        (
            "first_scheme",
            "First Scheme Application",
            SchemeApplication.objects.filter(farmer=farmer).exists(),
        ),
        (
            "first_sale",
            "First Sale Completed",
            Transaction.objects.filter(
                listing__farmer=farmer, status="completed"
            ).exists(),
        ),
        (
            "loan_eligible",
            "Loan Eligibility Calculated",
            LoanPrediction.objects.filter(farmer=farmer).exists(),
        ),
    ]
    for key, title, unlocked in checks:
        achievements.append({"id": key, "title": title, "unlocked": unlocked})
    return achievements


def get_activity_timeline(farmer):
    events = []

    events.append(
        {
            "type": "account_created",
            "title": "Account Created",
            "date": farmer.created_at.isoformat(),
            "icon": "user",
        }
    )

    for land in LandRecord.objects.filter(farmer=farmer).order_by("created_at"):
        events.append(
            {
                "type": "land_added",
                "title": f"Land Added: {land.survey_number}",
                "date": land.created_at.isoformat(),
                "icon": "map",
            }
        )

    for crop in CropRecord.objects.filter(farmer=farmer).order_by("created_at"):
        events.append(
            {
                "type": "crop_added",
                "title": f"Crop Added: {crop.crop_name}",
                "date": crop.created_at.isoformat(),
                "icon": "sprout",
            }
        )

    for app in SchemeApplication.objects.filter(farmer=farmer).order_by("applied_at"):
        events.append(
            {
                "type": "scheme_applied",
                "title": f"Scheme Applied: {app.scheme.name}",
                "date": app.applied_at.isoformat(),
                "icon": "leaf",
            }
        )

    for complaint in Complaint.objects.filter(farmer=farmer).order_by("created_at"):
        events.append(
            {
                "type": "complaint_filed",
                "title": f"Complaint Filed: {complaint.title}",
                "date": complaint.created_at.isoformat(),
                "icon": "file",
            }
        )

    for loan in LoanPrediction.objects.filter(farmer=farmer).order_by("created_at"):
        events.append(
            {
                "type": "loan_generated",
                "title": "Loan Eligibility Calculated",
                "date": loan.created_at.isoformat(),
                "icon": "credit-card",
            }
        )

    trust = TrustScore.objects.filter(farmer=farmer).first()
    if trust:
        events.append(
            {
                "type": "trust_updated",
                "title": f"Trust Score Updated: {trust.total_score} ({trust.category})",
                "date": trust.calculated_at.isoformat(),
                "icon": "shield",
            }
        )

    events.sort(key=lambda e: e["date"], reverse=True)
    return events


def get_health_card(farmer):
    trust = TrustScore.objects.filter(farmer=farmer).first()
    latest_loan = LoanPrediction.objects.filter(farmer=farmer).first()
    land_stats = LandRecord.objects.filter(farmer=farmer).aggregate(
        count=Count("id"), total=Sum("total_area")
    )
    crop_count = CropRecord.objects.filter(farmer=farmer).count()
    scheme_count = SchemeApplication.objects.filter(farmer=farmer).count()
    complaint_count = Complaint.objects.filter(farmer=farmer).count()
    revenue = (
        Transaction.objects.filter(
            listing__farmer=farmer, status="completed"
        ).aggregate(total=Sum("total_amount"))["total"]
        or Decimal("0")
    )

    return {
        "farmer_name": f"{farmer.user.first_name} {farmer.user.last_name}".strip()
        or farmer.user.email,
        "village": farmer.village or farmer.address or "Not specified",
        "phone": farmer.user.phone_number,
        "email": farmer.user.email,
        "trust_score": trust.total_score if trust else 0,
        "trust_category": trust.category if trust else "Average",
        "badges": get_farmer_badges(farmer),
        "loan_eligible_amount": float(latest_loan.eligible_amount) if latest_loan else 0,
        "loan_risk": latest_loan.risk_category if latest_loan else "high",
        "land_count": land_stats["count"] or 0,
        "total_land_area": float(land_stats["total"] or 0),
        "crop_count": crop_count,
        "schemes_applied": scheme_count,
        "complaints": complaint_count,
        "revenue": float(revenue),
        "profile_completion": get_profile_completion(farmer)["percent"],
        "generated_at": farmer.updated_at.isoformat(),
    }


def simulate_trust_score(
    verification_score,
    transaction_score,
    buyer_rating_score,
    government_score,
    complaint_score,
):
    return calculate_trust_score(
        verification_score,
        transaction_score,
        buyer_rating_score,
        government_score,
        complaint_score,
    )
