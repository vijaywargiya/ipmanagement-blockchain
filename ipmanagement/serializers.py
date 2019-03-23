from rest_framework.serializers import Serializer, CharField, ModelSerializer

from ipmanagement.models import Property


class PropertyCreateSerializer(ModelSerializer):
    class Meta:
        model = Property
        fields = ('name', 'description')


class TransactionCreateSerializer(Serializer):
    a = 1
