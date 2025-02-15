from flask import Blueprint, jsonify
from app.models.users import UserModel

users_bp = Blueprint('users', __name__)

@users_bp.route('/add', methods=['GET'])
def add_user():
    UserModel.insert_user("Alice", 25)
    return jsonify({"message": "User added!"})

@users_bp.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    return jsonify({"message": f"Details of user {user_id}"})
