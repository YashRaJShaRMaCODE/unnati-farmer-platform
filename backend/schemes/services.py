from rest_framework.exceptions import ValidationError

from django.db.models import Sum

from crops.models import CropRecord
from lands.models import LandRecord
from schemes.models import GovernmentScheme, SchemeApplication
from trustscore.models import TrustScore


def validate_unique_application(farmer, scheme):
    if SchemeApplication.objects.filter(farmer=farmer, scheme=scheme).exists():
        raise ValidationError({"scheme": "You have already applied to this scheme."})


def recommend_schemes_for_farmer(farmer):
    land_area = float(
        LandRecord.objects.filter(farmer=farmer).aggregate(total=Sum("total_area"))["total"]
        or 0
    )
    crops = list(
        CropRecord.objects.filter(farmer=farmer).values_list("crop_name", flat=True)
    )
    trust = TrustScore.objects.filter(farmer=farmer).first()
    trust_score = trust.total_score if trust else 0

    applied_ids = SchemeApplication.objects.filter(farmer=farmer).values_list(
        "scheme_id", flat=True
    )
    schemes = GovernmentScheme.objects.filter(is_active=True).exclude(
        id__in=applied_ids
    )

    recommendations = []
    for scheme in schemes:
        match_score = 0
        reasons = []

        if land_area >= 5:
            match_score += 35
            reasons.append("Large land holding eligible for higher benefits")
        elif land_area >= 2:
            match_score += 25
            reasons.append("Land size meets minimum eligibility")
        elif land_area >= 0.5:
            match_score += 15
            reasons.append("Small holding schemes available")

        if trust_score >= 85:
            match_score += 30
            reasons.append("Excellent trust score — priority eligibility")
        elif trust_score >= 70:
            match_score += 20
            reasons.append("Good trust score supports application")
        elif trust_score >= 50:
            match_score += 10
            reasons.append("Average trust — complete profile to improve")

        for crop in crops:
            crop_lower = crop.lower()
            if crop_lower in scheme.name.lower() or crop_lower in scheme.description.lower():
                match_score += 35
                reasons.append(f"Matches your crop: {crop}")
                break

        if float(scheme.benefit_amount) >= 50000 and land_area >= 2:
            match_score += 10
            reasons.append("High benefit scheme for your profile")

        if match_score >= 25:
            recommendations.append(
                {
                    "scheme_id": scheme.id,
                    "name": scheme.name,
                    "description": scheme.description[:200],
                    "benefit_amount": float(scheme.benefit_amount),
                    "match_score": min(match_score, 100),
                    "reasons": reasons,
                }
            )

    recommendations.sort(key=lambda x: x["match_score"], reverse=True)
    return recommendations[:8]
