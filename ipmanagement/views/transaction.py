from rest_framework.decorators import action
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet

from ipmanagement.serializers import TransactionCreateSerializer
from ipmanagement.views import backend


class TransactionView(ViewSet):
    def create(self, request: Request) -> Response:
        serializer = TransactionCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)
        request_data = serializer.validated_data
        property_id = int(request_data['property'])
        recipient = request_data['recipient']
        backend.new_transaction(user=request.user, property_id=property_id, recipient=recipient)
        return Response(data="Transaction Successful")

    def list(self, request: Request) -> Response:
        all_transactions = backend.get_all_transactions()
        return Response(data=all_transactions)

    @action(url_path='self', url_name='self', detail=False)
    def self(self, request: Request) -> Response:
        self_transactions = backend.get_transactions_for_user(user=request.user)
        return Response(data=self_transactions)
