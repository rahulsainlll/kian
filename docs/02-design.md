# 02 · Design — the Kian widget

One sentence: **a pill that listens when you talk to it, and taps you on the
shoulder when a room needs you.**

## Principles

1. **Quiet by default.** At rest it's a small dark pill with a mic and a record dot (see the reference screenshots). No badge counts and no feed.
2. **One thing at a time.** This mirrors the plan's "one item per message". The widget never shows a list.
3. **Every action is a chat message.** Done, skip, draft and approved are posted into the room as Yukti. If the widget disappeared, the rooms would hold the same history.
4. **Agents draft, people send.** The widget has no "send email" button. The most it can do is say *draft*.
5. **Speak only what's worth hearing.** Voice-out is on for the brief and for approvals, and off for chatter. It's a toggle.

## States

```
             hotkey / click mic                    stop / release
   ┌──────┐ ───────────────────▶ ┌───────────┐ ─────────────────▶ ┌──────────┐
   │ IDLE │                      │ LISTENING │                    │ SENDING  │
   │ pill │ ◀─────────────────── │ waveform  │                    │ spinner  │
   └──┬───┘     cancel (Esc)     │ ✕  ■      │                    └────┬─────┘
      │  ▲                       └───────────┘                         │ posted
      │  │ dismiss / reply                                             ▼
      │  │                                                       ┌──────────┐
      │  └────────────────────────────────────────────────────── │ IDLE +   │
      │                                                          │ "sent ✓" │
      │ agent posts in a watched room                            └──────────┘
      ▼
   ┌──────────────────────────────────┐
   │ CARD  (grows up out of the pill) │   speaks the text if voice-out is on
   │  kian · #kian-desk               │
   │  "Priya replied — wants Tuesday" │
   │  [done] [skip] [draft]  [🎤]     │   chips depend on the room (see below)
   └──────────────────────────────────┘
          queue: if more arrive, a small "2 more" dot; next card after reply/dismiss
```

Extra state: **TYPE**. Clicking the pill body (not the mic) opens a one-line
input. This is how you dictate with Wispr Flow into Kian, and it works with no STT key.

## The card — chips by room

| Room | When it surfaces | Chips (each posts that word as a reply) |
|---|---|---|
| `#kian-desk` | any agent post | `done` · `skip` · `draft` · 🎤 reply |
| `#deal-*` | agent post that mentions you, or contains a draft link / a Sheet change | `yes` · 🎤 "tell it what to change" · open in chat |
| `#approvals` | agent post, **only if you're the approver** | `approved` · `refused` |
| `#content` | agent post | 🎤 reply (for the script questions) |
| any | message `@`-mentions you | 🎤 reply · open in chat |

"Open in chat" opens the Mattermost permalink in the browser. The widget never
tries to be the chat app.

## Proactive moments

| Trigger | What the widget does |
|---|---|
| `morningTime` (default 09:00, weekdays), first time the computer is active | Pill glows and shows "Morning — want your brief?" One tap posts `morning, Kian`. |
| Agent posts in a watched room | Card slides up and (optionally) reads it aloud. |
| `#approvals` asks the approver | Card + system notification, even when muted. Approvals are the one thing that must not wait. |
| Nothing for a while | Nothing. Silence is a feature. |

Focus guard: **Snooze 1h** (tray, or drag the pill to the screen edge) holds
cards in the queue. Approvals still notify.

## Look

- Dark glass pill, `#1c1c1e` at 92% with blur, 1px hairline `#ffffff1a`, radius 999.
- Mic glyph in white. Record dot: white ring with a white center, red while recording.
- Card is the same glass with a 16px radius, max width 360px, sender avatar initial plus agent name in the agent's colour (kian blue, kian-scribe green, kian-studio amber).
- Motion: 160ms ease-out grow and fade. A waveform of 24 bars driven by mic RMS.
- Draggable anywhere, and it remembers its position. Default is bottom-center, 24px above the dock/taskbar.

## Keyboard

| Key | Action |
|---|---|
| `⌘⇧Space` / `Ctrl+Shift+Space` | toggle listening (global) |
| `⌘⇧K` / `Ctrl+Shift+K` | show/hide the widget (global) |
| `Esc` | cancel recording / dismiss card |
| `1` `2` `3` | press the card's chips |
