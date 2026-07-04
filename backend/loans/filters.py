import django_filters
from loans.models import LoanPrediction


class LoanPredictionFilter(django_filters.FilterSet):
    risk_category = django_filters.CharFilter()

    class Meta:
        model = LoanPrediction
        fields = ["risk_category", "farmer"]
