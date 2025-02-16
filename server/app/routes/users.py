from flask import Blueprint, jsonify, request, current_app
from app.models.users import UserModel
from flask_bcrypt import Bcrypt
import jwt
import datetime

from app.utils.auth import token_required

users_bp = Blueprint('users', __name__)
bcrypt = Bcrypt()

@users_bp.route('/register', methods=['POST'])
def register_user():
    data = request.get_json()
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    UserModel.insert_user(data['first_name'], data['last_name'], data['email'], hashed_password, data['pet_name'])
    return jsonify({"message": "User added!"})

@users_bp.route('/login', methods=['POST'])
def login_user():
    data = request.get_json()
    print(data)
    user = UserModel.get_user(data['email'])
    secret_key = current_app.config['SECRET_KEY']
    if user and bcrypt.check_password_hash(user['password'], data['password']):
        token = jwt.encode({
            "email":user['email'],
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)
        }, secret_key, algorithm="HS256")
        return jsonify({"token": token})
    return jsonify({"message": "Invalid credentials"}), 401


@users_bp.route('/test', methods=['GET'])
@token_required
def test_auth(email):
    return jsonify({"message": "Test route", "email": email})