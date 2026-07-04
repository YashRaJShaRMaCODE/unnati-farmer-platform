import django_filters
from schemes.models import GovernmentScheme, SchemeApplication


class GovernmentSchemeFilter(django_filters.FilterSet):
    is_active = django_filters.BooleanFilter()

    class Meta:
        model = GovernmentScheme
        fields = ["is_active"]


class SchemeApplicationFilter(django_filters.FilterSet):
    status = django_filters.CharFilter()

    class Meta:
        model = SchemeApplication
        fields = ["status", "farmer", "scheme"]
