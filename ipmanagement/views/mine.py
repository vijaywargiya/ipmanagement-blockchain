from django.contrib.auth.models import User
from django.template import loader
from rest_framework.decorators import api_view
from rest_framework.request import Request
from rest_framework.response import Response

from ipmanagement.views import property_backend, coin_backend


@api_view(http_method_names=['POST'])
def mine_view(request: Request):
    last_block = property_backend.block_chain.last_block
    proof = property_backend.block_chain.proof_of_work(last_block)

    previous_hash = property_backend.block_chain.create_hash_for_block(last_block)
    block = property_backend.block_chain.new_block(proof, previous_hash)
    coin_backend.transfer_money(
        sender=User.objects.get(0),
        receiver=request.user,
    )
    response = {
        'message': "New Block Forged",
        'index': block['index'],
        'transactions': block['transactions'],
        'proof': block['proof'],
        'previous_hash': block['previous_hash'],
    }
    return Response(data=response)

