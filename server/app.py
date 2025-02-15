from flask import Flask, request, jsonify
import pickle
import jwt
import datetime
from flask_cors import CORS
from functools import wraps

app = Flask(__name__)
CORS(app)

SECRET_KEY = "our_secret_key"

users = [
    {
        "username": "123456789",
        "password": "password",
        "firstName": "John",
        "lastName": "Doe",
        "voted": False
    },
    {
        "username": "987654321",
        "password": "password",
        "firstName": "Jane",
        "lastName": "Doe",
        "voted": False
    }
]

# In-memory votes dictionary
votes = {"candidateA": 29900, "candidateB": 33000}

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get("Authorization")
        if not token:
            return jsonify({"message": "Token is missing"}), 401

        try:
            print(token)
            token = token.replace("Bearer ", "")
            token_data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            user_id = token_data["username"]
            
        except jwt.ExpiredSignatureError:
            return jsonify({"message": "Token has expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"message": "Invalid token"}), 401

        # Add the user_id to kwargs for endpoint usage
        return f(user_id, *args, **kwargs)

    return decorated


@app.route('/login', methods=['POST'])
def login():
    auth = request.json
    if not auth or "username" not in auth or "password" not in auth:
        return jsonify({"message": "Missing username or password"}), 400

    username = auth["username"]
    password = auth["password"]

    user = next((u for u in users if u["username"] == username and u["password"] == password), None)

    if user:
        # Generate JWT token
        token = jwt.encode({
            "username": username,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)
        }, SECRET_KEY, algorithm="HS256")

        return jsonify({"token": token})

    return jsonify({"message": "Invalid credentials"}), 401


@app.route('/vote/submit', methods=['POST'])
@token_required
def submit_vote(user_id):
    file = request.files.get("file")
    if not file:
        print("No file provided")
        return "No file provided", 400

    data = file.read()

    try:
        # Deserialize the payload
        vote_data = pickle.loads(data)
    except Exception as e:
        print("Deserialization error:", e)
        return "Invalid payload", 400

    # Process normal payloads

    # Find the user in the list
    user = next((u for u in users if u["username"] == user_id), None)
    if not user:
        return jsonify({"message": "User not found"}), 404

    # Check if user has already voted
    if user["voted"]:
        return jsonify({"message": "User has already voted"}), 403
    
    print(vote_data)
        
    if isinstance(vote_data, dict) and "candidate" in vote_data:
        candidate = vote_data["candidate"]
        if candidate in votes:
            votes[candidate] += 1
            user["voted"] = True  # Mark user as having voted
            return "Vote submitted successfully!"
        else:
            return "Invalid candidate", 400

    return "Payload processed", 200


@app.route('/vote/results', methods=['GET'])
def get_results():
    return jsonify({
        "candidateA": votes['candidateA'],
        "candidateB": votes['candidateB']
    })

@app.route('/validate', methods=['GET'])
def validate():
    token = request.headers.get("Authorization")

    if not token:
        return jsonify({"message": "Token is missing"}), 401

    try:
        # Strip 'Bearer ' prefix from the token
        token = token.replace("Bearer ", "")
        
        # Decode the token
        decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        username = decoded["username"]

        user = next((u for u in users if u["username"] == username), None)
        if not user:
            return jsonify({"message": "User not found"}), 404

        return jsonify({
            "username": user["username"],
            "firstName": user["firstName"],
            "lastName": user["lastName"],
            "voted": user["voted"]
        })

    except jwt.ExpiredSignatureError:
        return jsonify({"message": "Token has expired"}), 401

    except jwt.InvalidTokenError:
        return jsonify({"message": "Invalid token"}), 401

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=True)