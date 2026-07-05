from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction

from config.management.demo_constants import DEMO_EMAIL_DOMAIN, DEMO_SCHEME_NAMES
from schemes.models import GovernmentScheme

User = get_user_model()


class Command(BaseCommand):
    help = "Safely remove all UNNATI demo data seeded via seed_demo_data"

    def add_arguments(self, parser):
        parser.add_argument(
            "--noinput",
            action="store_true",
            help="Skip confirmation prompt",
        )

    def handle(self, *args, **options):
        demo_users = User.objects.filter(email__endswith=DEMO_EMAIL_DOMAIN)
        user_count = demo_users.count()
        scheme_count = GovernmentScheme.objects.filter(name__in=DEMO_SCHEME_NAMES).count()

        if user_count == 0 and scheme_count == 0:
            self.stdout.write(self.style.WARNING("No demo data found."))
            return

        self.stdout.write(
            f"Found {user_count} demo user(s) and {scheme_count} demo scheme(s) to remove."
        )
        self.stdout.write(
            "This will cascade-delete related farmers, lands, crops, listings, "
            "transactions, complaints, trust scores, loan predictions, and notifications."
        )

        if not options["noinput"]:
            confirm = input("Type 'yes' to continue: ")
            if confirm.strip().lower() != "yes":
                self.stdout.write(self.style.WARNING("Aborted."))
                return

        with transaction.atomic():
            deleted_users, user_details = demo_users.delete()
            deleted_schemes, scheme_details = GovernmentScheme.objects.filter(
                name__in=DEMO_SCHEME_NAMES
            ).delete()

        self.stdout.write(self.style.SUCCESS("\nDemo data cleared successfully."))
        self.stdout.write(f"  Users removed:   {deleted_users}")
        self.stdout.write(f"  Schemes removed: {deleted_schemes}")

        if user_details:
            self.stdout.write("\n  Cascaded deletions:")
            for model, count in sorted(user_details.items()):
                if count:
                    self.stdout.write(f"    {model}: {count}")
