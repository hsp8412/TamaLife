from flask import Blueprint, jsonify

tasks_bp = Blueprint('tasks', __name__)

@tasks_bp.route('/users', methods=['GET'])
def get_users():
    return jsonify({"message": "List of users"})

@tasks_bp.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    return jsonify({"message": f"Details of user {user_id}"})
