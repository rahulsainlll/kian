"use client"

import { type ComponentProps, type FormEvent, useId } from "react"
import { cn } from "./utils"
import "./designs.css"
import { useControllable } from "./useControllable"

export type AiBarProps = Omit<
  ComponentProps<"input">,
  "value" | "defaultValue" | "onChange" | "onSubmit" | "type" | "size"
> & {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** Enter or the send button, with the trimmed message. The bar clears itself after. */
  onSend?: (message: string) => void
  /** The + on the left: attach a file, a photo, a note. */
  onAttach?: () => void
  /** The mic: dictate into the bar. */
  onDictate?: () => void
  /** The dark button while the bar is empty: talk instead of typing. */
  onVoice?: () => void
  /** The field's name, read out by screen readers (the bar has no room to show it). */
  label?: string
}

// Glyphs are drawn on the 50-unit grid they were measured on, so each one fills its
// circle exactly as in the reference at any size
function PlusGlyph() {
  return (
    <svg viewBox="0 0 50 50" aria-hidden="true">
      <path
        d="M13 25h24M25 13v24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}

function MicGlyph() {
  return (
    <svg viewBox="0 0 50 50" aria-hidden="true">
      <rect x="20" y="12" width="10" height="18" rx="5" fill="currentColor" />
      <path
        d="M16 23a9 9 0 0 0 18 0M25 32v6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

const WAVE = [
  { x: 13, h: 10 },
  { x: 19, h: 24 },
  { x: 25, h: 14 },
  { x: 31, h: 24 },
  { x: 37, h: 10 },
]

function WaveGlyph() {
  return (
    <svg viewBox="0 0 50 50" aria-hidden="true">
      {WAVE.map(({ x, h }) => (
        <rect key={x} x={x - 2} y={25 - h / 2} width="4" height={h} rx="2" fill="currentColor" />
      ))}
    </svg>
  )
}

function SendGlyph() {
  return (
    <svg viewBox="0 0 50 50" aria-hidden="true">
      <path
        d="M25 35V15M17 23l8-8 8 8"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * The message bar: + to attach, the input, the mic, and one dark button that is voice mode
 * while the bar is empty and send once there's text, its glyph swapping in place. Hovering
 * or focusing the bar darkens its edge; nothing else moves.
 */
export function AiBar({
  value,
  defaultValue = "",
  onValueChange,
  onSend,
  onAttach,
  onDictate,
  onVoice,
  placeholder = "Message Student Intelligence",
  label = "Message",
  id,
  disabled,
  className,
  style,
  ...props
}: AiBarProps) {
  const [current, setCurrent] = useControllable(value, defaultValue, onValueChange)
  const message = current.trim()
  const ready = message.length > 0
  const auto = useId()
  const inputId = id ?? auto

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!ready || disabled) return
    onSend?.(message)
    setCurrent("")
  }

  return (
    <form
      className={cn("ds-ai", className)}
      style={style}
      data-ready={ready || undefined}
      data-disabled={disabled || undefined}
      onSubmit={submit}
    >
      <button
        type="button"
        className="ds-ai__key"
        onClick={onAttach}
        disabled={disabled}
        aria-label="Attach"
      >
        <PlusGlyph />
      </button>
      <label className="ds-sr-only" htmlFor={inputId}>
        {label}
      </label>
      <input
        id={inputId}
        className="ds-ai__input"
        value={current}
        onChange={(event) => setCurrent(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        enterKeyHint="send"
        autoComplete="off"
        {...props}
      />
      <button
        type="button"
        className="ds-ai__key"
        onClick={onDictate}
        disabled={disabled}
        aria-label="Dictate"
      >
        <MicGlyph />
      </button>
      <button
        type={ready ? "submit" : "button"}
        className="ds-ai__key ds-ai__go"
        onClick={ready ? undefined : onVoice}
        disabled={disabled}
        aria-label={ready ? "Send message" : "Start voice mode"}
      >
        <span className="ds-ai__glyph" data-glyph="voice">
          <WaveGlyph />
        </span>
        <span className="ds-ai__glyph" data-glyph="send">
          <SendGlyph />
        </span>
      </button>
    </form>
  )
}
