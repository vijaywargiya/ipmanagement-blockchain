import uuid

from django.contrib.auth.models import User, AnonymousUser
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.request import Request
from rest_framework.response import Response

from ipmanagement.models import EmailAuthModel
from ipmanagement.serializers import UserSerializer, UserRegistrationSerializer
from ipmanagement.views import backend, backend


@api_view(http_method_names=['GET'])
def user(request: Request):
    user_data = UserSerializer(request.user)
    response = user_data.data
    response['user_address'] = backend.hash_operator.create_hash_for_user(request.user).value
    response['coins'] = backend.get_coins(request.user)
    return Response(data=response)


@api_view(http_method_names=['POST'])
@permission_classes(())
@authentication_classes(())
def register(request: Request):
    serializer = UserRegistrationSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    request_data = serializer.validated_data
    username = uuid.uuid4().hex[:30]
    new_user = EmailAuthModel.objects.create_user(username=username, email=request_data['email'],
                                                  password=request_data['password'], first_name=request_data['name'])
    return Response(data=f"User {new_user.username} registered successfully")
