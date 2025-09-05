# in app/routes/auth.py

from flask import Blueprint, current_app, session, request, redirect, jsonify, url_for, flash
from app.services.google_oauth import build_flow

auth_bp = Blueprint("auth", __name__)

def _make_flow():
    return build_flow(
        current_app.config["GOOGLE_CLIENT_ID"],
        current_app.config["GOOGLE_CLIENT_SECRET"],
        current_app.config["GOOGLE_REDIRECT_URI"],
        current_app.config["GOOGLE_SCOPES"],
    )

@auth_bp.route("/auth/login")
def login():
    flow = _make_flow()
    authorization_url, state = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        prompt="consent select_account",
    )
    session["state"] = state
    session["oauth_cfg"] = {"redirect_uri": current_app.config["GOOGLE_REDIRECT_URI"]}
    return redirect(authorization_url)

@auth_bp.route("/oauth2/callback")  # <-- This is the key change
def callback():
    try:
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
    except Exception as e:
        print("OAuth callback error:", repr(e))
        err = request.args.get("error")
        err_desc = request.args.get("error_description")
        hint = (
            "Common causes: (1) redirect URI mismatch; (2) app in Testing and you're not a Test user; "
            "(3) wrong OAuth client type; (4) Gmail API not enabled."
        )
        return (
            f"<h2>Login failed</h2>"
            f"<pre>{err or ''} {err_desc or ''}</pre>"
            f"<p>{hint}</p>"
            f"<p>Expected redirect URI: <code>{current_app.config['GOOGLE_REDIRECT_URI']}</code></p>",
            400,
        )

@auth_bp.route("/auth/status")
def status():
    return jsonify({"isAuthenticated": "credentials" in session})

@auth_bp.route("/auth/logout")
def logout():
    session.clear()
    return redirect(url_for("views.index"))

@auth_bp.route("/auth/google")
def google_alias():
    return redirect(url_for("auth.login"))