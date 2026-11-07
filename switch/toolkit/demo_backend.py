# demo_backend.py: the desk's data from fixtures.json, with no Google account.
#
# Drafts, sheet edits, tasks, calendar entries and sends are kept in
# .demo/state[-<profile>].json next to this file, so a demo run behaves like
# the real thing across commands (a row change shows up in the next `brief`)
# and each person's agent has its own day. `kian_tools.py reset-demo` clears it.
from __future__ import annotations

import json
from datetime import datetime, timedelta
from email.utils import parseaddr
from pathlib import Path

from model import COLUMNS, Draft, Email, Lead, Meeting, Task

HERE = Path(__file__).resolve().parent
FIXTURES = HERE / "fixtures.json"


def state_file(profile: str = "") -> Path:
    return HERE / ".demo" / (f"state-{profile}.json" if profile else "state.json")


def load_fixtures() -> dict:
    return json.loads(FIXTURES.read_text())


def _at_today(clock: str, now: datetime) -> datetime:
    hour, minute = (int(x) for x in clock.split(":"))
    return now.replace(hour=hour, minute=minute, second=0, microsecond=0)


class DemoBackend:
    name = "demo"

    def __init__(self, now: datetime | None = None, profile: str = "") -> None:
        self.file = state_file(profile)
        # The demo is always this morning at 9:00, so the brief looks the same whenever it runs.
        self.now = now or datetime.now().replace(hour=9, minute=0, second=0, microsecond=0)
        self.data = load_fixtures()
        blank = {"drafts": [], "cells": {}, "tasks": [], "events": [], "sent": []}
        self.state = blank | (json.loads(self.file.read_text()) if self.file.exists() else {})

    def _save(self) -> None:
        self.file.parent.mkdir(exist_ok=True)
        self.file.write_text(json.dumps(self.state, indent=2))

    def leads(self) -> list[Lead]:
        out = []
        for i, raw in enumerate(self.data["leads"]):
            row = i + 2
            lead = Lead(
                row, raw["company"], raw["contact"], raw["email"], raw["stage"], raw["value"],
                raw["owner"], self.now - timedelta(days=raw["days_ago"]), raw["next_step"],
            )
            for column, value in self.state["cells"].get(str(row), {}).items():
                _apply(lead, column, value)
            out.append(lead)
        return out

    def emails(self) -> list[Email]:
        out = []
        for raw in self.data["emails"]:
            name, address = parseaddr(raw["from"])
            out.append(Email(
                raw["id"], raw["thread"], name, address, raw["subject"], raw["body"],
                self.now - timedelta(hours=raw["hours_ago"]),
                answered=raw.get("answered", False),
                bulk=raw.get("bulk", False),
            ))
        return out

    def meetings(self, days: int = 1) -> list[Meeting]:
        fixed = [Meeting(m["id"], m["title"], _at_today(m["today_at"], self.now), m["attendees"]) for m in self.data["meetings"]]
        added = [Meeting(f"e{i}", e["title"], datetime.fromisoformat(e["start"]), []) for i, e in enumerate(self.state["events"])]
        horizon = self.now + timedelta(days=days)
        return sorted([m for m in fixed + added if m.start <= horizon], key=lambda m: m.start)

    def thread(self, thread_id: str) -> list[dict]:
        return [{"from": m["from"], "subject": m["subject"], "body": m["body"]} for m in self.data["emails"] if m["thread"] == thread_id]

    def create_draft(self, to: str, subject: str, body: str, thread_id: str | None) -> Draft:
        draft_id = f"demo-draft-{len(self.state['drafts']) + 1}"
        self.state["drafts"].append({"id": draft_id, "to": to, "subject": subject, "body": body, "thread": thread_id})
        self._save()
        return Draft(draft_id, to, subject, f"demo://drafts/{draft_id}")

    def update_cell(self, row: int, column: str, value: str) -> None:
        if column not in COLUMNS:
            raise ValueError(f"unknown column {column!r}; one of {', '.join(COLUMNS)}")
        self.state["cells"].setdefault(str(row), {})[column] = value
        self._save()

    def check(self) -> dict[str, str]:
        return {"Gmail": "demo data", "Calendar": "demo data", "Lead sheet": "demo data"}

    def tasks(self) -> list[Task]:
        return [Task(**t) for t in self.state["tasks"]]

    def add_task(self, title: str, due: str, note: str) -> Task:
        task = Task(f"t{len(self.state['tasks']) + 1}", title, due, False, note)
        self.state["tasks"].append(task.__dict__)
        self._save()
        return task

    def complete_task(self, task_id: str) -> Task:
        for t in self.state["tasks"]:
            if t["id"] == task_id:
                t["done"] = True
                self._save()
                return Task(**t)
        raise ValueError(f"no task {task_id}")

    def add_event(self, title: str, start: datetime, minutes: int, note: str) -> str:
        self.state["events"].append({"title": title, "start": start.isoformat(), "minutes": minutes, "note": note})
        self._save()
        return f"demo://calendar/{len(self.state['events'])}"

    def send_draft(self, draft_id: str) -> str:
        draft = next((d for d in self.state["drafts"] if d["id"] == draft_id), None)
        if draft is None:
            raise ValueError(f"no draft {draft_id}")
        self.state["sent"].append(draft_id)
        self._save()
        return f"demo-sent-{draft_id}"

    @staticmethod
    def reset() -> None:
        for f in (HERE / ".demo").glob("state*.json"):
            f.unlink()


def _apply(lead: Lead, column: str, value: str) -> None:
    if column == "Value":
        lead.value = int(value)
    elif column == "Last contact":
        lead.last_contact = datetime.fromisoformat(value)
    else:
        attr = column.lower().replace(" ", "_")
        setattr(lead, attr, value)
