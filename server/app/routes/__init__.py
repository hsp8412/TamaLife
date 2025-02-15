from flask import Blueprint
from app.routes.users import users_bp
from app.routes.tasks import tasks_bp

# Blueprint registration function
def register_blueprints(app):
    app.register_blueprint(users_bp, url_prefix='/api')
    app.register_blueprint(tasks_bp, url_prefix='/api')
