# in app/__init__.py

from flask import Flask
from .config import Config

def create_app():
    """Application factory function."""
    app = Flask(__name__,
                template_folder='../templates',
                static_folder='../static')
    
    # Load the configuration from the Config object
    app.config.from_object(Config)

    # Register blueprints
    from .routes.auth import auth_bp
    from .routes.views import views_bp # Assuming you have a views.py for regular pages
    # Add other blueprints like gmail_bp here

    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(views_bp, url_prefix='/')
    # app.register_blueprint(gmail_bp, url_prefix='/api/gmail')

    return app