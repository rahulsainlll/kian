#!/usr/bin/env python3
# seed.py: puts the demo morning into a fresh Google account, so the real
# agents have a real inbox, calendar and lead Sheet to work from.
#
# It creates the "Kian leads" Sheet, places fixtures.json's emails in the
# inbox (inserted, not sent: nobody receives anything) and adds today's two
# meetings with invitations switched off. Use a throwaway account. Run:
#   python3 seed.py            then put the printed KIAN_SHEET_ID in .env
from __future__ import annotations

import base64
import sys
from datetime import datetime, timedelta
from email.message import EmailMessage
from email.utils import format_datetime
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

from demo_backend import load_fixtures  # noqa: E402
from google_backend import credentials  # noqa: E402
from model import COLUMNS  # noqa: E402

# Wider than the toolkit's own scopes, and kept in a separate token, because
# only seeding needs to insert mail and create events.
SEED_SCOPES = [
    "https://www.googleapis.com/auth/gmail.insert",
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/calendar.events",
    "https://www.googleapis.com/auth/spreadsheets",
]


def seed_sheet(sheets, data: dict, now: datetime) -> str:
    made = sheets.spreadsheets().create(body={
        "properties": {"title": "Kian leads (demo)"},
        "sheets": [{"properties": {"title": "Leads", "gridProperties": {"frozenRowCount": 1}}}],
    }).execute()
    rows = [COLUMNS] + [[
        lead["company"], lead["contact"], lead["email"], lead["stage"], lead["value"], lead["owner"],
        (now - timedelta(days=lead["days_ago"])).date().isoformat(), lead["next_step"],
    ] for lead in data["leads"]]
    sheets.spreadsheets().values().update(
        spreadsheetId=made["spreadsheetId"], range="Leads!A1", valueInputOption="USER_ENTERED", body={"values": rows},
    ).execute()
    return made["spreadsheetId"]


def seed_inbox(gmail, data: dict, now: datetime) -> int:
    me = gmail.users().getProfile(userId="me").execute()["emailAddress"]
    for mail in data["emails"]:
        msg = EmailMessage()
        msg["From"], msg["To"], msg["Subject"] = mail["from"], me, mail["subject"]
        msg["Date"] = format_datetime((now - timedelta(hours=mail["hours_ago"])).astimezone())
        if mail.get("bulk"):
            msg["List-Unsubscribe"] = "<mailto:unsubscribe@saasweekly.example>"
        msg.set_content(mail["body"])
        labels = ["INBOX"] + ([] if mail.get("answered") else ["UNREAD"])
        gmail.users().messages().insert(
            userId="me", internalDateSource="dateHeader",
            body={"raw": base64.urlsafe_b64encode(msg.as_bytes()).decode(), "labelIds": labels},
        ).execute()
    return len(data["emails"])


def seed_calendar(calendar, data: dict, now: datetime) -> int:
    for meeting in data["meetings"]:
        hour, minute = (int(x) for x in meeting["today_at"].split(":"))
        start = now.replace(hour=hour, minute=minute, second=0, microsecond=0).astimezone()
        calendar.events().insert(calendarId="primary", sendUpdates="none", body={
            "summary": meeting["title"],
            "start": {"dateTime": start.isoformat()},
            "end": {"dateTime": (start + timedelta(minutes=30)).isoformat()},
            "attendees": [{"email": a} for a in meeting["attendees"]],
        }).execute()
    return len(data["meetings"])


def main() -> int:
    from googleapiclient.discovery import build

    creds = credentials(SEED_SCOPES, token_file="token-seed.json")
    data, now = load_fixtures(), datetime.now()
    sheet_id = seed_sheet(build("sheets", "v4", credentials=creds, cache_discovery=False), data, now)
    mails = seed_inbox(build("gmail", "v1", credentials=creds, cache_discovery=False), data, now)
    events = seed_calendar(build("calendar", "v3", credentials=creds, cache_discovery=False), data, now)
    print(f"Seeded {len(data['leads'])} leads, {mails} emails and {events} meetings.")
    print(f"Add this to switch/toolkit/.env:\nKIAN_SHEET_ID={sheet_id}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
