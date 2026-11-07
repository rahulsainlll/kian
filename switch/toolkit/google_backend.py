# google_backend.py: the desk's data from a real Google account.
#
# Reads Gmail, Calendar and the lead Sheet; writes only Gmail drafts and Sheet
# cells. Signs in once with a desktop OAuth client (credentials.json) and keeps
# the token in token.json beside this file. There is deliberately no method
# that sends mail: the toolkit cannot send even if an agent asks it to.
from __future__ import annotations

import base64
import os
from datetime import datetime, timedelta, timezone
from email.message import EmailMessage
from email.utils import parseaddr, parsedate_to_datetime
from pathlib import Path

from model import COLUMNS, Draft, Email, Lead, Meeting

HERE = Path(__file__).resolve().parent
SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.compose",  # drafts; the toolkit never calls send
    "https://www.googleapis.com/auth/calendar.readonly",
    "https://www.googleapis.com/auth/spreadsheets",
]
RANGE = "Leads!A1:H200"


def credentials(scopes: list[str], token_file: str = "token.json"):
    """Load or create OAuth credentials for the given scopes."""
    from google.auth.transport.requests import Request
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow

    token = HERE / token_file
    creds = Credentials.from_authorized_user_file(str(token), scopes) if token.exists() else None
    if creds and creds.expired and creds.refresh_token:
        creds.refresh(Request())
    if not creds or not creds.valid:
        client = Path(os.environ.get("KIAN_GOOGLE_CREDENTIALS", HERE / "credentials.json"))
        flow = InstalledAppFlow.from_client_secrets_file(str(client), scopes)
        creds = flow.run_local_server(port=0)
        token.write_text(creds.to_json())
    return creds


def _header(msg: dict, name: str) -> str:
    return next((h["value"] for h in msg["payload"]["headers"] if h["name"].lower() == name.lower()), "")


def _date(value: str) -> datetime | None:
    try:
        return datetime.fromisoformat(value)
    except ValueError:
        return None


class GoogleBackend:
    name = "google"

    def __init__(self) -> None:
        from googleapiclient.discovery import build

        creds = credentials(SCOPES)
        self.gmail = build("gmail", "v1", credentials=creds, cache_discovery=False)
        self.calendar = build("calendar", "v3", credentials=creds, cache_discovery=False)
        self.sheets = build("sheets", "v4", credentials=creds, cache_discovery=False)
        self.sheet_id = os.environ.get("KIAN_SHEET_ID", "")
        self._me: str | None = None

    def me(self) -> str:
        if self._me is None:
            self._me = self.gmail.users().getProfile(userId="me").execute()["emailAddress"].lower()
        return self._me

    def leads(self) -> list[Lead]:
        if not self.sheet_id:
            raise RuntimeError("KIAN_SHEET_ID is not set; run seed.py or put your sheet's id in .env")
        rows = self.sheets.spreadsheets().values().get(spreadsheetId=self.sheet_id, range=RANGE).execute().get("values", [])
        out = []
        for i, row in enumerate(rows[1:], start=2):
            row = (row + [""] * len(COLUMNS))[: len(COLUMNS)]
            company, contact, email, stage, value, owner, last, step = row
            if company:
                out.append(Lead(i, company, contact, email, stage, int(value or 0), owner, _date(last), step))
        return out

    def emails(self) -> list[Email]:
        listing = self.gmail.users().threads().list(userId="me", q="in:inbox newer_than:3d", maxResults=30).execute()
        out = []
        for ref in listing.get("threads", []):
            thread = self.gmail.users().threads().get(
                userId="me", id=ref["id"], format="metadata",
                metadataHeaders=["From", "Subject", "Date", "List-Unsubscribe"],
            ).execute()
            first, last = thread["messages"][0], thread["messages"][-1]
            name, address = parseaddr(_header(first, "From"))
            if address.lower() == self.me():
                continue
            out.append(Email(
                last["id"], thread["id"], name or address, address, _header(first, "Subject"), last.get("snippet", ""),
                parsedate_to_datetime(_header(last, "Date")).astimezone().replace(tzinfo=None),
                answered=parseaddr(_header(last, "From"))[1].lower() == self.me(),
                bulk=bool(_header(first, "List-Unsubscribe")) or "CATEGORY_PROMOTIONS" in first.get("labelIds", []),
            ))
        return out

    def meetings(self, days: int = 1) -> list[Meeting]:
        start = datetime.now(timezone.utc).astimezone().replace(hour=0, minute=0, second=0, microsecond=0)
        events = self.calendar.events().list(
            calendarId="primary", timeMin=start.isoformat(), timeMax=(start + timedelta(days=days)).isoformat(),
            singleEvents=True, orderBy="startTime",
        ).execute().get("items", [])
        out = []
        for ev in events:
            when = ev["start"].get("dateTime")
            if not when:
                continue  # all-day events are not meetings
            guests = [a["email"] for a in ev.get("attendees", []) if not a.get("self")]
            out.append(Meeting(ev["id"], ev.get("summary", "Meeting"), datetime.fromisoformat(when).replace(tzinfo=None), guests))
        return out

    def thread(self, thread_id: str) -> list[dict]:
        thread = self.gmail.users().threads().get(userId="me", id=thread_id, format="full").execute()
        return [{"from": _header(m, "From"), "subject": _header(m, "Subject"), "body": m.get("snippet", "")} for m in thread["messages"]]

    def create_draft(self, to: str, subject: str, body: str, thread_id: str | None) -> Draft:
        msg = EmailMessage()
        msg["To"], msg["Subject"] = to, subject
        msg.set_content(body)
        draft = {"message": {"raw": base64.urlsafe_b64encode(msg.as_bytes()).decode()}}
        if thread_id:
            draft["message"]["threadId"] = thread_id
        made = self.gmail.users().drafts().create(userId="me", body=draft).execute()
        link = f"https://mail.google.com/mail/u/0/#drafts?compose={made['message']['id']}"
        return Draft(made["id"], to, subject, link)

    def update_cell(self, row: int, column: str, value: str) -> None:
        cell = f"Leads!{chr(ord('A') + COLUMNS.index(column))}{row}"
        self.sheets.spreadsheets().values().update(
            spreadsheetId=self.sheet_id, range=cell, valueInputOption="USER_ENTERED", body={"values": [[value]]},
        ).execute()

    def check(self) -> dict[str, str]:
        status = {}
        for label, probe in (("Gmail", self.me), ("Calendar", lambda: self.meetings(1)), ("Lead sheet", self.leads)):
            try:
                probe()
                status[label] = "ok"
            except Exception as err:  # report every source, not just the first failure
                status[label] = f"failed: {err}"
        return status
