from django.db import models


class Property(models.Model):
    name = models.CharField(null=False, blank=False, max_length=50)
    description = models.CharField(null=True, blank=True, max_length=300)

    class Meta:
        app_label = "ipmanagement"
