import random
from decimal import Decimal
from datetime import date, timedelta

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

from complaints.models import Complaint
from crops.models import CropRecord
from farmers.models import Farmer
from lands.models import LandRecord
from loans.models import LoanPrediction
from loans.services import calculate_loan_eligibility
from marketplace.models import Listing, Transaction
from farmers.models import Buyer
from schemes.models import GovernmentScheme, SchemeApplication
from trustscore.services import recalculate_farmer_trust_score

User = get_user_model()

VILLAGES = ["Rampur", "Shivpuri", "Krishnanagar", "Greenfield", "Suryapet"]
CROPS = ["Wheat", "Rice", "Cotton", "Sugarcane", "Maize", "Pulses"]
SOIL_TYPES = ["alluvial", "black", "red", "clay"]
IRRIGATION = ["canal", "well", "drip", "rainfed"]


class Command(BaseCommand):
    help = "Seed demo data for UNNATI presentations and dashboards"

    def add_arguments(self, parser):
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Clear existing demo users before seeding",
        )

    def handle(self, *args, **options):
        if options["clear"]:
            User.objects.filter(email__endswith="@unnati.demo").delete()
            self.stdout.write("Cleared existing demo users.")

        self._ensure_schemes()
        farmers = self._create_farmers(50)
        self._create_lands(farmers, 100)
        self._create_crops(farmers, 100)
        buyers = self._create_buyers(10)
        listings = self._create_listings(farmers, 50)
        self._create_transactions(listings, buyers)
        self._create_complaints(farmers, 20)
        self._create_scheme_applications(farmers, 20)
        self._create_loans(farmers, 20)

        for farmer in farmers:
            recalculate_farmer_trust_score(farmer)

        self.stdout.write(self.style.SUCCESS("Demo data seeded successfully!"))
        self.stdout.write(f"  Farmers: {len(farmers)}")
        self.stdout.write(f"  Listings: {len(listings)}")
        self.stdout.write("  Login any farmer: password Demo@1234")

    def _ensure_schemes(self):
        if GovernmentScheme.objects.exists():
            return
        schemes = [
            ("PM-KISAN", "Direct income support for farmers", 6000),
            ("Soil Health Card", "Soil testing and nutrient guidance", 5000),
            ("Crop Insurance", "Pradhan Mantri Fasal Bima Yojana", 25000),
            ("Drip Irrigation Subsidy", "Micro irrigation support", 50000),
            ("Organic Farming Scheme", "Organic certification support", 15000),
        ]
        today = date.today()
        for name, desc, benefit in schemes:
            GovernmentScheme.objects.create(
                name=name,
                description=desc,
                eligibility_criteria="Small and marginal farmers with valid land records.",
                benefit_amount=benefit,
                start_date=today - timedelta(days=180),
                end_date=today + timedelta(days=365),
                is_active=True,
            )

    def _create_farmers(self, count):
        farmers = []
        for i in range(count):
            village = random.choice(VILLAGES)
            email = f"farmer{i+1}@unnati.demo"
            if User.objects.filter(email=email).exists():
                continue
            user = User.objects.create_user(
                email=email,
                username=f"demo_farmer_{i+1}",
                password="Demo@1234",
                first_name=f"Farmer{i+1}",
                last_name=village,
                phone_number=f"98765{str(i+1).zfill(5)}",
                role="farmer",
            )
            farmer = Farmer.objects.create(
                user=user,
                aadhaar_number=str(100000000000 + i).zfill(12),
                village=village,
                address=f"{village}, District Demo",
                experience_years=random.randint(1, 25),
                verification_status=random.random() > 0.3,
            )
            farmers.append(farmer)
        return farmers

    def _create_buyers(self, count):
        buyers = []
        for i in range(count):
            email = f"buyer{i+1}@unnati.demo"
            if User.objects.filter(email=email).exists():
                continue
            user = User.objects.create_user(
                email=email,
                username=f"demo_buyer_{i+1}",
                password="Demo@1234",
                first_name=f"Buyer{i+1}",
                role="buyer",
            )
            buyers.append(Buyer.objects.create(user=user, company_name=f"AgriTrade {i+1}"))
        return buyers

    def _create_lands(self, farmers, count):
        for i in range(count):
            farmer = random.choice(farmers)
            LandRecord.objects.create(
                farmer=farmer,
                survey_number=f"SN-{farmer.id}-{i}",
                total_area=Decimal(str(round(random.uniform(1, 15), 2))),
                soil_type=random.choice(SOIL_TYPES),
                irrigation_type=random.choice(IRRIGATION),
                location=farmer.village,
                is_verified=random.random() > 0.4,
            )

    def _create_crops(self, farmers, count):
        seasons = ["kharif", "rabi", "zaid"]
        for i in range(count):
            farmer = random.choice(farmers)
            CropRecord.objects.create(
                farmer=farmer,
                crop_name=random.choice(CROPS),
                season=random.choice(seasons),
                area_used=Decimal(str(round(random.uniform(0.5, 8), 2))),
                yield_amount=Decimal(str(round(random.uniform(10, 200), 2))),
                harvest_date=date.today() - timedelta(days=random.randint(10, 300)),
            )

    def _create_listings(self, farmers, count):
        listings = []
        for i in range(count):
            farmer = random.choice(farmers)
            crops = CropRecord.objects.filter(farmer=farmer)
            if not crops.exists():
                continue
            crop = random.choice(list(crops))
            listings.append(
                Listing.objects.create(
                    farmer=farmer,
                    crop=crop,
                    quantity=Decimal(str(round(random.uniform(10, 500), 2))),
                    price_per_unit=Decimal(str(round(random.uniform(20, 150), 2))),
                    description=f"Fresh {crop.crop_name} from {farmer.village}",
                    status=random.choice(["active", "active", "active", "sold"]),
                )
            )
        return listings

    def _create_transactions(self, listings, buyers):
        active = [l for l in listings if l.status == "active" or True]
        for listing in random.sample(active, min(30, len(active))):
            if not buyers:
                break
            buyer = random.choice(buyers)
            qty = min(listing.quantity, Decimal(str(round(random.uniform(5, 50), 2))))
            Transaction.objects.create(
                listing=listing,
                buyer=buyer,
                quantity=qty,
                total_amount=qty * listing.price_per_unit,
                status=random.choice(["completed", "completed", "pending"]),
            )

    def _create_complaints(self, farmers, count):
        statuses = ["submitted", "under_review", "investigation", "resolved"]
        for i in range(count):
            farmer = random.choice(farmers)
            Complaint.objects.create(
                farmer=farmer,
                title=f"Issue #{i+1} in {farmer.village}",
                description="Demo complaint for platform testing and analytics.",
                status=random.choice(statuses),
            )

    def _create_scheme_applications(self, farmers, count):
        schemes = list(GovernmentScheme.objects.all())
        if not schemes:
            return
        for i in range(count):
            farmer = random.choice(farmers)
            scheme = random.choice(schemes)
            if SchemeApplication.objects.filter(farmer=farmer, scheme=scheme).exists():
                continue
            SchemeApplication.objects.create(
                farmer=farmer,
                scheme=scheme,
                status=random.choice(["submitted", "under_review", "approved", "rejected"]),
            )

    def _create_loans(self, farmers, count):
        selected = random.sample(farmers, min(count, len(farmers)))
        for farmer in selected:
            calculate_loan_eligibility(farmer)
