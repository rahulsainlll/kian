#!/usr/bin/env python3
# kian_tools.py: the only way Kian's agents touch Gmail, Calendar and the lead
# Sheet. Agents run it from their Switch rooms:
#
#   brief [--json] [--check]        the ranked morning, most urgent first
#   deal <email or company>         one customer: lead row, threads, meetings
#   meetings [--days N]             upcoming meetings with their lead
#   draft --to --subject --body-file [--thread]   a Gmail draft (prints its id)
#   send --draft ID --approved-by NAME   send it, only after a named yes in the chat
#   row propose|apply ...           show a lead Sheet change, then make it after a yes
#   agenda | tasks | schedule       the person's own day (see personal.py)
#   reset-demo                      forget demo state
#
# --profile NAME (or KIAN_PROFILE) picks whose account: each person's agent
# runs with its own profile, so it only ever touches its own person's Gmail,
# Calendar and Tasks. KIAN_BACKEND=demo (the default until that profile has
# signed in) uses fixtures.json; google uses token-<profile>.json.
from __future__ import annotations

import argparse
import json
import os
import sys
from datetime import datetime
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

import personal  # noqa: E402
from model import COLUMNS, Backend, Lead  # noqa: E402
from ranking import headline, rank  # noqa: E402


def load_env() -> None:
    """Read KEY=value lines from .env beside this file, without overriding the shell."""
    env = HERE / ".env"
    if env.exists():
        for line in env.read_text().splitlines():
            key, sep, value = line.partition("=")
            if sep and not key.strip().startswith("#"):
                os.environ.setdefault(key.strip(), value.strip())


def backend(profile: str = "") -> Backend:
    token = HERE / (f"token-{profile}.json" if profile else "token.json")
    choice = os.environ.get("KIAN_BACKEND") or ("google" if token.exists() else "demo")
    if choice == "google":
        from google_backend import GoogleBackend

        return GoogleBackend(profile)
    from demo_backend import DemoBackend

    return DemoBackend(profile=profile)


def find_lead(leads: list[Lead], key: str) -> Lead | None:
    key = key.lower().strip()
    domain = key.split("@")[-1]
    for lead in leads:
        if key in (lead.email.lower(), lead.company.lower()) or lead.email.lower().endswith("@" + domain):
            return lead
    return next((l for l in leads if key.replace("-", " ") in l.company.lower()), None)


def rep_name() -> str:
    return os.environ.get("KIAN_REP_NAME", "Yukti")


# ── commands ────────────────────────────────────────────────────────────────


def cmd_brief(b: Backend, args) -> int:
    if args.check:
        for source, status in b.check().items():
            print(f"{source}: {status}")
        print(f"Backend: {b.name}")
        return 0
    items = rank(b.leads(), b.emails(), b.meetings(), getattr(b, "now", None) or datetime.now())
    if args.json:
        print(json.dumps({"headline": headline(items, rep_name()), "items": [i.as_dict() for i in items]}, indent=2, default=str))
        return 0
    print(headline(items, rep_name()) + "\n")
    for n, item in enumerate(items, 1):
        print(f"{n}. {item.title}")
        if item.detail:
            print(f"   {item.detail}")
        if item.needs_approval:
            print("   Asks about price: any discount goes to approvals first.")
        print(f"   → {' · '.join(item.answers)}\n")
    return 0


def cmd_deal(b: Backend, args) -> int:
    leads = b.leads()
    lead = find_lead(leads, args.who)
    domain = (lead.email if lead else args.who).split("@")[-1].lower()
    mails = [m for m in b.emails() if m.sender_email.lower().endswith("@" + domain)]
    meetings = [m for m in b.meetings(days=14) if any(a.lower().endswith("@" + domain) for a in m.attendees)]
    if args.json:
        print(json.dumps({"lead": lead.__dict__ if lead else None, "threads": [m.__dict__ for m in mails],
                          "meetings": [m.__dict__ for m in meetings]}, indent=2, default=str))
        return 0
    if lead:
        print(f"{lead.company}: {lead.contact} <{lead.email}>")
        print(f"Stage {lead.stage}, value {lead.value:,}, owner {lead.owner}. Next step: {lead.next_step}.")
    else:
        print(f"No lead row for {args.who}. Ask before adding one.")
    for mail in mails:
        state = "answered" if mail.answered else "waiting for a reply"
        print(f"\nThread {mail.thread_id} ({state}): “{mail.subject}”")
        for msg in b.thread(mail.thread_id):
            print(f"  {msg['from']}: {msg['body']}")
    for m in meetings:
        print(f"\nMeeting {m.start:%a %d %b %H:%M}: {m.title}")
    return 0


def cmd_meetings(b: Backend, args) -> int:
    leads = b.leads()
    for m in b.meetings(days=args.days):
        lead = next((l for l in leads if l.email in m.attendees), None)
        who = f"{lead.contact} at {lead.company} ({lead.stage})" if lead else ", ".join(m.attendees) or "no guests"
        print(f"{m.start:%a %H:%M}  {m.title} with {who}")
    return 0


def cmd_draft(b: Backend, args) -> int:
    body = Path(args.body_file).read_text() if args.body_file else args.body
    if not body:
        print("A draft needs --body or --body-file.", file=sys.stderr)
        return 2
    draft = b.create_draft(args.to, args.subject, body, args.thread)
    print(f"Draft saved, not sent: {draft.link}")
    print(f"To {draft.to}, “{draft.subject}”. Draft id {draft.id}: send it only after a yes in the chat.")
    return 0


def cmd_row(b: Backend, args) -> int:
    if args.column not in COLUMNS:
        print(f"Unknown column {args.column!r}. Columns: {', '.join(COLUMNS)}", file=sys.stderr)
        return 2
    lead = find_lead(b.leads(), args.company)
    if lead is None:
        print(f"No lead row for {args.company}.", file=sys.stderr)
        return 1
    old = lead.get(args.column)
    if args.action == "propose":
        print(f"{lead.company} · {args.column}: {old or '(empty)'} → {args.value}")
        print("Waiting for a yes before changing the sheet.")
        return 0
    if not args.approved_by:
        print("row apply needs --approved-by <the person who said yes>.", file=sys.stderr)
        return 2
    b.update_cell(lead.row, args.column, args.value)
    print(f"Updated {lead.company} · {args.column}: {old or '(empty)'} → {args.value} (approved by {args.approved_by}).")
    return 0


def cmd_reset(_b, _args) -> int:
    from demo_backend import DemoBackend

    DemoBackend.reset()
    print("Demo drafts and sheet edits cleared.")
    return 0


def parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(prog="kian_tools.py", description="Kian's toolkit. Reads the desk's data; sends only with a named yes.")
    p.add_argument("--profile", default=os.environ.get("KIAN_PROFILE", ""), help="whose account: rahul, mayank, yukti…")
    sub = p.add_subparsers(dest="command", required=True)

    s = sub.add_parser("brief", help="the ranked morning")
    s.add_argument("--json", action="store_true")
    s.add_argument("--check", action="store_true", help="only say which sources are reachable")
    s.set_defaults(run=cmd_brief)

    s = sub.add_parser("deal", help="everything about one customer")
    s.add_argument("who", help="an email address, a domain or a company name")
    s.add_argument("--json", action="store_true")
    s.set_defaults(run=cmd_deal)

    s = sub.add_parser("meetings", help="upcoming meetings")
    s.add_argument("--days", type=int, default=1)
    s.set_defaults(run=cmd_meetings)

    s = sub.add_parser("draft", help="save a Gmail draft")
    s.add_argument("--to", required=True)
    s.add_argument("--subject", required=True)
    s.add_argument("--body")
    s.add_argument("--body-file")
    s.add_argument("--thread", help="Gmail thread id, to draft a reply in place")
    s.set_defaults(run=cmd_draft)

    s = sub.add_parser("row", help="change the lead sheet: propose first, apply after a yes")
    s.add_argument("action", choices=["propose", "apply"])
    s.add_argument("--company", required=True)
    s.add_argument("--column", required=True, help=", ".join(COLUMNS))
    s.add_argument("--value", required=True)
    s.add_argument("--approved-by")
    s.set_defaults(run=cmd_row)

    personal.register(sub)

    s = sub.add_parser("reset-demo", help="clear demo drafts and edits")
    s.set_defaults(run=cmd_reset, no_backend=True)
    return p


def main(argv: list[str] | None = None) -> int:
    load_env()
    args = parser().parse_args(argv)
    return args.run(None if getattr(args, "no_backend", False) else backend(args.profile), args)


if __name__ == "__main__":
    sys.exit(main())
