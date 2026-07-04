import django_filters
from marketplace.models import Listing, Transaction


class ListingFilter(django_filters.FilterSet):
    status = django_filters.CharFilter()
    price_min = django_filters.NumberFilter(field_name="price_per_unit", lookup_expr="gte")
    price_max = django_filters.NumberFilter(field_name="price_per_unit", lookup_expr="lte")

    class Meta:
        model = Listing
        fields = ["status", "farmer", "crop"]


class TransactionFilter(django_filters.FilterSet):
    status = django_filters.CharFilter()

    class Meta:
        model = Transaction
        fields = ["status", "buyer", "listing"]
