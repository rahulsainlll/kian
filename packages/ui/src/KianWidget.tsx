/*
 * KianWidget: the whole floating widget, used by the website and Electron.
 */
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { MessageCard, NudgeCard, TypeBar } from './Card'
import { Pill } from './Pill'
import type { Chip, Nudge, Orientation, RoomMessage, VoiceState } from './types'

export interface KianWidgetProps {
  orientation?: Orientation
  voiceState: VoiceState
  getLevel?: () => number
  room?: string
  message?: RoomMessage | null
  /** An agent is working on a reply: shows a skeleton card that the reply reveals into. */
  pending?: { author: string; room: string } | null
  queued?: number
  speaking?: boolean
  nudge?: Nudge | null
  /** Listen for Esc and 1–9 on the window. On by default. */
  keyboard?: boolean
  onTalk?: () => void
  onRecord?: () => void
  onStop?: () => void
  onCancel?: () => void
  onTypeSubmit?: (text: string) => void
  onTypeClose?: () => void
  onChip?: (message: RoomMessage, chip: Chip) => void
  onVoiceReply?: (message: RoomMessage) => void
  onDismiss?: (message: RoomMessage) => void
  onNudgeAction?: () => void
  onNudgeDismiss?: () => void
  /** Rest as a thin line (the desktop app, while idle and not hovered). The pill grows back in place. */
  collapsed?: boolean
  /** A small label beside the idle pill, e.g. the hotkey. */
  hint?: ReactNode
  /** What the widget shows at rest instead of the plain line, e.g. the Kian flower. */
  restIcon?: ReactNode
}

/**
 * The whole widget: pill plus whatever floats above it (a card, a nudge, or the
 * type bar — one at a time). Purely presentational; the host (website demo or
 * Electron) owns the state and talks to the rooms.
 */
export function KianWidget(p: KianWidgetProps) {
  const orientation = p.orientation ?? 'horizontal'

  const cardKey = useRevealKey(p.message?.id, !!p.pending)

  // One floating surface at a time: typing wins, then a card, then a nudge.
  let floating: { key: string; node: ReactNode } | null = null
  if (p.voiceState === 'typing') {
    floating = { key: 'type', node: <TypeBar room={p.room} onSubmit={p.onTypeSubmit} onClose={p.onTypeClose} /> }
  } else if (!p.message && p.pending) {
    floating = {
      key: cardKey,
      node: (
        <MessageCard
          loading
          message={{ id: 'pending', author: p.pending.author, room: p.pending.room, text: PENDING_SAMPLE }}
          onDismiss={p.onNudgeDismiss}
        />
      ),
    }
  } else if (p.message) {
    const m = p.message
    floating = {
      key: cardKey,
      node: (
        <MessageCard
          message={m}
          queued={p.queued}
          speaking={p.speaking}
          onChip={(c) => p.onChip?.(m, c)}
          onVoiceReply={() => p.onVoiceReply?.(m)}
          onDismiss={() => p.onDismiss?.(m)}
        />
      ),
    }
  } else if (p.nudge) {
    floating = { key: 'nudge', node: <NudgeCard nudge={p.nudge} onAction={p.onNudgeAction} onDismiss={p.onNudgeDismiss} /> }
  }

  useWidgetKeys(p, p.keyboard !== false)

  return (
    <div className="kian k-widget dark" data-orientation={orientation}>
      <Presence item={floating} />
      <div className="k-dock" data-collapsed={(p.collapsed && !floating) || undefined}>
        <span className={p.restIcon ? 'k-line k-line--icon' : 'k-line'} aria-hidden>
          {p.restIcon}
        </span>
        {p.hint && !floating && p.voiceState === 'idle' && <span className="k-hint">{p.hint}</span>}
        <Pill
          state={p.voiceState}
          orientation={orientation}
          getLevel={p.getLevel}
          room={p.room}
          attention={!!p.nudge && !p.message}
          onTalk={p.onTalk}
          onRecord={p.onRecord}
          onStop={p.onStop}
          onCancel={p.onCancel}
        />
      </div>
    </div>
  )
}

const EXIT_MS = 150
// Sample text the skeleton is measured from: about two lines, like a brief item.
const PENDING_SAMPLE = 'Priya Shah at Lumen Health replied overnight and wants to move the call to Tuesday.'

/**
 * The card a reply lands in keeps the pending card's key, so skullet reveals the
 * text in place instead of the card leaving and a new one arriving.
 */
function useRevealKey(messageId: string | undefined, pending: boolean) {
  const keys = useRef(new Map<string, string>())
  const pendingKey = useRef<string | null>(null)
  const n = useRef(0)

  if (pending && !messageId) {
    pendingKey.current ??= `card-${n.current++}`
    return pendingKey.current
  }
  if (!messageId) return 'none'
  if (!keys.current.has(messageId)) {
    keys.current.set(messageId, pendingKey.current ?? `card-${n.current++}`)
    pendingKey.current = null
  }
  return keys.current.get(messageId)!
}

/** Keeps the outgoing surface mounted for its exit, then swaps in the next one. */
function Presence({ item }: { item: { key: string; node: ReactNode } | null }) {
  const [shown, setShown] = useState(item)
  const [phase, setPhase] = useState<'open' | 'closing'>('open')

  useEffect(() => {
    if (item?.key === shown?.key) {
      setShown(item) // same surface, fresh props
      return
    }
    if (!shown) {
      setShown(item)
      setPhase('open')
      return
    }
    setPhase('closing')
    const t = setTimeout(() => {
      setShown(item)
      setPhase('open')
    }, EXIT_MS)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item?.key, item?.node])

  if (!shown) return null
  return (
    <div className="k-float" data-phase={phase} key={shown.key}>
      {shown.node}
    </div>
  )
}

function useWidgetKeys(p: KianWidgetProps, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === 'Escape') {
        if (p.voiceState === 'listening' || p.voiceState === 'recording') p.onCancel?.()
        else if (p.message) p.onDismiss?.(p.message)
        else if (p.nudge) p.onNudgeDismiss?.()
        return
      }
      const n = Number(e.key)
      const chip = p.message?.chips?.[n - 1]
      if (p.message && chip && !chip.hold && !e.metaKey && !e.ctrlKey) p.onChip?.(p.message, chip)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [enabled, p])
}
