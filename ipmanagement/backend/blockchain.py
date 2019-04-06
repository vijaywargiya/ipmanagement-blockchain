import hashlib
import json
from datetime import datetime
from urllib.parse import urlparse

import requests
from argon2 import PasswordHasher
from argon2.exceptions import VerificationError
from django.core.serializers.json import DjangoJSONEncoder


class TransactionType:
    ip = 'ip'
    coin = 'coin'


class BlockChain:

    def __init__(self):
        self.chain = []
        self.current_transactions = []
        self.nodes = set()
        self.new_block(previous_hash='1', proof=100)

    def register_node(self, address):
        """
        Add a new node to the list of nodes

        :param address: Address of node. Eg. 'http://192.168.0.5:5000'
        """
        print(address)
        parsed_url = urlparse(address)
        print(parsed_url)
        if parsed_url.netloc:
            self.nodes.add(parsed_url.netloc)
        elif parsed_url.path:
            # Accepts an URL without scheme like '192.168.0.5:5000'.
            self.nodes.add(parsed_url.path)
        else:
            raise ValueError('Invalid URL')

    def validate_chain(self):
        """
        Determine if a given block chain is valid

        :return: True if valid, False if not
        """

        last_block = self.chain[0]
        current_index = 1

        while current_index < len(self.chain):
            block = self.chain[current_index]
            # Check that the hash of the block is correct
            if block['previous_hash'] != self.create_hash_for_block(last_block):
                return False

            # Check that the Proof of Work is correct
            if not self.validate_proof(last_block['proof'], block['proof'], block['previous_hash']):
                return False

            last_block = block
            current_index += 1

        return True

    def resolve_conflicts(self):
        """
        This is our consensus algorithm, it resolves conflicts
        by replacing our chain with the longest one in the network.

        :return: True if our chain was replaced, False if not
        """

        neighbours = self.nodes
        new_chain = None

        # We're only looking for chains longer than ours
        max_length = len(self.chain)

        # Grab and verify the chains from all the nodes in our network
        for node in neighbours:
            response = requests.get('http://{}/chain'.format(node))

            if response.status_code == 200:
                length = response.json()['length']
                chain = response.json()['chain']

                # Check if the length is longer and the chain is valid
                if length > max_length and self.validate_chain(chain):
                    max_length = length
                    new_chain = chain

        # Replace our chain if we discovered a new, valid chain longer than ours
        if new_chain:
            self.chain = new_chain
            return True

        return False

    def new_block(self, proof, previous_hash):
        """
        Create a new Block in the Blockchain

        :param proof: The proof given by the Proof of Work algorithm
        :param previous_hash: Hash of previous Block
        :return: New Block
        """

        block = {
            'index': len(self.chain) + 1,
            'timestamp': datetime.utcnow(),
            'transactions': self.current_transactions,
            'proof': proof,
            'previous_hash': previous_hash or self.create_hash_for_block(self.chain[-1]),
        }

        # Reset the current list of transactions
        self.current_transactions = []
        self.chain.append(block)
        return block

    def new_property_transaction(self, sender: str, recipient: str, property_id: int):
        """
        Creates a new transaction to go into the next mined Block

        :param sender: Address of the Sender
        :param recipient: Address of the Recipient
        :param property_id: Token of the property
        :return: The index of the Block that will hold this transaction
        """
        self.current_transactions.append({
            'type': TransactionType.ip,
            'sender': sender,
            'recipient': recipient,
            'token': property_id,
        })
        return self.last_block['index'] + 1

    def new_coin_transaction(self, sender: str, recipient: str, amount: int):
        """
        Creates a new transaction to go into the next mined Block

        :param sender: Address of the Sender
        :param recipient: Address of the Recipient
        :param amount: Token of the property
        :return: The index of the Block that will hold this transaction
        """
        self.current_transactions.append({
            'type': TransactionType.coin,
            'sender': sender,
            'recipient': recipient,
            'token': amount,
        })

        return self.last_block['index'] + 1

    def find_path(self, property_id: int):
        path = []
        for transaction in self.each_property_transaction():
            if transaction['token'] == property_id:
                path.append(transaction)
        return path

    def verify_property_ownership(self, owner_address, property_id: int):
        ph = PasswordHasher()
        path = self.find_path(property_id)
        if not path:
            return False
        try:
            return ph.verify(path[-1]['recipient'], owner_address)
        except VerificationError:
            return False

    @property
    def last_block(self):
        return self.chain[-1]

    def create_hash_for_block(self, block):
        """
        Creates a SHA-256 hash of a Block

        :param block: Block
        """

        # We must make sure that the Dictionary is Ordered, or we'll have inconsistent hashes
        block_string = json.dumps(block, sort_keys=True, cls=DjangoJSONEncoder).encode()
        return hashlib.sha256(block_string).hexdigest()

    def proof_of_work(self, last_block):
        """
        Simple Proof of Work Algorithm:

         - Find a number p' such that hash(pp') contains leading 4 zeroes
         - Where p is the previous proof, and p' is the new proof

        :param last_block: <dict> last Block
        :return: <int>
        """

        last_proof = last_block['proof']
        last_hash = self.create_hash_for_block(last_block)

        proof = 0
        while self.validate_proof(last_proof, proof, last_hash) is False:
            proof += 1

        return proof

    def validate_proof(self, last_proof, proof, last_hash):
        """
        Validates the Proof

        :param last_proof: <int> Previous Proof
        :param proof: <int> Current Proof
        :param last_hash: <str> The hash of the Previous Block
        :return: <bool> True if correct, False if not.

        """

        guess = '{}{}{}'.format({last_proof}, {proof}, {last_hash}).encode()
        guess_hash = hashlib.sha256(guess).hexdigest()
        return guess_hash[:4] == "0000"

    def each_coin_transaction(self) -> dict:
        for block in self.chain:
            for transaction in block['transactions']:
                if transaction['type'] == TransactionType.coin:
                    yield transaction

    def each_property_transaction(self) -> dict:
        for block in self.chain:
            for transaction in block['transactions']:
                if transaction['type'] == TransactionType.ip:
                    yield transaction
