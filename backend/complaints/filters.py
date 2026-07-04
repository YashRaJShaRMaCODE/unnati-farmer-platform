import django_filters
from complaints.models import Complaint


class ComplaintFilter(django_filters.FilterSet):
    status = django_filters.CharFilter()

    class Meta:
        model = Complaint
        fields = ["status", "farmer"]
