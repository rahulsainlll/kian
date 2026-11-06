# 03 · Architecture

## Repo layout

```
packages/ui     @kian/ui — Pill, Waveform, MessageCard, NudgeCard, TypeBar, KianWidget (React + one CSS file)
apps/web        kian website: / (live demo of the morning) and /components (every component, every state)
apps/desktop    Electron widget for Mac + Windows (next) — renders the same @kian/ui components
```

`@kian/ui` is presentational. Each host supplies the state: the website uses a
scripted demo desk, and the desktop app uses the Mattermost adapter below over IPC.


```
 ┌──────────────────── Kian widget (Electron, Mac + Windows) ────────────────────┐
 │                                                                               │
 │  renderer (widget.html)            preload            main process            │
 │  ┌─────────────────────┐        ┌──────────┐   ┌──────────────────────────┐   │
 │  │ pill / card / input │◀──────▶│ kian.*   │◀─▶│ main.js  window, tray,   │   │
 │  │ mic → MediaRecorder │  IPC   │ bridge   │   │          shortcuts, IPC  │   │
 │  │ waveform, TTS       │        └──────────┘   │ desk.js  queue + rules   │   │
 │  └─────────────────────┘                       │ stt.js   audio → text    │   │
 │                                                │ rooms/   mattermost.js   │   │
 │                                                │          mock.js         │   │
 │                                                └───────────┬──────────────┘   │
 └────────────────────────────────────────────────────────────┼──────────────────┘
                                   REST /api/v4 + WebSocket    │   (as Yukti)
                                                               ▼
     Telegram ◀── bridge ──  Mattermost (started by Switch Console)  ◀── bots ── Switch ── kian, kian-scribe, kian-studio
                             #kian-desk #deal-* #approvals #content
```

## Boundaries

- **The widget holds no business state.** It keeps a short in-memory queue of messages it hasn't shown yet, and that's all. The source of truth is the rooms.
- **Main process owns the network and secrets.** The renderer never sees the Mattermost token or the STT key. It gets display events and sends intents (`say`, `reply`, `dismiss`).
- **Rooms adapter interface.** `mattermost.js` and `mock.js` expose the same shape, so the app runs and demos with no Switch running:

```js
connect() → Promise<{ me: {id, username} }>
on('message', ({ id, rootId, channel, author, isAgent, text, mentionsMe, permalink }) => …)
post(channelName, text, { rootId }) → Promise<void>
close()
```

## Modules

| File | Job |
|---|---|
| `src/main/main.js` | App lifecycle, the transparent always-on-top widget window, click-through on empty pixels, tray menu (mute, snooze, voice-out, quit), global shortcuts, IPC wiring, morning timer |
| `src/main/config.js` | Loads `.env` (dev) and `~/.kian/config.json`; defaults; validates |
| `src/main/rooms/mattermost.js` | Login (PAT or user + password), resolves team and channel IDs, WebSocket with reconnect and back-off, `posted` → normalised message, bot detection via `GET /users/{id}` (cached) |
| `src/main/rooms/mock.js` | Scripted demo morning: replies to "morning, Kian" with the brief one item at a time, handles done/skip/draft, raises an approval |
| `src/main/desk.js` | Decides **what surfaces** (room + author + approver rules from the design doc), picks chips, queue, snooze, which items get spoken |
| `src/main/stt.js` | `transcribe(buffer, mime)` → text via an OpenAI-compatible `/audio/transcriptions` endpoint; returns `null` when unconfigured, and the UI falls back to typing |
| `src/preload.js` | `contextBridge` exposing `window.kian` |
| `src/renderer/*` | React + Vite, mounts `<KianWidget>` from `@kian/ui` — the same components as the website's `/components` page |

## Message flow — "morning, Kian" by voice

1. Hotkey → main sends `listen:toggle` → renderer starts `MediaRecorder`, waveform from an `AnalyserNode`.
2. Hotkey again or ■ → the audio blob goes over IPC as an `ArrayBuffer` → `stt.transcribe` → "Morning, Kian."
3. `rooms.post('kian-desk', mentionPrefix + text)`. The renderer shows "sent ✓".
4. Switch delivers to the `kian` agent → kian posts brief items as the `kian` bot.
5. The WebSocket `posted` event → `desk.consider(msg)` → surface? yes (agent, #kian-desk) → queue → renderer card with done/skip/draft; TTS reads it.
6. Chip `draft` → `rooms.post('kian-desk', 'draft', { rootId: msg.id })` (or a plain channel post if `replyMode=channel`).

## Config (`.env` or `~/.kian/config.json`)

| Key | Default | Notes |
|---|---|---|
| `KIAN_BACKEND` | `mock` | `mattermost` to use a real Switch setup |
| `MM_URL` | `http://localhost:8065` | from Switch Console → Messaging apps |
| `MM_TOKEN` *or* `MM_USER` + `MM_PASSWORD` | – | the human's account, not a bot |
| `MM_TEAM` | – | team slug |
| `KIAN_ROOMS` | `kian-desk,approvals,content` | plus every channel starting with `deal-` the user is in |
| `KIAN_AGENTS` | `kian,kian-scribe,kian-studio` | extra signal besides `is_bot` |
| `KIAN_APPROVER` | `false` | show approve/refuse chips |
| `KIAN_MENTION_PREFIX` | `` | e.g. `@kian ` if the room needs a mention |
| `KIAN_REPLY_MODE` | `thread` | `thread` or `channel` |
| `KIAN_MORNING` | `09:00` | empty disables |
| `STT_API_KEY`, `STT_BASE_URL`, `STT_MODEL` | –, `https://api.openai.com/v1`, `gpt-4o-mini-transcribe` | no key → type/Wispr mode |

## Platform notes

- **macOS:** `app.dock.hide()` and `setVisibleOnAllWorkspaces(true, {visibleOnFullScreen:true})`, always-on-top level `floating`; ask for mic access with `systemPreferences.askForMediaAccess`. The packaged build carries `NSMicrophoneUsageDescription`.
- **Windows:** `skipTaskbar`, always-on-top level `screen-saver` so it stays above full-screen windows; NSIS target. Tray icon instead of a menu bar.
- **Click-through:** the window is bigger than the pill, so the card can grow. Empty pixels pass clicks through (`setIgnoreMouseEvents(true, {forward:true})`), toggled by the renderer on pointer enter/leave of the visible parts.

## Later (not tonight)

Local Whisper, true hold-to-talk on the global hotkey (`uiohook-napi`), room
tasks and decisions once Switch documents them, and auto-update.

## Running it for the team (free tiers + Claude API)

| Piece | Where it runs | Cost |
|---|---|---|
| Agents (kian, kian-scribe, kian-studio) | Switch server, as Claude agents (Claude API key or Claude subscription) | Claude usage only |
| Rooms | Mattermost started by Switch Console, on one always-on machine | free |
| Website + dashboard (`apps/web`) | Vercel (static Vite build) | free (Hobby) |
| Team sign-in, dashboard data, live activity | Supabase: Auth, Postgres, Realtime | free tier |
| Desktop widget | Electron app on each teammate's Mac or Windows machine, signed in to the same Mattermost | free |
| Google data | Each rep's own Gmail, Calendar and Sheets via OAuth | free |

The dashboard stays a reader of the rooms: a small sync job mirrors room
events (messages, tasks, decisions) into Supabase so the dashboard loads
fast and updates live, and every action the dashboard offers still posts
to the room. Supabase is the cache, Switch is the source of truth.

Alternatives if a free tier runs out: Cloudflare Pages instead of Vercel;
Neon (Postgres) plus Clerk (auth) instead of Supabase.
