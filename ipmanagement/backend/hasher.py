from argon2 import PasswordHasher

from ipmanagement.models import EmailAuthModel


class ArgonHash:
    def __init__(self, value: str):
        self.value = value


class HashOperator:
    def __init__(self):
        self.ph = PasswordHasher()

    def hash(self, entity: str) -> ArgonHash:
        return ArgonHash(self.ph.hash(entity))

    def validate(self, entity: str, argon_hash: str):
        try:
            self.ph.verify(argon_hash, entity)
            return True
        except:
            return False

    def create_hash_for_user(self, user: EmailAuthModel) -> ArgonHash:
        user_string = str(user.id)
        return self.hash(user_string)

    def validate_user(self, user: EmailAuthModel, argon_hash: str) -> bool:
        if not user:
            return False
        user_string = str(user.id)
        return self.validate(user_string, argon_hash)
