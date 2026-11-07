# 03 · Architecture

Kian has no backend of its own. Switch runs the agents and the rooms; the rooms hold the work. Everything else is a
client of those rooms or a tool the agents call.

```
                       ┌──────────── Switch ────────────┐
   kian.template.yaml ─▶  agents: kian, kian-scribe,    │       Gmail · Calendar · lead Sheet
                       │          kian-studio (Claude)  │──run──▶ switch/toolkit/kian_tools.py
                       │  rooms:  kian-desk, approvals, │         (reads; drafts; rows after a yes;
                       │          content, deal-*       │          no send command)
                       └───────────────┬────────────────┘
                                       │ bots post as the agents
                                       ▼
          Telegram group ◀─ bridge ─ Mattermost (started by Switch Console) ─▶ people in the browser
                                       ▲
                                       │ REST /api/v4 + WebSocket, signed in as the person
                       ┌───────────────┴────────────────┐
                       │  Kian desktop (Electron)       │
                       │  widget: pill, one card, voice │
                       │  hub: today, approvals, rooms  │
                       └────────────────────────────────┘
```

## Repo layout

```
switch/            the Switch side: templates, the toolkit, demo data, seed script
packages/ui        @kian/ui: the widget, the cast, dashboard parts (presentational)
packages/designs   @kian/designs: the design kit (ds- classes on --ds-* tokens)
apps/web           the website: self-playing demo, dashboard prototype, components, blog
apps/desktop       the Electron app for macOS and Windows (widget + hub)
```

`@kian/ui` is presentational. Each host supplies the state: the website from a scripted demo desk, the desktop app
from the rooms.

## The Switch layer

| Piece | Where | Notes |
|---|---|---|
| Agents | `kian.template.yaml` | Instructions, addressing (`anyone` / `owner-agents`), provider, directory |
| Rooms | the same template, as a group | Room instructions carry the rules; kickoffs wake each agent; links connect the desk to approvals and content |
| Deal rooms | `create_room` by kian, or `deal-room.template.yaml` | Private, kian + kian-scribe + the rep |
| Hand-offs | `send_targeted_message` | In the deal room, so the hand-off is visible |
| Next steps | room document "Deal summary" | Owned by kian-scribe; Switch has no task objects |
| Decisions | room document "Decisions" in approvals | Owned by kian; one line per yes or no with a name and date |
| Phone | a Telegram group kian is invited to | Telegram bots can't create groups, so this is set up by hand |

Agents reach Google only through `kian_tools.py`. It writes Gmail drafts and Sheet cells (after `--approved-by`) and
nothing else. The demo backend serves `fixtures.json`, so the whole desk runs with no Google account.

### The answer line

An agent message that needs a person ends with one line: `→ done · skip · draft`, or `→ approve (hold) · refuse`. People
answer in the message's thread. The desktop app parses this line into buttons, so the agents decide what can be
answered, and a person in plain Mattermost sees the same choices as text.

## The desktop app

Electron, TypeScript throughout, built with electron-vite. Two windows share one renderer bundle and the same
`@kian/ui` components as the website.

```
 main process                                     renderer
 ┌──────────────────────────────────────┐         ┌─────────────────────────────┐
 │ index.ts     lifecycle, single lock  │         │ widget/  KianWidget, voice  │
 │ windows.ts   widget (transparent,    │◀─ IPC ─▶│ hub/     today, approvals,  │
 │              always on top), hub     │ preload │          rooms, setup       │
 │ tray.ts      menu, snooze, quit      │  kian.* │                             │
 │ shortcuts.ts global hotkey           │         └─────────────────────────────┘
 │ settings.ts  config; token in the OS │
 │              keychain (safeStorage)  │
 │ desk.ts      what surfaces, queue    │
 │ rooms/       mattermost.ts, mock.ts  │
 └──────────────────────────────────────┘
```

### Boundaries

- **No business state.** The app keeps a short queue of messages not yet shown. The rooms are the source of truth.
- **The main process owns the network and the secrets.** The renderer never sees the Mattermost token. It receives
  display events and sends intents: `say`, `answer`, `dismiss`, `snooze`.
- **One rooms interface, two implementations.** `mock.ts` plays the demo morning with no server; `mattermost.ts`
  talks to the real one. Same shape:

```ts
interface Rooms {
  connect(): Promise<{ me: { id: string; username: string } }>
  on(event: 'message', fn: (m: RoomEvent) => void): () => void
  post(room: string, text: string, opts?: { rootId?: string }): Promise<void>
  rooms(): Promise<RoomSummary[]>          // for the hub
  close(): void
}
```

### What surfaces (desk.ts)

A message becomes a card when it is from an agent, in a room the person is in, and either ends with an answer line or
mentions them. Approvals cards appear only for the sales lead. Everything else stays in the rooms and shows in the hub.
One card at a time; the rest wait in the queue, and the pill shows how many.

### Voice

The pill's mic records with `MediaRecorder`; the waveform reads an `AnalyserNode`. Speech becomes text through the
system's dictation or a configured transcription endpoint, and with neither, the type bar is focused instead, which is
where Wispr Flow dictates. Cards can be read aloud with the system voice.

### Message flow: “morning, Kian” by voice

1. Hotkey: the widget starts listening; the waveform moves.
2. Hotkey again: the text is posted to kian-desk as the person.
3. kian runs `brief` and posts one item per message, each ending with an answer line.
4. The WebSocket `posted` event reaches `desk.ts`, which queues it; the widget shows the card with its buttons.
5. A button posts the answer as a reply in that message's thread, exactly as typing it in Mattermost would.

### Platform notes

- **macOS:** hidden from the Dock, visible on all Spaces and over full-screen apps, microphone permission requested
  on first use, `NSMicrophoneUsageDescription` in the bundle.
- **Windows:** skips the taskbar, stays above full-screen windows, tray icon, NSIS installer.
- **Click-through:** the widget window is larger than the pill so cards can grow; empty pixels pass clicks through and
  the renderer turns that off while the pointer is over a visible part.

## Hosting

| Piece | Where | Cost |
|---|---|---|
| Agents and rooms | Switch Console on one always-on machine, Claude for the agents | Claude usage |
| Website | Vercel, static Vite build | free |
| Desktop app | GitHub Releases: a dmg for macOS, an NSIS installer for Windows | free |
| Google data | each rep's own account, through the toolkit | free |

There is no database. The website's dashboard is a prototype on synthetic data; the live view of the rooms is the
desktop hub, which reads Mattermost as the signed-in person.
