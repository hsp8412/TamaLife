from flask import Blueprint, jsonify
from app.models import UserModel

main = Blueprint('main', __name__)

@main.route('/add', methods=['GET'])
def add_user():
    UserModel.insert_user("Alice", 25)
    return jsonify({"message": "User added!"})

@main.route('/get', methods=['GET'])
def get_users():
    users = UserModel.get_users()
    return jsonify(users)
