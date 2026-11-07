# Kian: the whole picture

For anyone writing about Kian: what it is, what it can do, how each part works, and how it was built.

## In one line

**Everyone on the team gets their own AI agent, and the agents work together in Switch rooms.** You ask your agent;
it asks your teammate's agent; that agent acts on your teammate's own account and tells them who asked.

## The problem

Teams lose hours to coordination: "did Mayank send the proposal?", "remind Yukti about the deck", follow-ups after
every meeting, status pings that interrupt everyone. Personal AI assistants don't fix this, because they only know one
person. The work that hurts is *between* people.

## What Kian can do

| Ask your agent | What happens |
|---|---|
| "Remind Mayank to send the Lumen proposal by tomorrow 10am" | Your agent asks Mayank's agent in the team room. Mayank's agent adds it to Mayank's tasks and calendar with a reminder, tells Mayank who asked, and confirms back. |
| "Take an update from Mayank on the Lumen proposal" | Mayank's agent checks his tasks and calendar; if that doesn't answer it, it asks Mayank in his desk and passes the answer back. |
| Paste meeting notes or a transcript | Your agent summarises, adds your action items to your tasks, and sends each teammate's items to their agents. |
| "Reply to Priya that Tuesday works" | Your agent drafts the email in your Gmail and asks you `→ send · edit`. It sends only after you say send. |
| "What's on today?" | Your meetings and open tasks. |
| "Morning" (sales desk) | A ranked brief: who replied, the first meeting, who's waited too long, one item at a time. |

Every message that needs a person ends with an **answer line** (`→ done · skip`), so you can reply with a word, a
tap in the desktop widget, or your voice.

## How it works

```
  rahul ── rahul-desk ── rahul-kian ─┐
  mayank ─ mayank-desk ─ mayank-kian ├── kian-team   (the agents talk here, people watch)
  yukti ── yukti-desk ── yukti-kian ─┘
                │
                └─ each agent runs kian_tools.py --profile <its person>
                   → that person's own Gmail, Calendar and Tasks
```

- **Switch** runs the agents and the rooms. Rooms live in Mattermost, and the same rooms can be reached from
  Telegram, Slack, Teams or Discord through Switch's bridges.
- **Each person has a desk room**, private between them and their agent.
- **The team room** is where agents ask each other, one thread per request, with `send_targeted_message`. Every
  hand-off between people's agents is visible.
- **Each agent acts only with its own person's account.** The toolkit takes a `--profile`, and each agent's
  instructions name its own. To change anything for someone else, it asks their agent.
- **The agents are Claude Code sessions** started by Switch Console from one template, `switch/team.template.yaml`.

## The Switch features it rests on

| Switch feature | How Kian uses it |
|---|---|
| Group templates | One import creates every agent, every room and the links between them |
| Agents addressing agents | `send_targeted_message` in the team room; requests and answers stay in one thread |
| Private rooms | A desk per person |
| Room instructions | The team room states the rule: agents change only their own person's things |
| Room documents | The sales desk keeps a "Deal summary" per deal and a "Decisions" log in approvals |
| Agents opening rooms | The sales coordinator opens a room for each new customer with `create_room` |
| Bridges | The same rooms on Mattermost, Telegram and other chat apps |

Take Switch away and nothing is left: the rooms are where the work happens, and agents of different people can only
reach each other there.

## The rules

1. An agent acts only with its own person's account. For anyone else, it asks their agent.
2. Email goes out only after its owner says **send**. The toolkit's `send` refuses to run without `--approved-by`.
3. The lead sheet changes only after a yes, shown as column, old value and new value.
4. Every request between agents is a thread in the team room.

## The parts

| Part | Where | What it is |
|---|---|---|
| Team template | `switch/team.template.yaml` | An agent per person, their desks and the team room |
| Sales desk template | `switch/kian.template.yaml` | Coordinator, writer and storyteller agents; desk, approvals and content rooms |
| Toolkit | `switch/toolkit/` | `agenda`, `tasks`, `schedule`, `draft`, `send`, `brief`, `deal`, `row`, `login`, with tests |
| Desktop app | `apps/desktop/` | macOS and Windows: a widget that rests as a thin line and grows on hover, and a hub |
| Website | `apps/web/`, kiandesk.vercel.app | Product page, live demo, dashboard, install guides at `/guide`, downloads |
| Shared UI | `packages/ui`, `packages/hub`, `packages/designs` | The widget, the hub and the design kit, used by both the site and the app |

### The desktop app

- **The widget** sits on any edge of the screen as a thin line. Hover and it grows into a pill; press the hotkey
  (⌘⇧K, or Ctrl+Shift+K) and talk. Your agent's messages arrive as one card at a time, with the answer line as buttons.
  Soft sounds mark listening, sending and new cards.
- **The hub** is the team dashboard: today's activity across your rooms, approvals you can grant in place, rooms, and
  settings.
- **Voice** goes through the engine you pick: Wispr Flow dictation, OpenAI, Groq Whisper, NVIDIA Whisper (the speech
  NIM on your own GPU) or any OpenAI-style server.
- **Secrets** (your Mattermost sign-in, voice keys) are kept in the system keychain.
- Installers for Mac (Apple silicon and Intel) and Windows are built by GitHub Actions on every version tag.

## How it was built

1. Research into Switch: templates, rooms, room documents, roles, agent protocol, bridges.
2. Design: the cast (a flower, a speech bubble and a sun), a friendly brand, the widget and the hub.
3. The website and the shared UI packages, then the desktop app on the same components.
4. The sales desk on Switch: templates, toolkit, rules.
5. The team version: an agent for every person, tasks and calendar per person, sending only after a yes.
6. Running it live: Switch Console, three agents and four rooms from one template, and a reminder passed from Rahul's
   agent to Mayank's, landing on Mayank's task list and calendar.

House rules for the code: no file over 400 lines, a header comment in every file, a commit per finished step, and
`pnpm check` to enforce them.

## What's next

- Live call capture from the widget, straight into your desk.
- A morning brief at a set time.
- Supabase-backed history for the hub, across devices.
- Roles in the team room ("@sales-lead"), so requests can go to whoever holds a role.
