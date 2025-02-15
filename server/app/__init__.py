from flask import Flask
from flask_pymongo import PyMongo
from config import Config

mongo = PyMongo()  # Define MongoDB object

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize MongoDB Atlas
    mongo.init_app(app)  

    # Register routes
    from app.routes import register_blueprints
    register_blueprints(app)

    return app
