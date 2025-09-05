# app/services/gmail_client.py
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials

def build_gmail_service(creds_dict):
    if not creds_dict:
        return None
    creds = Credentials(**creds_dict)
    return build("gmail", "v1", credentials=creds)

def batch_fetch_email_metadata(service, messages):
    email_list = []
    batch = service.new_batch_http_request()

    def _cb(request_id, response, exception):
        if exception is None and response:
            headers = response.get("payload", {}).get("headers", [])
            def get_header(name, default=""):
                return next((h["value"] for h in headers if h.get("name", "").lower() == name), default)
            email_list.append({
                "id": response.get("id"),
                "subject": get_header("subject", "No Subject"),
                "from":    get_header("from", "Unknown"),
                "date":    get_header("date", ""),
            })

    for m in messages:
        batch.add(
            service.users().messages().get(
                userId="me",
                id=m["id"],
                format="metadata",
                metadataHeaders=["Subject", "From", "Date"],
            ),
            callback=_cb,
            request_id=m["id"],
        )
    batch.execute()
    return email_list