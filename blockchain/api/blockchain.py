import hashlib
import json
import uuid
from datetime import datetime
from time import time
from urllib.parse import urlparse
from uuid import uuid4, uuid5

import requests
from argon2 import PasswordHasher
from copy import deepcopy
from flask import Flask, jsonify, request


class Blockchain:
    def __init__(self):
        self.current_transactions = []
        self.chain = []
        self.nodes = set()
        # Create the genesis block
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

    def valid_chain(self, chain):
        """
        Determine if a given blockchain is valid

        :param chain: A blockchain
        :return: True if valid, False if not
        """

        last_block = chain[0]
        current_index = 1

        while current_index < len(chain):
            block = chain[current_index]
            print(last_block)
            print(block)
            print("\n-----------\n")
            # Check that the hash of the block is correct
            if block['previous_hash'] != self.hash(last_block):
                return False

            # Check that the Proof of Work is correct
            if not self.valid_proof(last_block['proof'], block['proof'], last_block['previous_hash']):
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
                if length > max_length and self.valid_chain(chain):
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
            'timestamp': time(),
            'transactions': self.current_transactions,
            'proof': proof,
            'previous_hash': previous_hash or self.hash(self.chain[-1]),
        }

        # Reset the current list of transactions
        self.current_transactions = []
        self.chain.append(block)
        return block

    def new_transaction(self, sender, recipient, token):
        """
        Creates a new transaction to go into the next mined Block

        :param sender: Address of the Sender
        :param recipient: Address of the Recipient
        :param token: Token of the property
        :return: The index of the Block that will hold this transaction
        """
        verify = self.verify_token(sender, token)
        if verify == 'Found':
            self.current_transactions.append({
                'sender': sender,
                'recipient': recipient,
                'token': token,
            })

            return self.last_block['index'] + 1

        return verify

    def find_path(self, token):
        path = []
        for item in self.chain:
            for i in item['transactions']:
                if i['token'] == token:
                    path.append(i)
        for item in self.current_transactions:
            if item['token'] == token:
                path.append(item)
        return path

    def verify_token(self, nsender, token):
        path = []
        sender = uuid4()
        if nsender == "admin":
            return "Found"
        for item in self.chain:
            for i in item['transactions']:
                if i['token'] == token:
                    if i['sender'] == sender or 'admin':
                        sender = i['recipient']
                        path.append(i)
                    else:
                        return "Path Compromised"

        for item in self.current_transactions:
            if item['token'] == token:
                if item['sender'] == sender or 'admin':
                    sender = item['recipient']
                    path.append(item)
                else:
                    return "Path Compromised"
        if sender == nsender:
            return "Found"
        return "You are not the owner of this property"

    @property
    def last_block(self):
        return self.chain[-1]

    @staticmethod
    def hash(block):
        """
        Creates a SHA-256 hash of a Block

        :param block: Block
        """

        # We must make sure that the Dictionary is Ordered, or we'll have inconsistent hashes
        block_string = json.dumps(block, sort_keys=True).encode()
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
        last_hash = self.hash(last_block)

        proof = 0
        while self.valid_proof(last_proof, proof, last_hash) is False:
            proof += 1

        return proof

    @staticmethod
    def valid_proof(last_proof, proof, last_hash):
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

    def add_property(self, property, owner_hash):
        uuuuid = uuid.uuid5(uuid.NAMESPACE_DNS, property)
        key = str(uuid5(uuuuid, owner_hash))
        self.new_transaction("admin", owner_hash, key)
        return key

    def get_properties(self, user_hash):
        unique_tokens = []
        user_properties = []
        for block in self.chain:
            for transaction in block['transactions']:
                if transaction['token'] not in unique_tokens:
                    unique_tokens.append(transaction['token'])
        for token in unique_tokens:
            if self.verify_token(user_hash, token) == 'Found':
                user_properties.append(token)

        return user_properties

    def get_transactions(self, user_hash):
        user_transactions = []
        for block in self.chain:
            for transaction in block['transactions']:
                if transaction['sender'] == user_hash:
                    temp_transaction = deepcopy(transaction)
                    temp_transaction['sender'] = 'self'
                    user_transactions.append(temp_transaction)
                elif transaction['recipient'] == user_hash:
                    temp_transaction = deepcopy(transaction)
                    temp_transaction['recipient'] = 'self'
                    user_transactions.append(temp_transaction)
        return user_transactions
