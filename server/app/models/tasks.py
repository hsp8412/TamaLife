from app import mongo
from flask import jsonify

class TaskModel:
    @staticmethod
    def get_tasks(name, age):
          return jsonify({"message": "List of users"})