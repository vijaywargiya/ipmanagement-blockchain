from datetime import datetime

from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet

from ipmanagement.models import EmailAuthModel
from ipmanagement.views import backend, backend, wait_mine, release_mine


class MiningView(ViewSet):
    def create(self, request: Request) -> Response:
        wait_mine()

        response = dict()
        response['time'] = datetime.utcnow().strftime("%d/%m/%Y - %H:%M:%S")

        current_transactions = backend.block_chain.current_transactions

        if not current_transactions:
            release_mine()
            response['status'] = "Failed"
            response['coins'] = 0
            return Response(data=response)

        backend.transfer_money(
            sender="Admin",
            receiver=request.user,
            amount=len(current_transactions)
        )

        last_block = backend.block_chain.last_block
        proof = backend.block_chain.proof_of_work(last_block)

        previous_hash = backend.block_chain.create_hash_for_block(last_block)
        block = backend.block_chain.new_block(proof, previous_hash)

        release_mine()

        response['status'] = "Success"
        response['coins'] = len(current_transactions)
        response['details'] = {
            'message': "New Block Forged",
            'index': block['index'],
            'transactions': block['transactions'],
            'proof': block['proof'],
            'previous_hash': block['previous_hash'],
        }

        return Response(data=response)

    def list(self, request: Request) -> Response:
        return Response(status=404)
