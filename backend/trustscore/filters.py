import django_filters
from trustscore.models import TrustScore


class TrustScoreFilter(django_filters.FilterSet):
    category = django_filters.CharFilter()
    total_score_min = django_filters.NumberFilter(
        field_name="total_score", lookup_expr="gte"
    )
    total_score_max = django_filters.NumberFilter(
        field_name="total_score", lookup_expr="lte"
    )

    class Meta:
        model = TrustScore
        fields = ["category", "farmer"]
