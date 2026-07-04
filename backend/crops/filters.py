import django_filters
from crops.models import CropRecord


class CropRecordFilter(django_filters.FilterSet):
    season = django_filters.CharFilter()
    harvest_date_after = django_filters.DateFilter(
        field_name="harvest_date", lookup_expr="gte"
    )
    harvest_date_before = django_filters.DateFilter(
        field_name="harvest_date", lookup_expr="lte"
    )

    class Meta:
        model = CropRecord
        fields = ["season", "farmer", "crop_name"]
