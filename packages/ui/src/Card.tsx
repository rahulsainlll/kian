import { Button } from '@kian/designs'
import { useEffect, useRef, useState } from 'react'
import { Skeleton } from 'skullet/react'
import { CAST, Mascot } from './Character'
import { HoldButton } from './HoldButton'
import { ArrowUpRightIcon, CloseIcon, MicIcon, SendIcon } from './icons'
import { AGENT_COLORS, type Chip, type Nudge, type RoomMessage } from './types'

/** Agents appear as their character from the cast; anyone else as an initial. */
export function AgentAvatar({ name, size = 20 }: { name: string; size?: number }) {
  const c = CAST[name]
  if (c) return <Mascot size={size} shape={c.shape} color={c.color} mood="happy" />
  return (
    <span className="k-avatar" style={{ background: AGENT_COLORS[name] ?? 'var(--k-ink-3)', width: size, height: size }} aria-hidden>
      {name[0]?.toUpperCase()}
    </span>
  )
}

const VARIANT = { default: 'secondary', primary: 'primary', danger: 'danger' } as const

/** A word you answer with, on the kit's Button. `hold` chips need a press and hold. */
export function ChipButton({ chip, index, onPress }: { chip: Chip; index?: number; onPress?: (c: Chip) => void }) {
  const variant = VARIANT[chip.tone ?? 'default']
  if (chip.hold) {
    return (
      <HoldButton size="sm" variant={variant} holdingLabel="Keep holding" doneLabel={chip.label} onConfirm={() => onPress?.(chip)}>
        {chip.holdLabel ?? `Hold: ${chip.label}`}
      </HoldButton>
    )
  }
  return (
    <Button size="sm" variant={variant} className="k-chip" onClick={() => onPress?.(chip)}>
      {chip.label}
      {index !== undefined && <kbd className="k-kbd">{index + 1}</kbd>}
    </Button>
  )
}

/** Three bars that move while the system voice is reading the card. */
export function SpeakingIndicator() {
  return (
    <span className="k-speaking" aria-label="Speaking">
      <span /><span /><span />
    </span>
  )
}

export interface MessageCardProps {
  message: RoomMessage
  /** How many more are waiting after this one. */
  queued?: number
  speaking?: boolean
  /** The agent is still working: text and chips show as a measured skeleton (skullet). */
  loading?: boolean
  onChip?: (chip: Chip) => void
  onVoiceReply?: () => void
  onDismiss?: () => void
}

export function MessageCard({ message, queued = 0, speaking, loading, onChip, onVoiceReply, onDismiss }: MessageCardProps) {
  const chips = message.chips ?? []
  return (
    <article className="k-card k-glass" data-loading={loading || undefined} aria-live="polite">
      <header className="k-card__head">
        <AgentAvatar name={message.author} />
        <span className="k-card__who">{message.author}</span>
        <span className="k-card__room">#{message.room}</span>
        {speaking && <SpeakingIndicator />}
        <span className="k-card__spacer" />
        {queued > 0 && <span className="k-card__queue">{queued} more</span>}
        <button className="k-btn k-btn--ghost k-btn--sm" aria-label="Dismiss" onClick={onDismiss}>
          <CloseIcon size={14} />
        </button>
      </header>

      <Skeleton loading={!!loading} label={`${message.author} is working`}>
        <p className="k-card__text">{message.text}</p>
      </Skeleton>

      {!loading && (chips.length > 0 || message.voiceReply || message.link) && (
        <footer className="k-card__foot">
          {chips.map((c, i) => (
            <ChipButton key={c.label} chip={c} index={i} onPress={onChip} />
          ))}
          <span className="k-card__spacer" />
          {message.link && (
            <a className="k-link" href={message.link.href} target="_blank" rel="noreferrer">
              {message.link.label}
              <ArrowUpRightIcon size={14} />
            </a>
          )}
          {message.voiceReply && (
            <button className="k-btn k-btn--soft k-btn--sm" aria-label="Reply by voice" onClick={onVoiceReply}>
              <MicIcon size={14} />
            </button>
          )}
        </footer>
      )}
    </article>
  )
}

export function NudgeCard({ nudge, onAction, onDismiss }: { nudge: Nudge; onAction?: () => void; onDismiss?: () => void }) {
  return (
    <article className="k-card k-card--nudge k-glass">
      <p className="k-card__text">{nudge.text}</p>
      <footer className="k-card__foot">
        <ChipButton chip={{ label: nudge.action, tone: 'primary' }} onPress={onAction} />
        <ChipButton chip={{ label: nudge.dismiss ?? 'Later' }} onPress={onDismiss} />
      </footer>
    </article>
  )
}

export interface TypeBarProps {
  room?: string
  autoFocus?: boolean
  onSubmit?: (text: string) => void
  onClose?: () => void
}

/** Typed input. Also the way to dictate into Kian with Wispr Flow. */
export function TypeBar({ room = 'kian-desk', autoFocus = true, onSubmit, onClose }: TypeBarProps) {
  const [text, setText] = useState('')
  const input = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (autoFocus) input.current?.focus({ preventScroll: true })
  }, [autoFocus])

  const submit = () => {
    const t = text.trim()
    if (!t) return
    onSubmit?.(t)
    setText('')
  }

  return (
    <form
      className="k-type k-glass"
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
    >
      <input
        ref={input}
        className="k-type__input"
        value={text}
        placeholder={`Message #${room}`}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === 'Escape' && onClose?.()}
      />
      <button className="k-btn k-btn--send k-btn--sm" type="submit" aria-label="Send" disabled={!text.trim()}>
        <SendIcon size={14} />
      </button>
    </form>
  )
}
