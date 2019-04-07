from rest_framework.decorators import action
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet

from ipmanagement.models import Property
from ipmanagement.serializers import PropertyCreateSerializer
from ipmanagement.views import backend


class PropertyView(ViewSet):

    def create(self, request: Request) -> Response:
        serializer = PropertyCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)
        request_data = serializer.validated_data
        name = request_data['name']
        description = request_data['description']
        new_property = Property.objects.create(name=name, description=description)
        try:
            backend.new_property(property_id=new_property.id, user=request.user)
        except:
            new_property.delete()
            return Response(data=f"Failed to create property {request_data['name']}", status=400)
        return Response(data=f"Successfully Created Property {new_property.name}")

    def list(self, request: Request) -> Response:
        properties = Property.objects.values()
        return Response(data=properties)

    def retrieve(self, request: Request, pk: int) -> Response:
        details = Property.objects.filter(id=pk).values()
        return Response(data=details)

    @action(url_path='self', url_name='self', detail=False)
    def self(self, request: Request) -> Response:
        property_ids = backend.get_properties_for_user(user=request.user)
        properties = Property.objects.filter(id__in=property_ids).values()
        return Response(data=properties)

    @action(url_name='owner', url_path='owner', detail=True)
    def owner(self, request: Request, pk: int) -> Response:
        owner = backend.get_property_owner(property_id=pk)
        return Response(data=owner)
