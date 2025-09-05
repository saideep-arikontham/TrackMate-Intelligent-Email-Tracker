from flask import Blueprint, session, request, jsonify
from app.services.gmail_client import build_gmail_service, batch_fetch_email_metadata

gmail_bp = Blueprint("gmail", __name__)

@gmail_bp.route("/emails")
def emails():
    if "credentials" not in session:
        return jsonify({"error": "Not authenticated"}), 401

    service = build_gmail_service(session.get("credentials"))
    if not service:
        return jsonify({"error": "Could not create Gmail service"}), 500

    q = request.args.get("q", "is:unread in:inbox newer_than:1d")
    try:
        res = service.users().messages().list(userId="me", maxResults=20, q=q).execute()
        msgs = res.get("messages", [])
        if not msgs:
            return jsonify([])
        return jsonify(batch_fetch_email_metadata(service, msgs))
    except Exception as e:
        print("emails error:", e)
        return jsonify({"error": "Failed to fetch emails"}), 500

@gmail_bp.route("/unread-count")
def unread_count():
    if "credentials" not in session:
        return jsonify({"error": "Not authenticated"}), 401

    service = build_gmail_service(session.get("credentials"))
    if not service:
        return jsonify({"error": "Could not create Gmail service"}), 500

    try:
        res = service.users().messages().list(userId="me", q="is:unread in:inbox newer_than:1d").execute()
        return jsonify({"count": len(res.get("messages", []))})
    except Exception as e:
        print("unread-count error:", e)
        return jsonify({"error": "Failed to fetch count"}), 500
