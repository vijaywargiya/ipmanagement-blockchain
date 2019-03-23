from datetime import datetime

from blockchain.routes import db
from argon2 import PasswordHasher

from flask_login import UserMixin


class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), index=True, unique=True)
    email = db.Column(db.String(120), index=True, unique=True)
    password_hash = db.Column(db.String(128))
    role = db.Column(db.String(128))

    def __repr__(self):
        return '<User {}>'.format(self.username)

    @staticmethod
    def hash_password(password: str):
        ph = PasswordHasher()
        hash = ph.hash(password)
        return hash

    def check_password(self, password):
        ph = PasswordHasher()
        try:
            return ph.verify(self.password_hash, password)
        except Exception:
            return False
        return False


class Property(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    token = db.Column(db.String(120), index=True, unique=True)
    name = db.Column(db.String(64))
    body = db.Column(db.String(120))

    def __repr__(self):
        return '<Property {}>'.format(self.token)


class Notifications(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_address_hash = db.Column(db.String(256))
    time = db.Column(db.String(60))
    read = db.Column(db.Boolean)
    headline = db.Column(db.String(60))
    text = db.Column(db.String(240))
    property_token = db.Column(db.String(60))

    def __repr__(self):
        return '<Notifications {}>'.format(self.headline)


class Messages(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_address_hash = db.Column(db.String(256))
    sender_address_hash = db.Column(db.String(256))
    time = db.Column(db.String(60))
    read = db.Column(db.Boolean)
    text = db.Column(db.String(256))

    def __repr__(self):
        return '<Messages {}>'.format(self.headline)
