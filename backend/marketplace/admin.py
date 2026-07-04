from django.contrib import admin
from .models import Listing, Transaction

admin.site.register(Listing)
admin.site.register(Transaction)