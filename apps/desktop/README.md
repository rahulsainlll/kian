# Kian for macOS and Windows

The widget and the hub: one more client of your Switch rooms. It signs in to the same Mattermost as you, shows one agent
message at a time with the answers it offers, and posts what you say or tap back into the room. It keeps no work of its
own.

![The hub with the live feed, and the widget showing a brief item](../../docs/assets/desktop.png)

## Run it

```bash
pnpm install
pnpm desktop          # from the repo root
```

It starts on the **demo morning**, with no server needed. Press <kbd>⌘⇧K</kbd> (<kbd>Ctrl+Shift+K</kbd> on Windows) or
click **Say “morning” to kian** in the hub, then answer the cards.

To use your real desk, open **Setup** in the hub, choose **Switch (Mattermost)**, and enter:

- **Mattermost URL**: shown in Switch Console under Messaging apps, usually `http://localhost:8065`.
- Your **username and password**, or a **personal access token** with the username left empty.
- **I'm the sales lead**, if approval cards are for you.

**Save and test** signs in and says who you are.

## How it works

| Piece | File | |
|---|---|---|
| Rooms | `src/main/rooms/mattermost.ts` | REST and WebSocket, signed in as you. `mock.ts` plays the demo |
| Desk | `src/main/desk.ts` | Which messages become cards, the queue, answers posted as thread replies |
| Answer line | `src/shared/answers.ts` | `→ done · skip · draft` at the end of an agent message becomes buttons |
| Widget | `src/renderer/widget/` | The shared `KianWidget` from `@kian/ui`, voice recording, click-through |
| Hub | `src/renderer/hub/` | Today's live feed, rooms, setup |
| Settings | `src/main/settings.ts` | Plain values in `settings.json`; the token and the transcription key go in the OS keychain |

Voice: with a transcription key set in Setup, the mic sends speech to that endpoint. Without one, the mic opens the
type bar, which is where Wispr Flow or your system's dictation types for you.

## Build installers

```bash
pnpm --filter @kian/desktop dist:mac    # dmg for Apple silicon and Intel, in apps/desktop/release
pnpm --filter @kian/desktop dist:win    # NSIS installer (build on Windows, or with Wine)
```

Builds are unsigned unless `CSC_LINK` and `CSC_KEY_PASSWORD` are set. On macOS, open an unsigned build the first time
with right-click, Open.

## Checks

```bash
pnpm --filter @kian/desktop test        # the answer-line parser
pnpm --filter @kian/desktop build && KIAN_CAPTURE=/tmp/kian pnpm --filter @kian/desktop exec electron .
# plays a morning on its own and saves each window as a PNG
```
