from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField, BooleanField, HiddenField
from wtforms.validators import ValidationError, DataRequired, Email, EqualTo


# ...

class RegistrationForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired()])
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired()])
    password2 = PasswordField(
        'Repeat Password', validators=[DataRequired(), EqualTo('password')])
    submit = SubmitField('Register')

    def validate_username(self, username):
        from blockchain.api.models import User
        user = User.query.filter_by(username=username.data).first()
        if user is not None:
            raise ValidationError('Please use a different username.')

    def validate_email(self, email):
        from blockchain.api.models import User
        user = User.query.filter_by(email=email.data).first()
        if user is not None:
            raise ValidationError('Please use a different email address.')


class LoginForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired()])
    password = PasswordField('Password', validators=[DataRequired()])
    remember_me = BooleanField('Remember Me')
    submit = SubmitField('Login')


class NewTransactionForm(FlaskForm):
    token = StringField('Token', validators=[DataRequired()])
    reciever = StringField('Reciever', validators=[DataRequired()])
    submit = SubmitField('Transfer Property')


class PropertyForm(FlaskForm):
    property_name = StringField('Property Name', validators=[DataRequired()])
    property_details = StringField('Property Details')
    submit = SubmitField('Add Property')


class MessagesForm(FlaskForm):
    reciever_id = HiddenField('Reciever ID')
    sender_id = HiddenField('Sender ID')
    text = StringField('Body', validators=[DataRequired()])
    property_token = HiddenField('Property Token')
    submit = SubmitField('Send Message')
