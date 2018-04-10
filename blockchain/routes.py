# Generate a globally unique address for this node
from uuid import uuid4

import pickle

import os
from flask_login import current_user, login_user, logout_user

from flask import jsonify, request, render_template, flash, url_for, Flask, redirect, json, session
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from flask_restful import Api, Resource
from werkzeug.urls import url_parse

from blockchain.api.blockchain import Blockchain
from blockchain.api.forms import RegistrationForm, LoginForm, NewTransactionForm, PropertyForm

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


@app.route('/register', methods=['GET', 'POST'])
def register():
    form = RegistrationForm()
    if request.method == 'POST':
        from blockchain.api.models import User
        user = User(username=form.username.data, email=form.email.data,
                    password_hash=User.hash_password(form.password.data))
        db.session.add(user)
        db.session.commit()
        flash('User Successfully Registered')
        return redirect("/login")
    return render_template('register.html', title='Register', form=form)


@login.user_loader
def load_user(id):
    from blockchain.api.models import User
    return User.query.filter_by(id=id).first()


@app.route('/users')
def users():
    from blockchain.api.models import User
    users = User.query.all()
    if users:
        users = [{'role': user.role, 'id': user.id, 'username': user.username, 'email': user.email} for user in users]
        users = json.dumps(users)
    return render_template('users.html', data=users)


@app.route('/my_transactions_screen')
def user_transactions():
    data = blockchain.get_transactions(current_user.password_hash)
    data = json.dumps(data)
    return render_template('user_transactions.html', data=data)


@app.route('/my_properties_screen')
def user_properties():
    from blockchain.api.models import Property
    data = blockchain.get_properties(current_user.password_hash)
    properties = []
    for token in data:
        property_details = Property.query.filter_by(token=token).first()
        properties.append(
            {'token': property_details.token, 'name': property_details.name, 'details': property_details.body})
    properties = json.dumps(properties)
    return render_template('user_properties.html', data=properties)


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
        next_page = request.args.get('next')
        if not next_page or url_parse(next_page).netloc != '':
            next_page = "/"
        return redirect(next_page)
    return render_template('login.html', title='Sign In', form=form)


@app.route('/logout')
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
        sender="0",
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
def new_transaction_screen():
    form = NewTransactionForm()
    if request.method == 'POST':
        from blockchain.api.models import User
        reciever_hash = request.form['reciever']
        token = request.form['token']
        reciever = User.query.filter_by(password_hash=reciever_hash).first()
        if not reciever:
            return render_template("message.html", message='No such reciever found')
        current_user_id = current_user.id
        user_hash = load_user(current_user_id).password_hash
        index = blockchain.new_transaction(user_hash, reciever_hash, token)
        response = {'message': 'Transaction will be added to Block {}'.format({index})}
        return render_template("message.html", message=jsonify(response))
    return render_template('new_transaction.html', title='New Transaction', form=form)


@app.route('/chain', methods=['GET'])
def full_chain():
    response = {
        'chain': blockchain.chain,
        'length': len(blockchain.chain),
    }
    return jsonify(response), 200


@app.route('/nodes/register', methods=['POST'])
def register_nodes():
    values = request.get_json()

    nodes = values.get('nodes')
    if nodes is None:
        return "Error: Please supply a valid list of nodes", 400

    for node in nodes:
        blockchain.register_node(node)

    response = {
        'message': 'New nodes have been added',
        'total_nodes': list(blockchain.nodes),
    }
    return jsonify(response), 201


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
def add_property():
    form = PropertyForm()
    if request.method == 'POST':
        name = request.form['property_name']
        details = request.form['property_details']
        property_info = name + details
        user_hash = current_user.password_hash
        key = blockchain.add_property(property_info, user_hash)
        from blockchain.api.models import Property
        property = Property(token=key, name=name, body=details)
        # TODO: if exists in db then update row to match name and details
        db.session.add(property)
        db.session.commit()
        message = "Property added successfully with key:{}".format(key)
        return render_template('message.html', message=message)
    return render_template('new_property.html', form=form)


@app.route('/write')
def write():
    pickle_filepath = 'picklefile.txt'
    with open(pickle_filepath, 'wb') as pickle_handle:
        pickle.dump(blockchain.chain, pickle_handle)

    return render_template('message.html', message='Succesfully written blockchain')


def read():
    pickle_filepath = 'picklefile.txt'
    if os.path.exists(pickle_filepath):
        with open(pickle_filepath, 'rb') as pickle_handle:
            blockchain.__setattr__('chain', pickle.load(pickle_handle))

read()
