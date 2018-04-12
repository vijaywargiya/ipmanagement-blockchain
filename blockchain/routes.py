# Generate a globally unique address for this node
import uuid
from functools import wraps
from uuid import uuid4

import pickle

import os

import time

import datetime

import sqlalchemy
from argon2 import PasswordHasher
from flask_login import current_user, login_user, logout_user, UserMixin, login_required

from flask import jsonify, request, render_template, flash, url_for, Flask, redirect, json, session
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from flask_restful import Api, Resource
from sqlalchemy.exc import InterfaceError
from werkzeug.urls import url_parse
from werkzeug.utils import secure_filename

from blockchain.api.blockchain import Blockchain
from blockchain.api.forms import RegistrationForm, LoginForm, NewTransactionForm, PropertyForm, MessagesForm

from blockchain import Config

node_identifier = str(uuid4()).replace('-', '')

blockchain = Blockchain()
app = Flask(__name__)
app.config.from_object(Config)
db = SQLAlchemy(app)

migrate = Migrate(app, db)
api = Api(app)
from flask_login import LoginManager

login = LoginManager(app)
app.config['SECRET_KEY'] = 'you-will-never-guess'
app.secret_key = 'some_secret'


def check_address(func):
    @wraps(func)
    def decorated_function(*args, **kwargs):
        try:
            if current_user.address == '':
                return redirect("/logout")
        except AttributeError:
            pass
        blockchain.resolve_conflicts()
        return func(*args, **kwargs)

    return decorated_function


@app.context_processor
def inject_info():
    return dict(logged_in_user=current_user)


@app.route('/register', methods=['GET', 'POST'])
def register():
    form = RegistrationForm()
    if request.method == 'POST':
        from blockchain.api.models import User, Notifications
        user = User(username=form.username.data, email=form.email.data,
                    password_hash=User.hash_password(form.password.data))
        db.session.add(user)
        db.session.commit()
        flash('User Successfully Registered')
        return redirect("/login")
    return render_template('register.html', title='Register', form=form)


@login.user_loader
def load_user(id):
    return LoggedInUser(id)


class GenerateAddress(Resource):
    def get(self):
        ph = PasswordHasher()
        key = ph.hash(current_user.address)
        return str(key)


@app.route('/users')
@check_address
@login_required
def users():
    if current_user.role != 'admin':
        return render_template("message.html", message='Not Authorised')
    from blockchain.api.models import User
    users = User.query.all()
    if users:
        users = [{'password_hash': user.password_hash, 'role': user.role, 'id': user.id, 'username': user.username,
                  'email': user.email} for user in users]
        users = json.dumps(users)
    return render_template('users.html', data=users)


@app.route('/my_transactions_screen')
@check_address
@login_required
def user_transactions():
    data = blockchain.get_transactions(current_user.address)
    data = json.dumps(data)
    return render_template('user_transactions.html', data=data)


@app.route('/transactions')
@check_address
@login_required
def transactions():
    data = blockchain.get_transactions()
    data = json.dumps(data)
    return render_template('transactions.html', data=data)


@app.route('/my_properties_screen')
@check_address
@login_required
def user_properties():
    from blockchain.api.models import Property
    data = blockchain.get_properties(current_user.address)
    properties = []
    for token in data:
        property_details = Property.query.filter_by(token=token).first()
        properties.append(
            {'token': property_details.token, 'name': property_details.name, 'details': property_details.body})
    properties = json.dumps(properties)
    return render_template('user_properties.html', data=properties)


@app.route('/properties', methods=['POST', 'GET'])
@app.route('/properties/<string:token>')
@check_address
@login_required
def properties(token: str = ''):
    from blockchain.api.models import Property
    if request.method == 'POST':
        property_details = Property.query.filter(Property.name.contains(request.form['search']))
        count = [item for item in property_details]
        if not count:
            property_details = Property.query.filter(Property.body.contains(request.form['search']))
    else:
        if token != '':
            property_details = Property.query.filter_by(token=token)
        else:
            property_details = Property.query.all()
    data = []
    property_in_chain = blockchain.get_unique_tokens()
    for property in property_details:
        if property.token not in property_in_chain:
            continue
        data.append({'id': property.id, 'token': property.token, 'name': property.name, 'body': property.body})
    data = json.dumps(data)
    form = MessagesForm()
    return render_template('properties.html', properties=data, form=form)


@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect("/")
    form = LoginForm()
    if request.method == 'POST':
        from blockchain.api.models import User
        user = User.query.filter_by(username=form.username.data).first()
        if user is None or not user.check_password(form.password.data):
            flash('Invalid username or password')
            return redirect("/login")
        login_user(user, remember=form.remember_me.data)
        key = str(uuid.uuid5(uuid.NAMESPACE_DNS, form.password.data + form.username.data))
        LoggedInUser.log_in_address[user.id] = key
        next_page = request.args.get('next')
        if not next_page or url_parse(next_page).netloc != '':
            next_page = "/"
        return redirect(next_page)
    return render_template('login.html', title='Sign In', form=form)


@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect("/")


@app.route('/')
def homepage():
    if current_user.is_authenticated:
        return render_template("logged_in_index.html")
    return render_template("index.html")


@app.route('/mine', methods=['GET'])
def mine():
    # We run the proof of work algorithm to get the next proof...
    last_block = blockchain.last_block
    proof = blockchain.proof_of_work(last_block)

    # We must receive a reward for finding the proof.
    # The sender is "0" to signify that this node has mined a new coin.
    blockchain.new_transaction(
        owner_address=uuid4(),
        sender="admin",
        recipient=node_identifier,
        token=1,
    )

    # Forge the new Block by adding it to the chain
    previous_hash = blockchain.hash(last_block)
    block = blockchain.new_block(proof, previous_hash)

    response = {
        'message': "New Block Forged",
        'index': block['index'],
        'transactions': block['transactions'],
        'proof': block['proof'],
        'previous_hash': block['previous_hash'],
    }
    return jsonify(response), 200


@app.route('/new_transaction_screen', methods=['POST', 'GET'])
@check_address
@login_required
def new_transaction_screen():
    form = NewTransactionForm()
    if request.method == 'POST':
        from blockchain.api.models import User, Notifications
        reciever_hash = request.form['reciever']
        token = request.form['token']
        ph = PasswordHasher()
        user_hash = ph.hash(current_user.address)
        index = blockchain.new_transaction(current_user.address, user_hash, reciever_hash, token)
        no1 = Notifications(user_address_hash=user_hash,
                            time=str(datetime.datetime.now().strftime("%d/%m/%y %I:%M%p")),
                            headline='Property Sent', text=token,
                            read=False)
        no2 = Notifications(user_address_hash=reciever_hash,
                            time=str(datetime.datetime.now().strftime("%d/%m/%y %I:%M%p")),
                            headline='Property Recieved', text=token,
                            read=False)
        # TODO: if exists in db then update row to match name and details
        db.session.add(no1)
        db.session.add(no2)
        db.session.commit()
        response = {'message': 'Transaction will be added to Block {}'.format({index})}
        return render_template("message.html", message=response)
    return render_template('new_transaction.html', title='New Transaction', form=form)


@app.route('/chain', methods=['GET'])
@check_address
def full_chain():
    response = {
        'chain': blockchain.chain,
        'length': len(blockchain.chain),
    }
    return jsonify(response), 200


@app.route('/nodes/register', methods=['POST'])
@login_required
def register_nodes():
    if current_user.role != 'admin':
        return render_template("message.html", message='Not Authorised')
    value = request.form['node']

    if not value:
        return render_template('message.html', message='Enter a valid url')

    try:
        blockchain.register_node(value)
    except ValueError:
        return render_template('message.html', message='Enter a valid url')

    response = {
        'message': 'New nodes have been added',
        'total_nodes': list(blockchain.nodes),
    }
    return render_template('message.html', message=response)


@app.route('/nodes/resolve', methods=['GET'])
def consensus():
    replaced = blockchain.resolve_conflicts()

    if replaced:
        response = {
            'message': 'Our chain was replaced',
            'new_chain': blockchain.chain
        }
    else:
        response = {
            'message': 'Our chain is authoritative',
            'chain': blockchain.chain
        }

    return jsonify(response), 200


db.create_all()


@app.route('/add_property_screen', methods=['POST', 'GET'])
@check_address
@login_required
def add_property():
    form = PropertyForm()
    if request.method == 'POST':
        name = request.form['property_name']
        details = request.form['property_details']
        property_info = name + details
        ph = PasswordHasher()
        user_hash = ph.hash(current_user.address)
        key = blockchain.add_property(property_info, user_hash)
        from blockchain.api.models import Property, Notifications
        property = Property(token=key, name=name, body=details)
        ph = PasswordHasher()
        user_address_hash = ph.hash(current_user.address)
        no = Notifications(user_address_hash=user_address_hash,
                           time=str(datetime.datetime.now().strftime("%d/%m/%y %I:%M%p")),
                           headline='Property Added', text=key,
                           read=False)
        # TODO: if exists in db then update row to match name and details
        db.session.add(property)
        db.session.add(no)
        db.session.commit()
        message = "Property added successfully with key:{}".format(key)
        return render_template('message.html', message=message)
    return render_template('new_property.html', form=form)


@app.route('/write')
def write():
    pickle_filepath = 'picklefile.txt'
    with open(pickle_filepath, 'wb') as pickle_handle:
        pickle.dump(blockchain.chain, pickle_handle)

    return render_template('message.html', message='Successfully written blockchain')


def read():
    pickle_filepath = 'picklefile.txt'
    if os.path.exists(pickle_filepath):
        with open(pickle_filepath, 'rb') as pickle_handle:
            blockchain.__setattr__('chain', pickle.load(pickle_handle))


# read()


@app.route('/clear_messages')
@check_address
@login_required
def clear_messages():
    current_user.clear_messages()
    next_page = request.args.get('next')
    if not next_page or url_parse(next_page).netloc != '':
        next_page = "/"
    return redirect(next_page)


@app.route("/send_messages/<string:token>", methods=['POST'])
@check_address
@login_required
def send_messages(token: str):
    path = blockchain.find_path(token)
    if not path:
        user_address_hash = token
    else:
        owner_hash = path[-1]['recipient']
        user_address_hash = owner_hash
    text = request.form['text']
    from blockchain.api.models import Messages
    ph = PasswordHasher()
    sender_user_hash = ph.hash(current_user.address)
    me = Messages(user_address_hash=user_address_hash, sender_address_hash=sender_user_hash,  # TODO: encrypt this
                  time=str(datetime.datetime.now().strftime("%d/%m/%y %I:%M%p")),
                  text=text, read=False)
    db.session.add(me)
    db.session.commit()
    return render_template('message.html', message='Message Successfully Sent')


@app.route('/messages')
@check_address
@login_required
def messages():
    current_user.clear_messages()
    messages = current_user.messages
    noti = []
    for item in messages:
        noti.append({'id': item.id, 'sender_id': item.sender_address_hash, 'text': item.text,
                     'time': item.time})
    data = json.dumps(noti)
    form = MessagesForm()
    return render_template('messages.html', data=data, form=form)


@app.route('/clear_notifications')
@check_address
@login_required
def clear_notifications():
    current_user.clear_notifications()
    next_page = request.args.get('next')
    if not next_page or url_parse(next_page).netloc != '':
        next_page = "/"
    return redirect(next_page)


@app.route('/notifications')
@check_address
@login_required
def notifications():
    current_user.clear_notifications()
    notifications = current_user.notifications
    noti = []
    for item in notifications:
        noti.append({'id': item.id, 'headline': item.headline, 'text': item.text, 'time': item.time})
    data = json.dumps(noti)
    return render_template('notifications.html', data=data)


class LoggedInUser(UserMixin):
    log_in_address = {}

    def __init__(self, id):
        from blockchain.api.models import Notifications, Messages, User
        user_details = User.query.filter_by(id=id).first().__dict__
        ph = PasswordHasher()
        for item in user_details:
            self.__setattr__(item, user_details[item])
        try:
            self.address = LoggedInUser.log_in_address[int(id)]
        except KeyError:
            self.address = ''
        try:
            notifications = Notifications.query.all()[::-1]
        except Exception:
            notifications = []
        self.notifications = []
        for mess in notifications:
            try:
                if ph.verify(mess.user_address_hash, self.address):
                    self.notifications.append(mess)
            except Exception:
                continue
        self.unread_notifications = []
        for noti in self.notifications:
            if noti.read is False:
                self.unread_notifications.append(noti)
        try:
            messages = Messages.query.all()[::-1]
        except Exception:
            messages = []
        self.messages = []
        for mess in messages:
            try:
                if ph.verify(mess.user_address_hash, self.address):
                    self.messages.append(mess)
            except Exception:
                continue
        self.unread_messages = []
        for noti in self.messages:
            if noti.read is False:
                self.unread_messages.append(noti)

    def clear_notifications(self):
        notifications = self.unread_notifications
        for noti in notifications:
            noti.read = True
        db.session.commit()

    def clear_messages(self):
        messages = self.unread_messages
        for noti in messages:
            noti.read = True
        db.session.commit()


api.add_resource(GenerateAddress, "/generate_address")
