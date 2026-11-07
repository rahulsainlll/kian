# Kian on Switch

Everything Kian needs on the Switch side: the templates, the agents' toolkit and the demo data.

**For a team, start with [TEAM.md](TEAM.md):** an agent for every person, talking to each other in one room.
The sales desk below is one team's setup on top of it. The website and the
desktop widget are clients of the rooms this creates; they hold no work of their own.

```
switch/
  team.template.yaml       an agent per person, their desks, and the room where the agents talk
  TEAM.md                  how to set up the team version
  kian.template.yaml       the sales desk: 3 agents, a room group of 3 rooms, links
  deal-room.template.yaml  one customer's room, for opening a deal by hand
  toolkit/
    kian_tools.py          brief, deal, meetings, draft, send (with a named yes), row, login
    personal.py            agenda, tasks, schedule: each person's own day
    ranking.py             how the morning is ranked
    demo_backend.py        fixtures.json as if it were Gmail, Calendar and Sheets
    google_backend.py      the same against a real Google account
    seed.py                loads the demo morning into a throwaway Google account
    fixtures.json          7 leads, 6 emails, 2 meetings, all synthetic
    test_toolkit.py        ranking and safety rules, no network
```

## What gets created

| | Who | What it does | Who can address it |
|---|---|---|---|
| Agent | **kian** | Ranks the morning, opens a room per deal, hands work over by name, asks for sign-off | Anyone in its rooms |
| Agent | **kian-scribe** | Drafts replies, writes meeting notes, keeps each deal's summary | You and your agents |
| Agent | **kian-studio** | Turns four spoken answers into a LinkedIn post, an X thread and a video brief | Anyone in its rooms |
| Room | **kian-desk** | Your morning, one item per message, answered in its thread | |
| Room | **kian-approvals** | Private. Prices and discounts wait for the sales lead | |
| Room | **kian-content** | Where kian-studio works | |
| Rooms | **deal-&lt;company&gt;** | Private, one per customer, opened by kian with kian-scribe and the rep | |

### How each Switch feature is used

- **Group template, links and kickoffs.** One import creates the agents, the room group and its links. Each room's
  kickoff wakes its agent, which says hello and checks its sources.
- **Room instructions.** The four rules sit on the rooms themselves, so they hold for every agent and person there.
- **Agents opening rooms.** kian calls `create_room` for each new customer, with kian-scribe and the rep in it.
- **Agents addressing agents.** kian hands work to kian-scribe with `send_targeted_message`, in the deal room where
  everyone can see the hand-off.
- **Addressing.** Only you and your agents can brief kian-scribe, so nobody else can get it to write to a customer.
- **Room documents** stand in for tasks and decisions, which Switch doesn't have as objects. kian keeps a
  "Decisions" document in approvals: one line per yes or no, with a name and a date. kian-scribe keeps a "Deal
  summary" document in every deal room, with next steps, owners and dates. Each agent owns the document it
  created, so nobody else can rewrite the record.
- **Bridges.** The rooms live on Mattermost, and the desk agent also works from a Telegram group (below).

### The answer line

Every agent message that needs a person ends with one line of answers:

```
→ done · skip · draft
→ approve (hold) · refuse
```

People reply in the thread with one of the answers or in their own words. The desktop widget reads this line and
turns it into buttons. `(hold)` means press and hold, for the one action that must not happen by accident.

## Run it

### 1. Switch

1. Install Docker Desktop and Switch Console, then follow the quickstart until a Claude agent answers you in
   Mattermost. Console starts a local Mattermost and shows its sign-in under Messaging apps.
2. In Switch Console, on the Mattermost connection under **Messaging apps**, set **Default Member** to yourself.
   Otherwise a private room an agent creates has no people in it.

### 2. The toolkit

```bash
git clone https://github.com/rahulsainlll/kian ~/kian
cd ~/kian/switch/toolkit
python3 kian_tools.py brief          # demo data, no setup needed
python3 -m unittest -v               # 9 tests, no network
```

The agents run the toolkit by path, so clone it on the machine they run on. The template's **Toolkit folder** field
defaults to `~/kian/switch/toolkit`.

### 3. The desk

In Switch Console, open the **Templates** page, select **Import template**, give it `switch/kian.template.yaml`, then run
it and fill in:

- **Desk name**: `kian`, unless that name is taken on your server.
- **Sales lead**: the Mattermost username whose yes approves a price. Use your own to try it alone.

Create it. Three rooms appear in Mattermost, each agent says hello, and kian reports which sources it can reach.
Say `morning` in **kian-desk**.

### 4. A real Google account (optional)

The desk runs on demo data until you connect Google. Use a throwaway account, never one with real customers.

1. In Google Cloud Console, create a project and enable the Gmail, Calendar and Sheets APIs. Create an OAuth client
   of type **Desktop app**, download it as `switch/toolkit/credentials.json`, and add your account as a test user.
2. Install the client and seed the account:

   ```bash
   python3 -m venv .venv && .venv/bin/pip install -r requirements.txt   # kian_tools.py uses .venv by itself
   python3 seed.py                    # signs in, then prints KIAN_SHEET_ID
   cp .env.example .env               # set KIAN_SHEET_ID, and KIAN_BACKEND=google
   python3 kian_tools.py brief --check
   ```

The toolkit asks for Gmail read and compose, Calendar read, and Sheets. Compose is the scope Gmail needs for drafts.
`send` refuses to run without `--approved-by`, and a test checks that.

### 5. Telegram (optional)

Telegram bots can't create groups, so this one step is by hand:

1. Make a bot with @BotFather and turn **Group Privacy off** before adding it anywhere.
2. In Switch Console go to **Messaging apps**, choose **Connect**, then **Telegram**, and enter the bot's token and
   username.
3. Create a Telegram group, add the bot, and Switch makes it a room. Post once and link your account.
4. In the group, send `!invite-agent @kian`. Saying `morning` there gets you the same brief on your phone.

A Switch room lives on one messaging app, so this Telegram room is a second desk rather than a mirror of kian-desk.

### 6. Open a deal by hand (optional)

kian opens deal rooms itself. To open one yourself, import `deal-room.template.yaml` with the company and the
contact's email (Templates, Import template, then run it); kian loads the history and kian-scribe starts the deal summary.

## The rules

1. Never send an email or a message without its owner's yes in the chat. Create a Gmail draft and post its link.
2. Never change a price or a discount without a decision recorded in kian-approvals.
3. Before writing to the lead Sheet, post the column, the old value and the new value, and wait for a yes.
4. When unsure who a sender is, ask in kian-desk rather than guess.

Rule 1 is enforced by the toolkit, whose `send` needs `--approved-by`. Rules 2 and 3 are enforced by the room instructions
and by `row apply`, which refuses to run without `--approved-by`.
