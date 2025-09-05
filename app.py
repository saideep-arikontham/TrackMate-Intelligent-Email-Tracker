# --- 1. IMPORTS & SETUP ---
import os
import base64
from flask import Flask, session, request, redirect, url_for, jsonify, render_template
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from dotenv import load_dotenv

load_dotenv()

# Initialize the Flask application
app = Flask(__name__, template_folder='.')
# It's crucial to set a secret key for session management
app.secret_key = os.urandom(24) 
# Allows OAuth to work on HTTP for local development
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

# --- 2. GOOGLE OAUTH CONFIGURATION ---
CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")

# This must match the 'Authorized redirect URIs' in your Google Cloud Console
REDIRECT_URI = 'http://localhost:5050/oauth2/callback'

client_secrets_config = {
    "web": {
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "redirect_uris": [REDIRECT_URI]
    }
}

SCOPES = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'openid',
    'https://www.googleapis.com/auth/gmail.readonly'
]

flow = Flow.from_client_config(
    client_config=client_secrets_config,
    scopes=SCOPES,
    redirect_uri=REDIRECT_URI
)

# --- 3. FLASK AUTHENTICATION ROUTES ---
@app.route('/')
def serve_index():
    """Serves the main index.html file."""
    return render_template('static/index.html')

@app.route('/auth/google')
def login():
    """Redirects the user to Google's authentication page."""
    authorization_url, state = flow.authorization_url(prompt='consent')
    session['state'] = state
    return redirect(authorization_url)

# **FIXED**: The route below was changed from '/callback' to '/oauth2/callback'
# to match the REDIRECT_URI, which resolves the "Not Found" error.
@app.route('/oauth2/callback')
def callback():
    """Handles the authentication response from Google."""
    flow.fetch_token(authorization_response=request.url)
    credentials = flow.credentials
    session['credentials'] = {
        'token': credentials.token,
        'refresh_token': credentials.refresh_token,
        'token_uri': credentials.token_uri,
        'client_id': credentials.client_id,
        'client_secret': credentials.client_secret,
        'scopes': credentials.scopes
    }
    return redirect(url_for('serve_index'))

@app.route('/api/auth/status')
def auth_status():
    """Checks if the user is currently authenticated."""
    if 'credentials' in session:
        return jsonify({'isAuthenticated': True})
    return jsonify({'isAuthenticated': False})

@app.route('/logout')
def logout():
    """Clears the user's session."""
    session.clear()
    return redirect(url_for('serve_index'))

# --- 4. GMAIL API ROUTES ---
def get_gmail_service():
    """Builds and returns an authorized Gmail API service object from the session."""
    creds_dict = session.get('credentials')
    if not creds_dict:
        return None
    try:
        credentials = Credentials(**creds_dict)
        service = build('gmail', 'v1', credentials=credentials)
        return service
    except Exception as e:
        print(f"Error building Gmail service: {e}")
        return None

@app.route('/api/emails')
def get_emails():
    """API endpoint to fetch emails based on a query."""
    if 'credentials' not in session:
        return jsonify({'error': 'Not authenticated'}), 401

    query = request.args.get('q', 'is:unread in:inbox newer_than:1d')
    service = get_gmail_service()
    if not service:
        return jsonify({'error': 'Could not create Gmail service'}), 500

    try:
        results = service.users().messages().list(userId='me', q=query).execute()
        messages = results.get('messages', [])
        
        email_list = []
        if not messages:
            return jsonify([])

        batch = service.new_batch_http_request()
        
        def callback_for_batch(request_id, response, exception):
            if exception is None:
                headers = response['payload']['headers']
                subject = next((h['value'] for h in headers if h['name'].lower() == 'subject'), 'No Subject')
                sender = next((h['value'] for h in headers if h['name'].lower() == 'from'), 'Unknown')
                date = next((h['value'] for h in headers if h['name'].lower() == 'date'), '')
                email_list.append({'subject': subject, 'from': sender, 'date': date})
            else:
                print(f"Error in batch request {request_id}: {exception}")

        for msg_summary in messages:
            batch.add(service.users().messages().get(
                userId='me', 
                id=msg_summary['id'], 
                format='metadata',
                metadataHeaders=['Subject', 'From', 'Date']),
                callback=callback_for_batch,
                request_id=msg_summary['id']
            )
        
        batch.execute()
        return jsonify(email_list)

    except Exception as e:
        print(f"An error occurred while fetching emails: {e}")
        return jsonify({'error': 'An error occurred while fetching emails.'}), 500
        
@app.route('/api/unread-count')
def get_unread_count():
    """API endpoint to get the count of unread emails in the last 24 hours."""
    if 'credentials' not in session:
        return jsonify({'error': 'Not authenticated'}), 401

    service = get_gmail_service()
    if not service:
        return jsonify({'error': 'Could not create Gmail service'}), 500
        
    try:
        results = service.users().messages().list(userId='me', q='is:unread in:inbox newer_than:1d').execute()
        messages = results.get('messages', [])
        return jsonify({'count': len(messages)})
    except Exception as e:
        print(f"An error occurred while fetching unread count: {e}")
        return jsonify({'error': 'An error occurred while fetching unread count.'}), 500


# --- 5. RUN THE APP ---
if __name__ == '__main__':
    if not CLIENT_ID or not CLIENT_SECRET:
        print("ERROR: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables are not set.")
        print("Please create a .env file and set them.")
    else:
        app.run(host='localhost', port=5050, debug=True)

