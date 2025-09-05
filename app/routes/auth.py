# app/routes/auth.py

from flask import Blueprint, current_app, session, request, redirect, url_for, jsonify
from app.services.google_oauth import build_flow

auth_bp = Blueprint("auth", __name__)

def _make_flow():
    return build_flow(
        current_app.config["GOOGLE_CLIENT_ID"],
        current_app.config["GOOGLE_CLIENT_SECRET"],
        current_app.config["GOOGLE_REDIRECT_URI"],
        current_app.config["GOOGLE_SCOPES"],
    )

@auth_bp.route("/login")
def login():
    flow = _make_flow()
    authorization_url, state = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="false",
        prompt="select_account consent"
    )
    session["state"] = state
    return redirect(authorization_url)

@auth_bp.route("/oauth2/callback")
def callback():
    # Optional: validate state to prevent CSRF
    state = session.get("state")
    if state and state != request.args.get("state"):
        return ("Invalid state parameter.", 400)

    flow = _make_flow()
    flow.fetch_token(authorization_response=request.url)
    creds = flow.credentials
    session["credentials"] = {
        "token": creds.token,
        "refresh_token": getattr(creds, "refresh_token", None),
        "token_uri": creds.token_uri,
        "client_id": creds.client_id,
        "client_secret": creds.client_secret,
        "scopes": creds.scopes,
    }
    return redirect(url_for("views.index"))


@auth_bp.route("/status")
def status():
    return jsonify({"isAuthenticated": "credentials" in session})

@auth_bp.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("views.index"))

@auth_bp.route("/google")
def google_alias():
    return redirect(url_for("auth.login"))