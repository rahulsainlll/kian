# Kian for a team: an agent for every person

Every teammate gets their own agent. The agents act only with their own person's Google account, and they talk to
each other in one shared room. Ask your agent "take an update from Mayank" and it asks Mayank's agent, which checks
Mayank's tasks and calendar, asks Mayank if it needs to, and answers in the thread. Ask it to "remind Yukti to send
the deck by Friday" and Yukti's agent puts it on Yukti's task list and calendar, and tells her who asked.

```
  rahul ── rahul-desk ── rahul-kian ─┐
  mayank ─ mayank-desk ─ mayank-kian ├── kian-team  (the agents talk here, people watch)
  yukti ── yukti-desk ── yukti-kian ─┘
              │
              └─ each agent: kian_tools.py --profile <its person>  →  that person's Gmail, Calendar, Tasks
```

| Switch feature | What it does here |
|---|---|
| An agent per person | `{name}-kian`, one per teammate, from one template |
| Private rooms | `{name}-desk`: just you and your agent, in Mattermost, the Kian widget or Telegram |
| Agents addressing agents | `send_targeted_message` in `kian-team`, one thread per request, so every hand-over is visible |
| Group template and links | `team.template.yaml` creates the agents, the four rooms and their links in one run |
| Room instructions | The team room states the rule: an agent changes only its own person's tasks, calendar and mail |

## Set it up (about 30 minutes)

### 1. Switch

Install Docker Desktop and [Switch Console](https://github.com/sandbox-quantum/switch/releases/latest), open it, and
finish the first run until switch-buddy answers you. Then:

- **Mattermost accounts:** sign in to the bundled Mattermost (Console shows it under Messaging apps) and create an
  account for each teammate. Teammates on the same network use `http://<your-mac's-ip>:8065`.
- **Default Member:** on the Mattermost connection in Console, set yourself, so rooms agents create have a person in
  them.

### 2. The toolkit

```bash
git clone https://github.com/rahulsainlll/kian ~/kian
cd ~/kian/switch/toolkit
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt   # kian_tools.py uses .venv by itself
python3 kian_tools.py --profile rahul agenda      # Rahul's meetings and tasks
```

### 3. Each person's Google account

1. In Google Cloud Console, create a project and enable the **Gmail, Calendar and Tasks** APIs.
2. Create an OAuth client of type **Desktop app** and save it as `switch/toolkit/credentials.json`.
3. On the **OAuth consent screen**, the app starts in testing mode: add every teammate's Gmail address under **Test
   users**, or their sign-in fails.
4. On the machine that runs the agents, each person signs in once, in the browser that opens:

   ```bash
   python3 kian_tools.py --profile rahul login
   python3 kian_tools.py --profile mayank login
   python3 kian_tools.py --profile yukti login
   ```

   Each makes `token-<name>.json`, which stays on that machine and out of git.

### 4. The agents and rooms

In Switch Console, open **Templates**, choose **Import template**, give it `switch/team.template.yaml`, and run it with
each person's name and Mattermost username. Four rooms appear; each agent says hello in its desk with today's agenda,
and introduces itself in `kian-team`.

### 5. The widget (optional)

In the Kian desktop app, open **Settings → Connectors**, choose **Switch**, and sign in with your Mattermost account.
Then in **Team**, set **Desk room** to your desk (`rahul-desk`). Your agent's questions arrive as cards, and the
hotkey talks straight to it.

## Try it

| Where | Say | What happens |
|---|---|---|
| `rahul-desk` | `take an update from mayank on the Lumen proposal` | rahul-kian asks mayank-kian in `kian-team`; mayank-kian checks Mayank's tasks, asks Mayank in `mayank-desk` if needed, answers in the thread; rahul-kian tells you |
| `rahul-desk` | `remind yukti to send the deck by Friday 5pm` | yukti-kian adds the task and a calendar reminder for Yukti, tells her who asked, and confirms |
| `mayank-desk` | paste meeting notes | mayank-kian summarises, adds Mayank's action items to his tasks, and sends teammates' items to their agents |
| `yukti-desk` | `reply to Priya that Tuesday works` | yukti-kian drafts it and asks `→ send · edit`; it sends only after Yukti says send |
| `rahul-desk` | `what's on today?` | your meetings and open tasks |

## The rules

1. An agent acts only with its own person's account (`--profile`). For anyone else, it asks their agent.
2. Email goes out only after its person says **send** in their desk; the toolkit refuses to send without
   `--approved-by`.
3. Every request between agents is a thread in the team room, so people can see who asked what.
