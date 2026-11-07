# personal.py: the commands a person's own agent uses for that person's day.
#
#   agenda [--days N]                     meetings and open tasks, for "what's on" and updates
#   tasks list | add | done               the person's Google Tasks
#   schedule --title --at "YYYY-MM-DD HH:MM" [--minutes N]   a calendar entry with a reminder
#   send --draft ID --approved-by NAME    send a Gmail draft, only with a named yes
#
# Every command acts on the profile's own account (kian_tools.py --profile), so
# Mayank's agent changes Mayank's calendar and nobody else's. Another person's
# agent asks it in #team instead of reaching into the account.
from __future__ import annotations

import sys
from datetime import date, datetime

from model import Backend


def cmd_agenda(b: Backend, args) -> int:
    now = getattr(b, "now", None) or datetime.now()
    print(f"Meetings (next {args.days} day{'s' if args.days != 1 else ''}):")
    meetings = [m for m in b.meetings(days=args.days) if m.start >= now.replace(hour=0, minute=0)]
    for m in meetings:
        print(f"  {m.start:%a %H:%M}  {m.title}")
    if not meetings:
        print("  none")
    open_tasks = [t for t in b.tasks() if not t.done]
    print("Open tasks:")
    for t in open_tasks:
        late = " (overdue)" if t.due and t.due < date.today().isoformat() else ""
        print(f"  [{t.id}] {t.title}{f' · due {t.due}' if t.due else ''}{late}")
    if not open_tasks:
        print("  none")
    return 0


def cmd_tasks(b: Backend, args) -> int:
    if args.action == "list":
        for t in b.tasks():
            mark = "x" if t.done else " "
            print(f"[{mark}] {t.id}  {t.title}{f' · due {t.due}' if t.due else ''}")
        return 0
    if args.action == "add":
        if not args.title:
            print("tasks add needs --title.", file=sys.stderr)
            return 2
        t = b.add_task(args.title, args.due or "", args.note or "")
        print(f"Task added: [{t.id}] {t.title}{f' · due {t.due}' if t.due else ''}")
        return 0
    if not args.id:
        print("tasks done needs --id (see tasks list).", file=sys.stderr)
        return 2
    t = b.complete_task(args.id)
    print(f"Done: {t.title}")
    return 0


def cmd_schedule(b: Backend, args) -> int:
    try:
        start = datetime.strptime(args.at, "%Y-%m-%d %H:%M")
    except ValueError:
        print('--at must look like "2026-11-08 10:00".', file=sys.stderr)
        return 2
    link = b.add_event(args.title, start, args.minutes, args.note or "")
    print(f"On the calendar: {args.title}, {start:%a %d %b %H:%M} for {args.minutes} min, with a reminder 10 min before.")
    print(link)
    return 0


def cmd_send(b: Backend, args) -> int:
    if not args.approved_by:
        print("send needs --approved-by <the person who said yes in the chat>. Post the draft and ask first.", file=sys.stderr)
        return 2
    message_id = b.send_draft(args.draft)
    print(f"Sent draft {args.draft} (message {message_id}), approved by {args.approved_by}.")
    return 0


def register(sub) -> None:
    """Adds the personal commands to kian_tools.py's parser."""
    s = sub.add_parser("agenda", help="meetings and open tasks")
    s.add_argument("--days", type=int, default=1)
    s.set_defaults(run=cmd_agenda)

    s = sub.add_parser("tasks", help="the person's own task list")
    s.add_argument("action", choices=["list", "add", "done"])
    s.add_argument("--title")
    s.add_argument("--due", help="YYYY-MM-DD")
    s.add_argument("--note")
    s.add_argument("--id")
    s.set_defaults(run=cmd_tasks)

    s = sub.add_parser("schedule", help="add an entry, with a reminder, to the person's calendar")
    s.add_argument("--title", required=True)
    s.add_argument("--at", required=True, help='"YYYY-MM-DD HH:MM", local time')
    s.add_argument("--minutes", type=int, default=30)
    s.add_argument("--note")
    s.set_defaults(run=cmd_schedule)

    s = sub.add_parser("send", help="send a Gmail draft, only after a named yes in the chat")
    s.add_argument("--draft", required=True, help="the draft id that `draft` printed")
    s.add_argument("--approved-by")
    s.set_defaults(run=cmd_send)
