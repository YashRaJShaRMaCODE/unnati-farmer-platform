import django_filters
from farmers.models import Farmer


class FarmerFilter(django_filters.FilterSet):
    verification_status = django_filters.BooleanFilter()
    experience_years_min = django_filters.NumberFilter(
        field_name="experience_years", lookup_expr="gte"
    )
    experience_years_max = django_filters.NumberFilter(
        field_name="experience_years", lookup_expr="lte"
    )

    class Meta:
        model = Farmer
        fields = ["verification_status", "experience_years"]
