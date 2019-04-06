from rest_framework.decorators import action
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet

from ipmanagement.models import Message
from ipmanagement.serializers import MessageCreateSerializer
from ipmanagement.views import backend


class MessageView(ViewSet):
    def create(self, request: Request) -> Response:
        data = dict()
        data['body'] = request.data['body']
        data['recipient'] = backend.get_property_owner(property_id=request.data['property_id'])
        data['sender'] = backend.hash_operator.create_hash_for_user(request.user).value
        serializer = MessageCreateSerializer(data=data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)
        request_data = serializer.validated_data
        sender = request_data['sender']
        body = request_data['body']
        recipient = request_data['recipient']
        new_message = Message.objects.create(sender=sender, recipient=recipient, body=body)
        return Response(data=f"Successfully Sent Message {new_message.body}")

    @action(url_path='respond', url_name='respond', detail=True, methods=['POST'])
    def respond(self, request: Request, pk: int) -> Response:
        initial_message = Message.objects.get(id=pk)
        body = request.data['body']
        new_message = Message.objects.create(sender=initial_message.recipient,
                                             recipient=initial_message.sender, body=body)
        return Response(data=f"Successfully Sent Message {new_message.body}")

    def list(self, request: Request) -> Response:
        all_messages = Message.objects.all().values()
        sent = list()
        received = list()
        for message in all_messages:
            if backend.hash_operator.validate_user(user=request.user, argon_hash=message['sender']):
                sent.append(message)
            elif backend.hash_operator.validate_user(user=request.user, argon_hash=message['recipient']):
                received.append(message)
        return Response(data={"received": received, "sent": sent})

    @action(url_path='unread', url_name='unread', detail=False)
    def unread_messages(self, request: Request) -> Response:
        all_unread_messages = Message.objects.filter(read=False).values()
        user_unread_messages = [message for message in all_unread_messages if
                                backend.hash_operator.validate_user(user=request.user,
                                                                    argon_hash=message.recipient)]
        return Response(data=user_unread_messages)

    @action(url_name='mark_all_read', url_path='mark_all_read', detail=False)
    def mark_all_read(self, request: Request) -> Response:
        all_unread_messages = Message.objects.filter(read=False).values()
        user_unread_messages = [message for message in all_unread_messages if
                                backend.hash_operator.validate_user(user=request.user,
                                                                    argon_hash=message.recipient)]
        for message in user_unread_messages:
            message.read = True
        return Response(data="Marked all messages as read")
