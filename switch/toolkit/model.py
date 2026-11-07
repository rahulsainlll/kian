# model.py: the shapes the toolkit passes around, independent of where the
# data came from (leads, mail, meetings, drafts, and a person's tasks). Backends (demo_backend.py, google_backend.py) produce these;
# ranking.py and kian_tools.py only ever read these.
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from typing import Protocol

# Lead sheet columns, in sheet order. Row changes name one of these.
COLUMNS = ["Company", "Contact", "Email", "Stage", "Value", "Owner", "Last contact", "Next step"]
OPEN_STAGES = {"Qualified", "Discovery", "Proposal", "Pilot"}


@dataclass
class Lead:
    row: int  # 1-based sheet row, header is row 1
    company: str
    contact: str
    email: str
    stage: str
    value: int
    owner: str
    last_contact: datetime | None
    next_step: str

    def get(self, column: str) -> str:
        return {
            "Company": self.company, "Contact": self.contact, "Email": self.email,
            "Stage": self.stage, "Value": str(self.value), "Owner": self.owner,
            "Last contact": self.last_contact.date().isoformat() if self.last_contact else "",
            "Next step": self.next_step,
        }[column]


@dataclass
class Email:
    id: str
    thread_id: str
    sender_name: str
    sender_email: str
    subject: str
    snippet: str
    received: datetime
    answered: bool = False  # the rep's message is the last one in the thread
    bulk: bool = False  # newsletters and other mail no one replies to


@dataclass
class Meeting:
    id: str
    title: str
    start: datetime
    attendees: list[str] = field(default_factory=list)


@dataclass
class Task:
    id: str
    title: str
    due: str  # YYYY-MM-DD, or "" for no date
    done: bool = False
    note: str = ""


@dataclass
class Draft:
    id: str
    to: str
    subject: str
    link: str


class Backend(Protocol):
    """Where the desk's data lives. Read everything; write only drafts and rows."""

    name: str

    def leads(self) -> list[Lead]: ...
    def emails(self) -> list[Email]: ...
    def meetings(self, days: int = 1) -> list[Meeting]: ...
    def thread(self, thread_id: str) -> list[dict]: ...
    def create_draft(self, to: str, subject: str, body: str, thread_id: str | None) -> Draft: ...
    def update_cell(self, row: int, column: str, value: str) -> None: ...
    def check(self) -> dict[str, str]: ...
    # The person's own day: tasks, calendar entries, and sending a draft after a yes
    def tasks(self) -> list[Task]: ...
    def add_task(self, title: str, due: str, note: str) -> Task: ...
    def complete_task(self, task_id: str) -> Task: ...
    def add_event(self, title: str, start: datetime, minutes: int, note: str) -> str: ...
    def send_draft(self, draft_id: str) -> str: ...
