from django.apps import AppConfig


class TrustscoreConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "trustscore"

    def ready(self):
        import trustscore.signals  # noqa: F401
