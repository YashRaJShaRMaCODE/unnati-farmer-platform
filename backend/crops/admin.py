from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import CropRecord

admin.site.register(CropRecord)