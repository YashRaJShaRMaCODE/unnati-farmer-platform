import django_filters
from notifications.models import Notification


class NotificationFilter(django_filters.FilterSet):
    is_read = django_filters.BooleanFilter()
    notification_type = django_filters.CharFilter()

    class Meta:
        model = Notification
        fields = ["is_read", "notification_type"]
