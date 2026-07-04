import django_filters
from lands.models import LandRecord


class LandRecordFilter(django_filters.FilterSet):
    soil_type = django_filters.CharFilter()
    irrigation_type = django_filters.CharFilter()
    is_verified = django_filters.BooleanFilter()
    total_area_min = django_filters.NumberFilter(
        field_name="total_area", lookup_expr="gte"
    )
    total_area_max = django_filters.NumberFilter(
        field_name="total_area", lookup_expr="lte"
    )

    class Meta:
        model = LandRecord
        fields = ["soil_type", "irrigation_type", "is_verified", "farmer"]
