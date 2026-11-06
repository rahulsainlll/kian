# 01 · Research

Goal: a Mac + Windows desktop widget for Kian, in the spirit of Wispr Flow's
floating bar, that lets Yukti talk to Kian by voice **and** speaks up on its own
when something needs her. It is "one more client of the same rooms" — the
hackathon plan already names it as the post-Switch step (plan p.11, *What is cut*).

## What Switch gives a client

Read 2026-11-06 from the Switch repo and docs
(github.com/sandbox-quantum/switch, docs.switchagents.ai).

| Fact | Consequence for the widget |
|---|---|
| Each Mattermost **channel is a room**. Switch Console starts a local Mattermost and shows the sign-in under *Messaging apps → Sign-in details…* | The widget logs in to that Mattermost as the human user. No Switch-specific API needed. |
| Each **agent is a Mattermost bot account** named after the agent (`kian`, `kian-scribe`, `kian-studio`) | "Is this from an agent?" = the post's author is a bot user / in the agent list. |
| Agents are addressed with `@agent-name`; room commands start with `!` (Mattermost has no Switch slash commands) | Voice text is posted verbatim; optional `@kian ` prefix is configurable. |
| Switch's own API (`/agents/{id}/connection/ws`, `/agents/{id}/ops/*`) is the **agent protocol**, keyed by agent API keys | Wrong door for a human client. Don't use it. |
| Port and default credentials of the bundled Mattermost are **not documented** | Make URL + token/user/password configurable. Mattermost's default is `http://localhost:8065`. |
| Room "tasks" and "decisions" are **not documented** as API objects | v1 surfaces messages only. Decisions show up as the messages that record them. |

Mattermost itself is well documented and stable:
`POST /api/v4/users/login` (token in the `Token` header) or a personal access
token; `GET /api/v4/users/me`, `/teams/name/{team}/channels/name/{channel}`;
`POST /api/v4/posts` (`root_id` for a thread reply); WebSocket
`/api/v4/websocket` with an `authentication_challenge`, emitting `posted`
events whose `data.post` is a JSON string.

## What Wispr Flow's widget does (the UX we're borrowing)

- A small **pill at bottom-center**. It stays out of the way until you touch it or press the hotkey.
- **Hotkey first**: hold Fn (Mac) or Ctrl+Win (Windows) to talk; the pill also works with clicks.
- While recording it shows a **live waveform** with **Cancel** and **Stop**.
- On Android, the bubble can be dragged and **snoozed**. Users complain that the desktop pill can't be moved (there's a third-party "PillFloat" tool for that), so ours is draggable.

Wispr only listens. Kian's widget also **talks back**: it is a proactive
notifier for the sales desk. Nothing like it appears in the Switch examples,
which are all engineering triage.

## Stack options

| | Electron | Tauri 2 |
|---|---|---|
| Transparent, frameless, always-on-top window | yes | yes (Mac needs `macOSPrivateApi`) |
| Global shortcut | `globalShortcut` (key **down** only) | plugin (down/up) |
| Mic capture | Chromium `getUserMedia` + `MediaRecorder`, identical on both OSes | WKWebView on Mac and WebView2 on Windows behave differently |
| Speech output | `speechSynthesis` (system voices, offline) | same, varies by webview |
| Toolchain here | Node 22 ready | Rust 1.81 installed; Tauri 2 deps are likely to need a newer toolchain |
| Build risk with 1 day left | low | medium |

**Pick: Electron.** It's one engine on both OSes, and the deadline is
Nov 7, 6 PM IST. The cost is that global key-up isn't available without a
native module, so the hotkey **toggles** recording instead of hold-to-talk. Clicking and holding the
pill still gives hold-to-talk.

## Speech-to-text options

1. **Wispr Flow itself.** Click the pill to open a text box, then dictate into it with Wispr. Needs no key, and it counts toward the *Code with Wispr* side track. Always available as the fallback.
2. **Cloud transcription** (OpenAI `gpt-4o-mini-transcribe`, configurable). Lets the pill's own mic work. Needs a key in `.env`.
3. Local Whisper (whisper.cpp / Vosk). The plan cut Vosk; post-hackathon.

## Risks

- **"Don't show a separate dashboard"** (plan p.9). The widget mustn't become a dashboard. It shows exactly one room message at a time, and every action it takes is an ordinary chat message in a Switch room, visible in Mattermost and Telegram. It's a mouthpiece for the rooms, not a second UI with its own state.
- The thread-vs-channel reply semantics of Switch on Mattermost are undocumented. Reply mode is configurable.
- macOS mic permission prompts belong to the Electron binary in dev. Packaged builds need `NSMicrophoneUsageDescription`.
