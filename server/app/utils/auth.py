from flask import request, jsonify, current_app
from functools import wraps
from app.models.users import UserModel
import jwt

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get("Authorization")
        if not token:
            return jsonify({"message": "Token is missing"}), 401
        
        try:
            token = token.replace("Bearer ", "")  # Remove "Bearer" prefix if present
            decoded = jwt.decode(token, current_app.config["SECRET_KEY"], algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            return jsonify({"message": "Token has expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"message": "Invalid token"}), 401

        email = decoded['email']

        return f(email, *args, **kwargs) 

    return decorated
