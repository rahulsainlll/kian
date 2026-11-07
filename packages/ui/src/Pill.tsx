/*
 * Pill: the always-there capsule at the bottom of the screen. It shows the
 * voice state (idle, listening, recording, sending, sent, typing), the live
 * waveform, and the mic and type buttons.
 */
import { useEffect, useState } from 'react'
import { CheckIcon, CloseIcon, MicIcon, StopIcon } from './icons'
import { StatusRoll } from './StatusRoll'
import { Waveform } from './Waveform'
import type { Orientation, VoiceState } from './types'

export interface PillProps {
  state: VoiceState
  orientation?: Orientation
  getLevel?: () => number
  /** Room the next voice message goes to, shown while sending. */
  room?: string
  /** Something in the queue: a soft glow, never a number. */
  attention?: boolean
  onTalk?: () => void
  onRecord?: () => void
  onStop?: () => void
  onCancel?: () => void
}

const zero = () => 0

export function Pill({
  state,
  orientation = 'horizontal',
  getLevel = zero,
  room = 'kian-desk',
  attention = false,
  onTalk,
  onRecord,
  onStop,
  onCancel,
}: PillProps) {
  return (
    <div className="k-pill k-glass" data-orientation={orientation} data-state={state} data-attention={attention}>
      {(state === 'idle' || state === 'typing') && (
        <div className="k-pill__body" key="idle">
          <button className="k-btn k-btn--mic" aria-label="Talk to Kian" data-active={state === 'typing'} onClick={onTalk}>
            <MicIcon />
          </button>
          <button className="k-btn k-btn--rec" aria-label="Record a meeting" onClick={onRecord}>
            <span className="k-rec" />
          </button>
        </div>
      )}

      {state === 'listening' && (
        <div className="k-pill__body" key="listening">
          <button className="k-btn k-btn--ghost" aria-label="Cancel" onClick={onCancel}>
            <CloseIcon size={14} />
          </button>
          <Waveform getLevel={getLevel} orientation={orientation} bars={orientation === 'horizontal' ? 24 : 12} />
          <button className="k-btn k-btn--stop" aria-label="Stop and send" onClick={onStop}>
            <StopIcon size={14} />
          </button>
        </div>
      )}

      {state === 'recording' && (
        <div className="k-pill__body" key="recording">
          <span className="k-rec k-rec--live" aria-hidden />
          <Timer />
          <button className="k-btn k-btn--stop" aria-label="Stop recording" onClick={onStop}>
            <StopIcon size={14} />
          </button>
        </div>
      )}

      {(state === 'sending' || state === 'sent') && (
        <div className="k-pill__body k-pill__body--status" key="status">
          {state === 'sending' ? <span className="k-spinner" aria-hidden /> : <span className="k-check"><CheckIcon size={14} /></span>}
          {orientation === 'horizontal' && <StatusRoll text={state === 'sending' ? `Sending to #${room}` : 'Sent'} />}
        </div>
      )}
    </div>
  )
}

function Timer() {
  const [s, setS] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setS((v) => v + 1), 1000)
    return () => clearInterval(id)
  }, [])
  const mm = String(Math.floor(s / 60)).padStart(2, '0')
  const ss = String(s % 60).padStart(2, '0')
  return <span className="k-timer">{mm}:{ss}</span>
}
