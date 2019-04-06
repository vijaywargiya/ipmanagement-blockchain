from typing import Union

from django.contrib.auth.models import User, AnonymousUser

from ipmanagement.backend.blockchain import BlockChain
from ipmanagement.backend.hasher import HashOperator
from ipmanagement.models import EmailAuthModel


class Backend:
    block_chain = BlockChain()
    hash_operator = HashOperator()

    def get_properties_for_user(self, user: User) -> list:
        user_properties = list()
        for transaction in self.block_chain.each_property_transaction():
            if self.hash_operator.validate_user(user, transaction['recipient']):
                user_properties.append(transaction['token'])
            if self.hash_operator.validate_user(user, transaction['sender']) and \
                    transaction['token'] in user_properties:
                user_properties.remove(transaction['token'])
        return user_properties

    def get_transactions_for_user(self, user: User) -> list:
        transactions = list()
        for transaction in self.block_chain.each_property_transaction():
            if self.hash_operator.validate_user(user, transaction['sender']) or \
                    self.hash_operator.validate_user(user, transaction['recipient']):
                transactions.append(transaction)
        return transactions

    def get_all_transactions(self) -> list:
        transactions = [transaction for transaction in self.block_chain.each_property_transaction()]
        return transactions

    def new_transaction(self, user: Union[User, None], property_id: int, recipient: str, create: bool = False) -> bool:
        owner_hash = self.get_property_owner(property_id)
        if owner_hash and not self.hash_operator.validate_user(user, owner_hash):
            raise Exception("Requesting user is not the owner of the property")
        if owner_hash:
            user_hash = self.hash_operator.create_hash_for_user(user)
            sender = user_hash.value
        elif create:
            sender = "[BOT] - NEW_PROPERTY_CREATOR"
        else:
            raise Exception("Property not found")
        self.block_chain.new_property_transaction(sender=sender, recipient=recipient, property_id=property_id)

    def get_property_owner(self, property_id: int):
        path = self.block_chain.find_path(property_id)
        if not path:
            return None
        return path[-1]['recipient']

    def new_property(self, property_id: int, user: User):
        user_hash = self.hash_operator.create_hash_for_user(user)
        self.new_transaction(user=None, property_id=property_id, recipient=user_hash.value, create=True)

    def transfer_money(self, sender: EmailAuthModel, receiver: EmailAuthModel, amount: int) -> bool:
        if sender == "Admin":
            sender_hash = "[BOT] - NEW_COIN_CREATOR"
        else:
            sender_hash = self.hash_operator.create_hash_for_user(sender).value
        recipient_hash = self.hash_operator.create_hash_for_user(receiver).value
        self.block_chain.new_coin_transaction(
            sender=sender_hash,
            recipient=recipient_hash,
            amount=amount
        )
        return True

    def get_coins(self, user: EmailAuthModel) -> int:
        coins_earned = 0
        coins_spent = 0
        for transaction in self.block_chain.each_coin_transaction():
            if self.hash_operator.validate_user(user, transaction['recipient']):
                coins_earned += transaction['token']
            if self.hash_operator.validate_user(user, transaction['sender']):
                coins_spent += transaction['token']
        return coins_earned - coins_spent
