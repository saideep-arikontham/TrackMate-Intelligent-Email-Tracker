from typing import List
from datetime import datetime, timedelta
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request

from .models import Email


class GmailService:
    """Gmail API service using stored OAuth2 credentials"""

    def __init__(self, credentials: Credentials):
        self.creds = credentials
        if self.creds and self.creds.expired and self.creds.refresh_token:
            self.creds.refresh(Request())
        self.service = build("gmail", "v1", credentials=self.creds, cache_discovery=False)

    def _list_messages(self, query: str) -> List[dict]:
        user_id = "me"
        response = self.service.users().messages().list(userId=user_id, q=query, maxResults=25).execute()
        messages = response.get("messages", [])
        return messages

    def _get_message(self, msg_id: str) -> dict:
        user_id = "me"
        msg = (
            self.service.users()
            .messages()
            .get(userId=user_id, id=msg_id, format="metadata", metadataHeaders=["Subject", "From", "Date"])
            .execute()
        )
        return msg

    def _parse_email(self, msg: dict) -> Email:
        headers = {h["name"].lower(): h["value"] for h in msg.get("payload", {}).get("headers", [])}
        subject = headers.get("subject", "(no subject)")
        sender = headers.get("from", "")
        internal_date_ms = int(msg.get("internalDate", 0))
        date_val = datetime.fromtimestamp(internal_date_ms / 1000)
        snippet = msg.get("snippet", "")
        label_ids = msg.get("labelIds", [])
        has_attachments = any(p.get("filename") for p in msg.get("payload", {}).get("parts", []) or [])

        return Email(
            id=msg.get("id"),
            thread_id=msg.get("threadId"),
            subject=subject,
            sender=sender,
            date=date_val,
            snippet=snippet,
            labels=label_ids,
            is_unread="UNREAD" in label_ids,
            has_attachments=has_attachments,
        )

    def get_unread_emails_24h(self) -> List[Email]:
        query = "is:unread newer_than:1d"
        messages = self._list_messages(query)
        emails: List[Email] = []
        for m in messages:
            full = self._get_message(m["id"])
            emails.append(self._parse_email(full))
        return emails

    def get_requires_attention_emails(self) -> List[Email]:
        # You can customize the label name in Gmail and apply to messages
        query = 'label:REQUIRES_ATTENTION'
        messages = self._list_messages(query)
        emails: List[Email] = []
        for m in messages:
            full = self._get_message(m["id"])
            emails.append(self._parse_email(full))
        return emails

    def get_email_by_id(self, email_id: str) -> dict:
        user_id = "me"
        msg = self.service.users().messages().get(userId=user_id, id=email_id, format="full").execute()
        return msg

    def sync_emails(self) -> dict:
        # Placeholder sync method; you can extend to persist messages in DB
        unread = self.get_unread_emails_24h()
        attention = self.get_requires_attention_emails()
        return {
            "synced_count": len(unread) + len(attention),
            "new_unread": len(unread),
            "requires_attention": len(attention),
            "last_sync": datetime.now().isoformat(),
        }
