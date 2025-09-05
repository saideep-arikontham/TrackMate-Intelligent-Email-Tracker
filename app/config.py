# in app/config.py

import os
from dotenv import load_dotenv

# Load environment variables from .env file at the project root
dotenv_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(dotenv_path=dotenv_path)

class Config:
    """Set Flask configuration from .env file."""
    # General Config
    SECRET_KEY = os.environ.get('SECRET_KEY') or os.urandom(24)
    
    # Google OAuth Config
    GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET")
    GOOGLE_REDIRECT_URI = "http://localhost:5050/auth/callback" # Note the /auth prefix
    GOOGLE_SCOPES = [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
        'openid',
        'https://www.googleapis.com/auth/gmail.readonly'
    ]
    
    # Ensure OAuth works locally
    os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'