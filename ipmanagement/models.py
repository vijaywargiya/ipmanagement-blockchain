from django.contrib.auth.models import User, AbstractUser
from django.db import models


class Property(models.Model):
    name = models.CharField(null=False, blank=False, max_length=50)
    description = models.CharField(null=True, blank=True, max_length=300)

    class Meta:
        app_label = "ipmanagement"


class Message(models.Model):
    recipient = models.CharField(null=False, blank=False, max_length=500)
    sender = models.CharField(null=False, blank=False, max_length=500)
    body = models.CharField(null=False, blank=False, max_length=1000)
    read = models.BooleanField(default=False)

    class Meta:
        app_label = "ipmanagement"


class EmailAuthModel(AbstractUser):
    email = models.EmailField('email address', blank=True, unique=True)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    class Meta:
        app_label = "ipmanagement"
