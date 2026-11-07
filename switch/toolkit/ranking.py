# ranking.py: turns the inbox, the calendar and the lead sheet into the
# morning brief, most urgent first. Pure functions over model.py types, so the
# ranking is the same for the demo data and a real Google account, and tests
# can pin it down without a network.
from __future__ import annotations

import re
from dataclasses import dataclass, field
from datetime import datetime, timedelta

from model import OPEN_STAGES, Email, Lead, Meeting

STAGE_WEIGHT = {"Pilot": 25, "Proposal": 30, "Discovery": 20, "Qualified": 10}
PRICE_ASK = re.compile(r"\d{1,2}\s?%|\b(discount|cheaper|price|pricing)\b", re.I)
RESCHEDULE = re.compile(r"\b(move|resched\w*|push|another time|instead)\b", re.I)
STALE_AFTER = timedelta(days=5)


@dataclass
class Item:
    kind: str  # reply | new_sender | meeting | stale
    score: float
    title: str
    detail: str
    company: str
    answers: list[str]
    needs_approval: bool = False
    refs: dict[str, str] = field(default_factory=dict)

    def as_dict(self) -> dict:
        return self.__dict__ | {"score": round(self.score, 1)}


def _company_of(email: Email, leads: list[Lead]) -> Lead | None:
    domain = email.sender_email.split("@")[-1].lower()
    for lead in leads:
        if lead.email.lower() == email.sender_email.lower() or lead.email.split("@")[-1].lower() == domain:
            return lead
    return None


def _company_from_domain(address: str) -> str:
    name = address.split("@")[-1].split(".")[0]
    return re.sub(r"(foods|health|labs|clinics|retail|supply)$", r" \1", name).title()


def rank(leads: list[Lead], emails: list[Email], meetings: list[Meeting], now: datetime) -> list[Item]:
    """Every item that wants the rep today, highest score first."""
    items: list[Item] = []
    for mail in emails:
        if mail.answered or mail.bulk:
            continue
        hours = (now - mail.received).total_seconds() / 3600
        lead = _company_of(mail, leads)
        text = f"{mail.subject} {mail.snippet}"
        if lead is None:
            company = _company_from_domain(mail.sender_email)
            items.append(Item(
                "new_sender", 45 + min(hours, 24) / 2,
                f"New sender: {mail.sender_name} at {company}.",
                f"“{mail.subject}”: {mail.snippet}", company, ["open room", "skip"],
                refs={"email": mail.sender_email, "thread": mail.thread_id},
            ))
            continue
        ask_price = bool(PRICE_ASK.search(text))
        score = 50 + STAGE_WEIGHT.get(lead.stage, 0) + min(hours, 48) / 2 + (15 if ask_price else 0)
        score += 10 if RESCHEDULE.search(text) else 0
        waited = f" Waiting {int(hours)} hours." if hours >= 12 else ""
        items.append(Item(
            "reply", score,
            f"{mail.sender_name} at {lead.company}: “{mail.subject}”{waited}",
            mail.snippet, lead.company, ["done", "skip", "draft"], needs_approval=ask_price,
            refs={"email": mail.sender_email, "thread": mail.thread_id},
        ))
    for meeting in meetings:
        minutes = (meeting.start - now).total_seconds() / 60
        if minutes < -30 or meeting.start.date() != now.date():
            continue
        lead = next((l for l in leads if l.email in meeting.attendees), None)
        company = lead.company if lead else ""
        who = f"{lead.contact} at {lead.company}" if lead else ", ".join(meeting.attendees) or "no guests"
        items.append(Item(
            "meeting", 60 + (20 if 0 <= minutes <= 180 else 0),
            f"{meeting.start:%H:%M}, {meeting.title} with {who}.",
            f"Stage: {lead.stage}. Next step on file: {lead.next_step}." if lead else "",
            company, ["done", "skip"], refs={"event": meeting.id},
        ))
    for lead in leads:
        if lead.stage not in OPEN_STAGES or lead.last_contact is None:
            continue
        quiet = now - lead.last_contact
        if quiet < STALE_AFTER or any(i.company == lead.company for i in items):
            continue
        items.append(Item(
            "stale", 30 + quiet.days,
            f"{lead.company} has been quiet for {quiet.days} days ({lead.stage}).",
            f"Next step on file: {lead.next_step}.", lead.company, ["done", "skip", "draft"],
            refs={"email": lead.email},
        ))
    return sorted(items, key=lambda i: i.score, reverse=True)


def headline(items: list[Item], name: str) -> str:
    """The first line of the brief: how many replies, and the first meeting."""
    replies = sum(1 for i in items if i.kind in ("reply", "new_sender"))
    first = min((i for i in items if i.kind == "meeting"), key=lambda i: i.title, default=None)
    parts = [f"Morning {name}. {replies} {'person' if replies == 1 else 'people'} wrote in"]
    if first:
        parts.append(f"and your first meeting is at {first.title.split(',')[0]}")
    return " ".join(parts) + "."
