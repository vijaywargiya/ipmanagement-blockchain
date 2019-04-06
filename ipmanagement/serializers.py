
from rest_framework.serializers import Serializer, CharField, ModelSerializer, EmailField

from ipmanagement.models import Property, Message, EmailAuthModel


class PropertyCreateSerializer(ModelSerializer):
    class Meta:
        model = Property
        fields = ('name', 'description')


class MessageCreateSerializer(ModelSerializer):
    class Meta:
        model = Message
        fields = ('recipient', 'body', 'sender')


class UserSerializer(ModelSerializer):
    class Meta:
        model = EmailAuthModel
        fields = ('first_name', 'last_name', 'email', 'date_joined', 'username')


class UserRegistrationSerializer(Serializer):
    name = CharField()
    email = EmailField()
    password = CharField()


class TransactionCreateSerializer(Serializer):
    property = CharField()
    recipient = CharField()
