# test_toolkit.py: pins down the brief's order, the safety rules (no send
# without a named yes, no sheet change without one) and that each person's
# profile keeps its own tasks and calendar, against the demo data. No network, no Google account. Run from this folder:
#   python3 -m unittest -v
from __future__ import annotations

import contextlib
import io
import os
import unittest
from datetime import datetime

os.environ["KIAN_BACKEND"] = "demo"

import kian_tools  # noqa: E402
from demo_backend import DemoBackend  # noqa: E402
from ranking import rank  # noqa: E402

MORNING = datetime(2026, 11, 6, 9, 0)


def run(*argv: str) -> tuple[int, str]:
    out = io.StringIO()
    with contextlib.redirect_stdout(out), contextlib.redirect_stderr(out):
        code = kian_tools.main(list(argv))
    return code, out.getvalue()


class Brief(unittest.TestCase):
    def setUp(self) -> None:
        b = DemoBackend(now=MORNING)
        self.items = rank(b.leads(), b.emails(), b.meetings(), MORNING)

    def test_price_ask_ranks_first_and_needs_approval(self) -> None:
        first = self.items[0]
        self.assertEqual(first.company, "Lumen Health")
        self.assertTrue(first.needs_approval)

    def test_newsletters_and_answered_mail_are_left_out(self) -> None:
        companies = {i.company for i in self.items}
        self.assertNotIn("Saasweekly", companies)
        self.assertNotIn("Orbit Retail", companies)

    def test_unknown_sender_offers_a_room(self) -> None:
        new = [i for i in self.items if i.kind == "new_sender"]
        self.assertEqual([i.company for i in new], ["Harbor Foods"])
        self.assertEqual(new[0].answers, ["open room", "skip"])

    def test_quiet_open_deal_is_listed_once(self) -> None:
        stale = [i.company for i in self.items if i.kind == "stale"]
        self.assertEqual(stale, ["Northwind Supply"])

    def test_every_item_ends_with_answers(self) -> None:
        self.assertTrue(all(i.answers for i in self.items))


class Safety(unittest.TestCase):
    def tearDown(self) -> None:
        DemoBackend.reset()

    def test_send_refuses_without_a_named_yes(self) -> None:
        run("--profile", "test", "draft", "--to", "a@b.example", "--subject", "Hi", "--body", "Hello")
        code, out = run("--profile", "test", "send", "--draft", "draft-1")
        self.assertEqual(code, 2)
        self.assertIn("--approved-by", out)
        code, out = run("--profile", "test", "send", "--draft", "draft-1", "--approved-by", "Mayank")
        self.assertEqual(code, 0)
        self.assertIn("approved by Mayank", out)

    def test_each_profile_keeps_its_own_day(self) -> None:
        run("--profile", "mayank", "tasks", "add", "--title", "Send the proposal")
        _, mayank = run("--profile", "mayank", "agenda")
        _, rahul = run("--profile", "rahul", "agenda")
        self.assertIn("Send the proposal", mayank)
        self.assertNotIn("Send the proposal", rahul)

    def test_schedule_puts_it_on_the_calendar(self) -> None:
        run("--profile", "yukti", "schedule", "--title", "Call Priya", "--at", "2026-11-07 15:00")
        _, out = run("--profile", "yukti", "agenda")
        self.assertIn("Call Priya", out)

    def test_row_apply_needs_a_named_approver(self) -> None:
        code, out = run("row", "apply", "--company", "Lumen Health", "--column", "Stage", "--value", "Won")
        self.assertEqual(code, 2)
        self.assertIn("--approved-by", out)

    def test_row_change_shows_old_and_new_then_applies(self) -> None:
        code, out = run("row", "propose", "--company", "lumen-health", "--column", "Stage", "--value", "Negotiation")
        self.assertEqual(code, 0)
        self.assertIn("Proposal → Negotiation", out)
        run("row", "apply", "--company", "Lumen Health", "--column", "Stage", "--value", "Negotiation", "--approved-by", "Yukti")
        lead = kian_tools.find_lead(DemoBackend().leads(), "Lumen Health")
        self.assertEqual(lead.stage if lead else None, "Negotiation")

    def test_draft_is_saved_not_sent(self) -> None:
        code, out = run("draft", "--to", "priya@lumenhealth.example", "--subject", "Re: Tuesday", "--body", "Tuesday works.")
        self.assertEqual(code, 0)
        self.assertIn("not sent", out)


if __name__ == "__main__":
    unittest.main()
