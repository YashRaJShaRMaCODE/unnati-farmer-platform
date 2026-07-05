import random
from datetime import date, timedelta
from decimal import Decimal
from pathlib import Path

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from complaints.models import Complaint
from crops.models import CropRecord
from farmers.models import Buyer, Farmer
from lands.models import LandRecord
from marketplace.models import Listing, Transaction
from notifications.services import create_notification
from schemes.models import GovernmentScheme, SchemeApplication
from trustscore.models import TrustScore

from config.management.demo_constants import (
    ADMIN_EMAIL,
    BANK_EMAIL,
    BUYER_COMPANIES,
    BUYER_COUNT,
    COMPLAINT_COUNT,
    COMPLAINT_TEMPLATES,
    CROP_COUNT,
    CROP_PROFILES,
    DEMO_EMAIL_DOMAIN,
    DEMO_PASSWORD,
    FARMER_COUNT,
    FARMER_NAMES,
    GOVERNMENT_EMAIL,
    GOVERNMENT_SCHEMES,
    IRRIGATION_TYPES,
    LAND_COUNT,
    LISTING_COUNT,
    LOAN_PREDICTION_COUNT,
    NOTIFICATION_COUNT,
    NOTIFICATION_TEMPLATES,
    SCHEME_APPLICATION_COUNT,
    SCHEME_COUNT,
    SOIL_TYPES,
    TRANSACTION_COUNT,
    VILLAGES,
)
from config.management.demo_helpers import (
    create_loan_prediction_silent,
    recalculate_trust_score_silent,
    suppress_trust_signals,
)

User = get_user_model()
random.seed(42)


class Command(BaseCommand):
    help = "Seed realistic Indian agricultural demo data for UNNATI presentations"

    def add_arguments(self, parser):
        parser.add_argument(
            "--force",
            action="store_true",
            help="Seed even if demo data already exists (may create duplicates)",
        )

    def handle(self, *args, **options):
        if User.objects.filter(email__endswith=DEMO_EMAIL_DOMAIN).exists() and not options["force"]:
            raise CommandError(
                "Demo data already exists. Run `python manage.py clear_demo_data` first, "
                "or use --force to add more records."
            )

        self.stdout.write("Seeding UNNATI demo data...")

        with transaction.atomic():
            with suppress_trust_signals():
                self._create_role_users()
                farmers = self._create_farmers(FARMER_COUNT)
                buyers = self._create_buyers(BUYER_COUNT)
                schemes = self._create_schemes(SCHEME_COUNT)
                lands = self._create_lands(farmers, LAND_COUNT)
                crops = self._create_crops(farmers, lands, CROP_COUNT)
                listings = self._create_listings(farmers, crops, LISTING_COUNT)
                self._create_transactions(listings, buyers, TRANSACTION_COUNT)
                self._create_scheme_applications(farmers, schemes, SCHEME_APPLICATION_COUNT)
                self._create_complaints(farmers, COMPLAINT_COUNT)

            trust_scores = self._recalculate_all_trust_scores(farmers)
            loan_predictions = self._create_loan_predictions(farmers, LOAN_PREDICTION_COUNT)
            notifications = self._create_notifications(
                farmers, buyers, schemes, listings, LOAN_PREDICTION_COUNT
            )

        self._write_demo_users_doc()
        self._print_summary(farmers, buyers, lands, crops, listings, schemes, trust_scores, loan_predictions, notifications)

    def _create_role_users(self):
        role_users = [
            {
                "email": GOVERNMENT_EMAIL,
                "username": "demo_government",
                "first_name": "Anjali",
                "last_name": "Verma",
                "role": "government",
                "phone_number": "9876500001",
                "is_verified": True,
            },
            {
                "email": BANK_EMAIL,
                "username": "demo_bank",
                "first_name": "Rohit",
                "last_name": "Malhotra",
                "role": "bank",
                "phone_number": "9876500002",
                "is_verified": True,
            },
            {
                "email": ADMIN_EMAIL,
                "username": "demo_admin",
                "first_name": "Admin",
                "last_name": "UNNATI",
                "role": "admin",
                "phone_number": "9876500003",
                "is_verified": True,
                "is_staff": True,
                "is_superuser": True,
            },
        ]
        for data in role_users:
            if User.objects.filter(email=data["email"]).exists():
                continue
            extra = {k: data[k] for k in ("is_staff", "is_superuser") if k in data}
            User.objects.create_user(
                email=data["email"],
                username=data["username"],
                password=DEMO_PASSWORD,
                first_name=data["first_name"],
                last_name=data["last_name"],
                phone_number=data["phone_number"],
                role=data["role"],
                is_verified=data.get("is_verified", False),
                **extra,
            )

    def _create_farmers(self, count):
        farmers = []
        for i in range(count):
            first_name, last_name = FARMER_NAMES[i]
            village_info = VILLAGES[i % len(VILLAGES)]
            email = f"farmer{i + 1}{DEMO_EMAIL_DOMAIN}"

            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    "username": f"demo_farmer_{i + 1}",
                    "first_name": first_name,
                    "last_name": last_name,
                    "phone_number": f"98765{str(i + 1).zfill(5)}",
                    "role": "farmer",
                    "is_verified": i % 3 != 0,
                },
            )
            if created:
                user.set_password(DEMO_PASSWORD)
                user.save()

            farmer, farmer_created = Farmer.objects.get_or_create(
                user=user,
                defaults={
                    "aadhaar_number": f"2345{str(i + 1).zfill(8)}",
                    "village": village_info["name"],
                    "address": (
                        f"{village_info['name']}, {village_info['district']} District, "
                        f"{village_info['state']} — {village_info['pincode']}"
                    ),
                    "experience_years": 5 + (i % 20),
                    "verification_status": i % 4 != 0,
                },
            )
            farmers.append(farmer)
        return farmers

    def _create_buyers(self, count):
        buyers = []
        for i in range(count):
            company = BUYER_COMPANIES[i]
            email = f"buyer{i + 1}{DEMO_EMAIL_DOMAIN}"

            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    "username": f"demo_buyer_{i + 1}",
                    "first_name": company.split()[0],
                    "last_name": "Traders",
                    "phone_number": f"99887{str(i + 1).zfill(5)}",
                    "role": "buyer",
                    "is_verified": True,
                },
            )
            if created:
                user.set_password(DEMO_PASSWORD)
                user.save()

            buyer, _ = Buyer.objects.get_or_create(
                user=user,
                defaults={
                    "company_name": company,
                    "phone_number": user.phone_number,
                },
            )
            buyers.append(buyer)
        return buyers

    def _create_schemes(self, count):
        today = date.today()
        schemes = []
        for data in GOVERNMENT_SCHEMES[:count]:
            scheme, _ = GovernmentScheme.objects.update_or_create(
                name=data["name"],
                defaults={
                    "description": data["description"],
                    "eligibility_criteria": data["eligibility"],
                    "benefit_amount": Decimal(str(data["benefit"])),
                    "start_date": today - timedelta(days=180),
                    "end_date": today + timedelta(days=365),
                    "is_active": True,
                },
            )
            schemes.append(scheme)
        return schemes

    def _create_lands(self, farmers, count):
        lands = []
        lands_per_farmer = count // len(farmers)
        remainder = count % len(farmers)
        land_index = 0

        for farmer_idx, farmer in enumerate(farmers):
            village_info = VILLAGES[farmer_idx % len(VILLAGES)]
            parcel_count = lands_per_farmer + (1 if farmer_idx < remainder else 0)

            for parcel in range(parcel_count):
                land_index += 1
                total_area = Decimal(str(round(random.uniform(1.2, 8.5), 2)))
                lands.append(
                    LandRecord.objects.create(
                        farmer=farmer,
                        survey_number=f"{village_info['district'][:3].upper()}/{farmer.id}/{parcel + 1}",
                        total_area=total_area,
                        soil_type=SOIL_TYPES[farmer_idx % len(SOIL_TYPES)],
                        irrigation_type=IRRIGATION_TYPES[(farmer_idx + parcel) % len(IRRIGATION_TYPES)],
                        location=f"{farmer.village}, {village_info['district']}, {village_info['state']}",
                        is_verified=farmer.verification_status and parcel == 0,
                    )
                )
        return lands

    def _create_crops(self, farmers, lands, count):
        crop_names = list(CROP_PROFILES.keys())
        crops = []
        crops_per_farmer = count // len(farmers)
        remainder = count % len(farmers)

        for farmer_idx, farmer in enumerate(farmers):
            farmer_lands = [l for l in lands if l.farmer_id == farmer.id]
            if not farmer_lands:
                continue
            total_land = sum(l.total_area for l in farmer_lands)
            crop_count = crops_per_farmer + (1 if farmer_idx < remainder else 0)

            for crop_idx in range(crop_count):
                crop_name = crop_names[(farmer_idx + crop_idx) % len(crop_names)]
                profile = CROP_PROFILES[crop_name]
                season = profile["seasons"][crop_idx % len(profile["seasons"])]
                area_fraction = random.uniform(*profile["area_fraction"])
                area_used = min(
                    Decimal(str(round(float(total_land) * area_fraction, 2))),
                    total_land,
                )
                yield_per_acre = random.uniform(*profile["yield_per_acre"])
                yield_amount = Decimal(str(round(float(area_used) * yield_per_acre, 2)))

                if season == "kharif":
                    harvest_offset = random.randint(30, 120)
                elif season == "rabi":
                    harvest_offset = random.randint(120, 240)
                else:
                    harvest_offset = random.randint(10, 60)

                crops.append(
                    CropRecord.objects.create(
                        farmer=farmer,
                        crop_name=crop_name,
                        season=season,
                        area_used=area_used,
                        yield_amount=yield_amount,
                        harvest_date=date.today() - timedelta(days=harvest_offset),
                    )
                )
        return crops

    def _create_listings(self, farmers, crops, count):
        listings = []
        eligible_crops = [c for c in crops if c.yield_amount > Decimal("10")]
        random.shuffle(eligible_crops)
        selected_crops = eligible_crops[:count]

        for crop in selected_crops:
            profile = CROP_PROFILES.get(crop.crop_name, CROP_PROFILES["Wheat"])
            price = Decimal(str(random.randint(*profile["price_per_quintal"])))
            available_qty = min(crop.yield_amount * Decimal("0.6"), Decimal("500"))
            available_qty = max(available_qty, Decimal("20"))

            listings.append(
                Listing.objects.create(
                    farmer=crop.farmer,
                    crop=crop,
                    quantity=available_qty.quantize(Decimal("0.01")),
                    price_per_unit=price,
                    description=(
                        f"Fresh {crop.crop_name} ({crop.season} season) from "
                        f"{crop.farmer.village}. Quality assured, ready for mandi pickup."
                    ),
                    status="active",
                )
            )
        return listings

    def _create_transactions(self, listings, buyers, count):
        if not listings or not buyers:
            return []

        transactions = []
        selected_listings = random.sample(listings, min(count, len(listings)))

        for listing in selected_listings:
            buyer = random.choice(buyers)
            qty = min(
                listing.quantity * Decimal("0.8"),
                Decimal(str(round(random.uniform(10, 80), 2))),
            )
            qty = max(qty, Decimal("5"))
            total = (qty * listing.price_per_unit).quantize(Decimal("0.01"))

            status_roll = random.random()
            if status_roll < 0.65:
                status = "completed"
            elif status_roll < 0.85:
                status = "pending"
            else:
                status = "cancelled"

            txn = Transaction.objects.create(
                listing=listing,
                buyer=buyer,
                quantity=qty,
                total_amount=total,
                status=status,
            )
            transactions.append(txn)

            if status == "completed":
                listing.quantity = max(Decimal("0"), listing.quantity - qty)
                if listing.quantity <= Decimal("0"):
                    listing.status = "sold"
                listing.save(update_fields=["quantity", "status"])

        return transactions

    def _create_scheme_applications(self, farmers, schemes, count):
        applications = []
        pairs = [(f, s) for f in farmers for s in schemes]
        random.shuffle(pairs)

        status_distribution = (
            ["approved"] * 12
            + ["under_review"] * 10
            + ["submitted"] * 10
            + ["rejected"] * 8
        )
        random.shuffle(status_distribution)

        for i in range(min(count, len(pairs))):
            farmer, scheme = pairs[i]
            if SchemeApplication.objects.filter(farmer=farmer, scheme=scheme).exists():
                continue

            status = status_distribution[i % len(status_distribution)]
            remarks = ""
            if status == "approved":
                remarks = "All documents verified. Benefit disbursement scheduled."
            elif status == "rejected":
                remarks = "Land area exceeds scheme eligibility threshold."

            applications.append(
                SchemeApplication.objects.create(
                    farmer=farmer,
                    scheme=scheme,
                    status=status,
                    remarks=remarks,
                )
            )
        return applications

    def _create_complaints(self, farmers, count):
        complaints = []
        status_cycle = [
            "resolved",
            "under_review",
            "investigation",
            "submitted",
            "rejected",
        ]

        for i in range(count):
            farmer = farmers[i % len(farmers)]
            title, description = COMPLAINT_TEMPLATES[i % len(COMPLAINT_TEMPLATES)]
            status = status_cycle[i % len(status_cycle)]
            resolution_notes = ""
            if status == "resolved":
                resolution_notes = (
                    "Issue addressed by district agriculture officer. "
                    "Follow-up scheduled in 15 days."
                )
            elif status == "rejected":
                resolution_notes = "Complaint does not fall under scheme jurisdiction."

            complaints.append(
                Complaint.objects.create(
                    farmer=farmer,
                    title=title,
                    description=description,
                    status=status,
                    resolution_notes=resolution_notes,
                )
            )
        return complaints

    def _recalculate_all_trust_scores(self, farmers):
        trust_scores = []
        for farmer in farmers:
            trust_scores.append(recalculate_trust_score_silent(farmer))
        return trust_scores

    def _create_loan_predictions(self, farmers, count):
        farmers_with_activity = sorted(
            farmers,
            key=lambda f: (
                Transaction.objects.filter(listing__farmer=f, status="completed").count(),
                LandRecord.objects.filter(farmer=f).count(),
            ),
            reverse=True,
        )
        selected = farmers_with_activity[:count]
        return [create_loan_prediction_silent(f) for f in selected]

    def _create_notifications(self, farmers, buyers, schemes, listings, loan_count):
        all_users = list(User.objects.filter(email__endswith=DEMO_EMAIL_DOMAIN))
        notifications_created = 0
        template_index = 0

        def next_template():
            nonlocal template_index
            tpl = NOTIFICATION_TEMPLATES[template_index % len(NOTIFICATION_TEMPLATES)]
            template_index += 1
            return tpl

        for farmer in farmers:
            if notifications_created >= NOTIFICATION_COUNT:
                break
            trust = TrustScore.objects.filter(farmer=farmer).first()
            land = LandRecord.objects.filter(farmer=farmer).first()
            crop = CropRecord.objects.filter(farmer=farmer).first()
            scheme = random.choice(schemes) if schemes else None

            context = {
                "survey": land.survey_number if land else "N/A",
                "crop": crop.crop_name if crop else "produce",
                "price": str(listings[0].price_per_unit) if listings else "2000",
                "buyer": buyers[0].company_name if buyers else "Agri Buyer",
                "qty": "50",
                "amount": "1,25,000",
                "scheme": scheme.name if scheme else "PM-KISAN",
                "score": str(trust.total_score) if trust else "70",
                "category": trust.category if trust else "Good",
                "risk": "medium",
                "title": "Grievance registered",
                "ver": str(trust.verification_score) if trust else "15",
                "txn": str(trust.transaction_score) if trust else "12",
            }

            for _ in range(2):
                if notifications_created >= NOTIFICATION_COUNT:
                    break
                title, message, ntype, link = next_template()
                create_notification(
                    user=farmer.user,
                    title=title,
                    message=message.format(**context),
                    notification_type=ntype,
                    link=link,
                )
                notifications_created += 1

        while notifications_created < NOTIFICATION_COUNT:
            user = random.choice(all_users)
            title, message, ntype, link = next_template()
            create_notification(
                user=user,
                title=title,
                message=message.format(
                    survey="SN-001",
                    crop="Wheat",
                    price="2200",
                    buyer="Maharashtra Agro Traders",
                    qty="40",
                    amount="88,000",
                    scheme="PM-KISAN",
                    score="75",
                    category="Good",
                    risk="medium",
                    title="Canal water issue",
                    ver="18",
                    txn="20",
                ),
                notification_type=ntype,
                link=link,
            )
            notifications_created += 1

        return notifications_created

    def _write_demo_users_doc(self):
        project_root = Path(__file__).resolve().parents[4]
        doc_path = project_root / "DEMO_USERS.md"
        content = f"""# UNNATI Demo User Credentials

Use these accounts for college demonstrations and dashboard walkthroughs.

**Default password for all demo accounts:** `{DEMO_PASSWORD}`

---

## Farmer Login

| Field | Value |
|-------|-------|
| **Email** | `farmer1@unnati.demo` |
| **Password** | `{DEMO_PASSWORD}` |
| **Name** | Rajesh Kumar |
| **Village** | Rampur Khurd, Uttar Pradesh |

Additional farmers: `farmer2@unnati.demo` through `farmer50@unnati.demo` (same password).

Each farmer has land records, crop records, and a trust score.

---

## Buyer Login

| Field | Value |
|-------|-------|
| **Email** | `buyer1@unnati.demo` |
| **Password** | `{DEMO_PASSWORD}` |
| **Company** | Maharashtra Agro Traders Pvt Ltd |

Additional buyers: `buyer2@unnati.demo` through `buyer20@unnati.demo` (same password).

---

## Government Login

| Field | Value |
|-------|-------|
| **Email** | `{GOVERNMENT_EMAIL}` |
| **Password** | `{DEMO_PASSWORD}` |
| **Name** | Anjali Verma |
| **Role** | Government Official |

Use for scheme management, complaint review, and village analytics.

---

## Bank Login

| Field | Value |
|-------|-------|
| **Email** | `{BANK_EMAIL}` |
| **Password** | `{DEMO_PASSWORD}` |
| **Name** | Rohit Malhotra |
| **Role** | Bank Officer |

Use for loan eligibility review and farmer trust score access.

---

## Admin Login

| Field | Value |
|-------|-------|
| **Email** | `{ADMIN_EMAIL}` |
| **Password** | `{DEMO_PASSWORD}` |
| **Name** | Admin UNNATI |
| **Role** | Platform Admin |

Full access to all modules and Django admin panel.

---

## Demo Data Summary

| Entity | Count |
|--------|-------|
| Farmers | {FARMER_COUNT} |
| Buyers | {BUYER_COUNT} |
| Land Records | {LAND_COUNT} |
| Crop Records | {CROP_COUNT} |
| Marketplace Listings | {LISTING_COUNT} |
| Transactions | {TRANSACTION_COUNT} |
| Government Schemes | {SCHEME_COUNT} |
| Scheme Applications | {SCHEME_APPLICATION_COUNT} |
| Complaints | {COMPLAINT_COUNT} |
| Trust Scores | {FARMER_COUNT} |
| Loan Predictions | {LOAN_PREDICTION_COUNT} |
| Notifications | {NOTIFICATION_COUNT} |

---

## Commands

```bash
# Seed demo data
python manage.py seed_demo_data

# Remove all demo data safely
python manage.py clear_demo_data
```
"""
        doc_path.write_text(content, encoding="utf-8")
        self.stdout.write(f"  Wrote {doc_path}")

    def _print_summary(self, farmers, buyers, lands, crops, listings, schemes, trust_scores, loans, notifications):
        self.stdout.write(self.style.SUCCESS("\nDemo data seeded successfully!\n"))
        self.stdout.write(f"  Farmers:              {len(farmers)}")
        self.stdout.write(f"  Buyers:               {len(buyers)}")
        self.stdout.write(f"  Land Records:         {len(lands)}")
        self.stdout.write(f"  Crop Records:         {len(crops)}")
        self.stdout.write(f"  Listings:             {len(listings)}")
        self.stdout.write(f"  Transactions:         {Transaction.objects.filter(buyer__user__email__endswith=DEMO_EMAIL_DOMAIN).count()}")
        self.stdout.write(f"  Government Schemes:   {len(schemes)}")
        self.stdout.write(f"  Scheme Applications:  {SchemeApplication.objects.filter(farmer__user__email__endswith=DEMO_EMAIL_DOMAIN).count()}")
        self.stdout.write(f"  Complaints:           {Complaint.objects.filter(farmer__user__email__endswith=DEMO_EMAIL_DOMAIN).count()}")
        self.stdout.write(f"  Trust Scores:         {len(trust_scores)}")
        self.stdout.write(f"  Loan Predictions:     {len(loans)}")
        self.stdout.write(f"  Notifications:        {notifications}")
        self.stdout.write(f"\n  Login: farmer1@unnati.demo / {DEMO_PASSWORD}")
