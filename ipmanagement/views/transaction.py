from rest_framework.decorators import action
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet

from ipmanagement.serializers import TransactionCreateSerializer
from ipmanagement.views import property_backend


class TransactionView(ViewSet):
    def create(self, request: Request) -> Response:
        serializer = TransactionCreateSerializer(request.POST)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)
        property_id = request.POST('property_id')
        recipient = request.POST('recipient')
        property_backend.new_transaction(user=request.user, property_id=property_id, receipient=recipient)
        return Response(data="Transaction Successful")

    def list(self, request: Request) -> Response:
        all_transactions = property_backend.get_all_transactions()
        return Response(data=all_transactions)

    @action(url_path='self', url_name='self', detail=False)
    def self(self, request: Request) -> Response:
        self_transactions = property_backend.get_transactions_for_user(user=request.user)
        return Response(data=self_transactions)
