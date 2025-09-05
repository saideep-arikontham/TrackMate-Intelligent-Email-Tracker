from google_auth_oauthlib.flow import Flow

def build_flow(client_id, client_secret, redirect_uri, scopes):
    client_secrets_config = {
        "web": {
            "client_id": client_id,
            "client_secret": client_secret,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "redirect_uris": [redirect_uri],
        }
    }
    return Flow.from_client_config(
        client_config=client_secrets_config,
        scopes=scopes,
        redirect_uri=redirect_uri,
    )
