from django.db.models import Avg, Count, Q, Sum
from django.utils import timezone

from complaints.models import Complaint
from crops.models import CropRecord
from farmers.models import Buyer, Farmer
from lands.models import LandRecord
from loans.models import LoanPrediction
from marketplace.models import Listing, Transaction
from notifications.models import Notification
from schemes.models import GovernmentScheme, SchemeApplication
from trustscore.models import TrustScore
from users.models import User


def get_admin_dashboard():
    return {
        "total_users": User.objects.count(),
        "users_by_role": dict(
            User.objects.values("role").annotate(count=Count("id")).values_list(
                "role", "count"
            )
        ),
        "total_farmers": Farmer.objects.count(),
        "verified_farmers": Farmer.objects.filter(verification_status=True).count(),
        "total_buyers": Buyer.objects.count(),
        "total_land_records": LandRecord.objects.count(),
        "total_crops": CropRecord.objects.count(),
        "active_listings": Listing.objects.filter(status="active").count(),
        "total_transactions": Transaction.objects.count(),
        "completed_transactions": Transaction.objects.filter(
            status="completed"
        ).count(),
        "transaction_volume": float(
            Transaction.objects.filter(status="completed").aggregate(
                total=Sum("total_amount")
            )["total"]
            or 0
        ),
        "active_schemes": GovernmentScheme.objects.filter(is_active=True).count(),
        "scheme_applications": SchemeApplication.objects.count(),
        "pending_complaints": Complaint.objects.exclude(
            status__in=["resolved", "rejected"]
        ).count(),
        "average_trust_score": TrustScore.objects.aggregate(
            avg=Avg("total_score")
        )["avg"]
        or 0,
        "loan_predictions": LoanPrediction.objects.count(),
        "platform_health": min(
            100,
            int(
                (
                    (Farmer.objects.filter(verification_status=True).count() or 0)
                    / max(Farmer.objects.count(), 1)
                    * 25
                )
                + (
                    Transaction.objects.filter(status="completed").count()
                    / max(Transaction.objects.count(), 1)
                    * 25
                )
                + (
                    (TrustScore.objects.aggregate(avg=Avg("total_score"))["avg"] or 0)
                    / 100
                    * 25
                )
                + (
                    Complaint.objects.filter(status="resolved").count()
                    / max(Complaint.objects.count(), 1)
                    * 25
                )
            ),
        ),
    }


def get_buyer_dashboard(buyer):
    transactions = (
        Transaction.objects.filter(buyer=buyer)
        .select_related("listing__crop", "listing__farmer__user")
        .order_by("-transaction_date")[:8]
    )
    active_listings = (
        Listing.objects.filter(status="active")
        .select_related("crop", "farmer__user")
        .order_by("-created_at")[:6]
    )

    farmer_ids = (
        Transaction.objects.filter(buyer=buyer, status="completed")
        .values_list("listing__farmer_id", flat=True)
        .distinct()
    )
    trusted_farmers = (
        Farmer.objects.filter(id__in=farmer_ids)
        .select_related("user")
        .prefetch_related("trust_score")
        .order_by("-trust_score__total_score")[:5]
    )

    return {
        "active_listings_count": Listing.objects.filter(status="active").count(),
        "total_purchases": Transaction.objects.filter(buyer=buyer).count(),
        "completed_purchases": Transaction.objects.filter(
            buyer=buyer, status="completed"
        ).count(),
        "total_spent": float(
            Transaction.objects.filter(buyer=buyer, status="completed").aggregate(
                total=Sum("total_amount")
            )["total"]
            or 0
        ),
        "notifications_unread": Notification.objects.filter(
            user=buyer.user, is_read=False
        ).count(),
        "featured_listings": [
            {
                "id": l.id,
                "crop": l.crop.crop_name,
                "farmer": l.farmer.user.email,
                "quantity": float(l.quantity),
                "price_per_unit": float(l.price_per_unit),
                "status": l.status,
            }
            for l in active_listings
        ],
        "purchase_history": [
            {
                "id": t.id,
                "crop": t.listing.crop.crop_name,
                "farmer": t.listing.farmer.user.email,
                "amount": float(t.total_amount),
                "status": t.status,
                "date": t.transaction_date.isoformat(),
            }
            for t in transactions
        ],
        "trusted_farmers": [
            {
                "id": f.id,
                "email": f.user.email,
                "name": f"{f.user.first_name} {f.user.last_name}".strip() or f.user.email,
                "trust_score": getattr(
                    getattr(f, "trust_score", None), "total_score", 0
                ),
                "category": getattr(
                    getattr(f, "trust_score", None), "category", "Average"
                ),
            }
            for f in trusted_farmers
        ],
    }


def get_farmer_dashboard(farmer):
    trust = TrustScore.objects.filter(farmer=farmer).first()
    latest_loan = LoanPrediction.objects.filter(farmer=farmer).first()
    land_summary = LandRecord.objects.filter(farmer=farmer).aggregate(
        total_area=Sum("total_area"),
        count=Count("id"),
    )
    crop_summary = CropRecord.objects.filter(farmer=farmer).aggregate(
        count=Count("id"),
        total_yield=Sum("yield_amount"),
    )
    transactions = Transaction.objects.filter(
        listing__farmer=farmer
    ).select_related("listing__crop", "buyer__user").order_by("-transaction_date")[:5]

    return {
        "trust_score": {
            "total_score": trust.total_score if trust else 0,
            "category": trust.category if trust else "Average",
            "breakdown": {
                "verification_score": trust.verification_score if trust else 0,
                "transaction_score": trust.transaction_score if trust else 0,
                "buyer_rating_score": trust.buyer_rating_score if trust else 0,
                "government_score": trust.government_score if trust else 0,
                "complaint_score": trust.complaint_score if trust else 0,
            },
        },
        "loan_eligibility": {
            "eligible_amount": float(latest_loan.eligible_amount) if latest_loan else 0,
            "risk_category": latest_loan.risk_category if latest_loan else "high",
            "recommendation": latest_loan.recommendation if latest_loan else "",
        },
        "land_summary": {
            "total_records": land_summary["count"] or 0,
            "total_area": float(land_summary["total_area"] or 0),
        },
        "crop_summary": {
            "total_crops": crop_summary["count"] or 0,
            "total_yield": float(crop_summary["total_yield"] or 0),
        },
        "notifications_unread": Notification.objects.filter(
            user=farmer.user, is_read=False
        ).count(),
        "recent_transactions": [
            {
                "id": t.id,
                "crop": t.listing.crop.crop_name,
                "buyer": t.buyer.user.email,
                "amount": float(t.total_amount),
                "status": t.status,
                "date": t.transaction_date.isoformat(),
            }
            for t in transactions
        ],
        "active_listings": Listing.objects.filter(
            farmer=farmer, status="active"
        ).count(),
        "scheme_applications": SchemeApplication.objects.filter(farmer=farmer).count(),
        "open_complaints": Complaint.objects.filter(farmer=farmer).exclude(
            status__in=["resolved", "rejected"]
        ).count(),
        "scheme_recommendations": [
            {
                "id": s.id,
                "name": s.name,
                "benefit_amount": float(s.benefit_amount),
                "description": s.description[:120],
            }
            for s in GovernmentScheme.objects.filter(is_active=True)
            .exclude(
                id__in=SchemeApplication.objects.filter(farmer=farmer).values_list(
                    "scheme_id", flat=True
                )
            )
            .order_by("-benefit_amount")[:5]
        ],
    }


def get_government_dashboard():
    return {
        "active_schemes": GovernmentScheme.objects.filter(is_active=True).count(),
        "total_applications": SchemeApplication.objects.count(),
        "applications_by_status": dict(
            SchemeApplication.objects.values("status")
            .annotate(count=Count("id"))
            .values_list("status", "count")
        ),
        "pending_applications": SchemeApplication.objects.filter(
            status__in=["submitted", "under_review"]
        ).count(),
        "total_complaints": Complaint.objects.count(),
        "complaints_by_status": dict(
            Complaint.objects.values("status")
            .annotate(count=Count("id"))
            .values_list("status", "count")
        ),
        "pending_complaints": Complaint.objects.filter(
            status__in=["submitted", "under_review", "investigation"]
        ).count(),
        "verified_farmers": Farmer.objects.filter(verification_status=True).count(),
        "total_farmers": Farmer.objects.count(),
    }


def get_bank_dashboard():
    return {
        "total_farmers": Farmer.objects.count(),
        "verified_farmers": Farmer.objects.filter(verification_status=True).count(),
        "trust_score_distribution": dict(
            TrustScore.objects.values("category")
            .annotate(count=Count("id"))
            .values_list("category", "count")
        ),
        "average_trust_score": TrustScore.objects.aggregate(
            avg=Avg("total_score")
        )["avg"]
        or 0,
        "high_risk_farmers": TrustScore.objects.filter(
            category="High Risk"
        ).count(),
        "excellent_farmers": TrustScore.objects.filter(category="Excellent").count(),
        "loan_predictions": LoanPrediction.objects.count(),
        "low_risk_loans": LoanPrediction.objects.filter(risk_category="low").count(),
        "medium_risk_loans": LoanPrediction.objects.filter(
            risk_category="medium"
        ).count(),
        "high_risk_loans": LoanPrediction.objects.filter(risk_category="high").count(),
        "total_transaction_volume": float(
            Transaction.objects.filter(status="completed").aggregate(
                total=Sum("total_amount")
            )["total"]
            or 0
        ),
    }


def get_village_analytics(village=None):
    base_qs = Farmer.objects.exclude(village="")
    if village:
        base_qs = base_qs.filter(village__iexact=village)

    village_stats = []
    for row in (
        base_qs.values("village")
        .annotate(
            total_farmers=Count("id"),
            avg_trust=Avg("trust_score__total_score"),
            verified_farmers=Count("id", filter=Q(verification_status=True)),
        )
        .order_by("-avg_trust")
    ):
        vname = row["village"]
        farmers_in_v = Farmer.objects.filter(village=vname)
        farmer_ids = farmers_in_v.values_list("id", flat=True)

        total_loans = LoanPrediction.objects.filter(farmer_id__in=farmer_ids).count()
        total_schemes = SchemeApplication.objects.filter(
            farmer_id__in=farmer_ids
        ).count()
        total_complaints = Complaint.objects.filter(farmer_id__in=farmer_ids).count()

        village_stats.append(
            {
                "village": vname,
                "total_farmers": row["total_farmers"],
                "average_trust_score": round(row["avg_trust"] or 0, 1),
                "verified_farmers": row["verified_farmers"],
                "total_loans": total_loans,
                "total_schemes": total_schemes,
                "complaint_count": total_complaints,
            }
        )

    top_village = (
        max(village_stats, key=lambda x: x["average_trust_score"])
        if village_stats
        else None
    )

    return {
        "villages": village_stats,
        "total_villages": len(village_stats),
        "top_performing_village": top_village,
        "summary": {
            "total_farmers": sum(v["total_farmers"] for v in village_stats),
            "average_trust_score": round(
                sum(v["average_trust_score"] for v in village_stats)
                / max(len(village_stats), 1),
                1,
            ),
            "total_loans": sum(v["total_loans"] for v in village_stats),
            "total_schemes": sum(v["total_schemes"] for v in village_stats),
            "total_complaints": sum(v["complaint_count"] for v in village_stats),
        },
    }
