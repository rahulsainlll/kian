/*
 * useAutoplay: plays the demo morning on its own. It answers each card the
 * way Yukti would, at reading pace, then pauses and loops.
 */
import type { Chip, RoomMessage } from '@kian/ui'
import { useEffect } from 'react'
import type { useDemoDesk } from './useDemoDesk'

type Desk = ReturnType<typeof useDemoDesk>

/** How long a card stays up before Yukti answers it: long enough to read, never rushed. */
const READ_MS = 3400
const NUDGE_MS = 2600
const LOOP_PAUSE_MS = 6500

/** The answer Yukti gives to each kind of message in the scripted morning. */
function choose(m: RoomMessage): Chip | undefined {
  const chips = m.chips ?? []
  const by = (label: string) => chips.find((c) => c.label === label)
  if (m.room === 'approvals') return by('approved')
  if (/Priya/.test(m.text) && m.room === 'kian-desk') return by('draft')
  if (/Northwind/.test(m.text)) return by('skip')
  return by('go') ?? by('yes') ?? by('done') ?? chips[0]
}

/**
 * Plays the morning on its own: nudge, brief, a draft, an approval, then a
 * pause and again from the top. One action at a time, at reading pace, only
 * while `on` (on screen and nobody has taken over).
 */
export function useAutoplay(desk: Desk, on: boolean) {
  const { message, nudge } = desk.widget
  const done = !message && !nudge && !desk.busy

  useEffect(() => {
    if (!on || desk.busy) return
    let t: number | undefined

    if (message) {
      const chip = choose(message)
      if (chip) t = window.setTimeout(() => desk.answer(message, chip), READ_MS)
    } else if (nudge) {
      t = window.setTimeout(() => desk.widget.onNudgeAction(), NUDGE_MS)
    } else if (done) {
      t = window.setTimeout(() => desk.reset(), LOOP_PAUSE_MS)
    }
    return () => clearTimeout(t)
    // re-plan whenever the visible thing changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on, message?.id, nudge, desk.busy, done])
}
