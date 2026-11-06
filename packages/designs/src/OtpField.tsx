"use client"

import { type CSSProperties, type ReactNode, useEffect, useId, useRef, useState } from "react"
import { cn } from "./utils"
import "./designs.css"
import { Icon } from "./Icon"
import { useControllable } from "./useControllable"

export type OtpFieldProps = {
  /** How many digits. 6 by default. */
  length?: number
  /** A dash after every this many cells (3 → 374–918). 0 for none. */
  groupSize?: number
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** Called once with the code when the last digit lands. */
  onComplete?: (code: string) => void
  /** error: the ring and the line turn danger, with a small shake. success: every cell turns. */
  status?: "error" | "success"
  /** The line under the cells: help, the error, or the confirmation. Its space is always kept. */
  message?: ReactNode
  disabled?: boolean
  autoFocus?: boolean
  "aria-label"?: string
  className?: string
}

/**
 * A one-time code: six cells over one real input, so typing, Backspace, paste and the phone's
 * SMS autofill all just work, and a screen reader hears one field. The cell being typed in
 * carries the focus ring; a wrong code shakes once and says why on the line beneath, which
 * keeps its space, so nothing moves when it appears.
 */
export function OtpField({
  length = 6,
  groupSize = 3,
  value,
  defaultValue = "",
  onValueChange,
  onComplete,
  status,
  message,
  disabled,
  autoFocus,
  "aria-label": ariaLabel = "Verification code",
  className,
}: OtpFieldProps) {
  const [current, setCurrent] = useControllable(value, defaultValue, onValueChange)
  const [focused, setFocused] = useState(false)
  const input = useRef<HTMLInputElement>(null)
  const cells = useRef<HTMLDivElement>(null)
  const messageId = useId()
  const code = current.slice(0, length)
  const active = Math.min(code.length, length - 1)
  const locked = disabled || status === "success"

  // Focus on mount when asked (a code screen usually has nothing else to do)
  // biome-ignore lint/correctness/useExhaustiveDependencies: only on mount
  useEffect(() => {
    if (autoFocus) input.current?.focus()
  }, [])

  // A wrong code shakes the row once (not under reduced motion)
  useEffect(() => {
    if (status !== "error" || !cells.current) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    cells.current.animate(
      [
        { transform: "translateX(0)" },
        { transform: "translateX(-5px)" },
        { transform: "translateX(4px)" },
        { transform: "translateX(-2px)" },
        { transform: "translateX(0)" },
      ],
      { duration: 320, easing: "cubic-bezier(0.23, 1, 0.32, 1)" },
    )
  }, [status])

  const change = (raw: string) => {
    const next = raw.replace(/\D/g, "").slice(0, length)
    if (next === code) return
    setCurrent(next)
    if (next.length === length) onComplete?.(next)
  }

  return (
    <div
      className={cn("ds-otp", className)}
      data-status={status}
      data-focused={focused || undefined}
      data-disabled={disabled || undefined}
    >
      <div ref={cells} className="ds-otp__cells">
        <input
          ref={input}
          className="ds-otp__input"
          value={code}
          onChange={(event) => change(event.target.value)}
          // Typing always lands at the end, the way the cells read
          onSelect={(event) => {
            const el = event.currentTarget
            const end = el.value.length
            if (el.selectionStart !== end || el.selectionEnd !== end) el.setSelectionRange(end, end)
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]*"
          // A pasted code may carry a dash or spaces ("374-918"): take its digits, then trim.
          // No maxLength, which would cut the raw text before the dash is dropped
          onPaste={(event) => {
            event.preventDefault()
            change(event.clipboardData.getData("text"))
          }}
          disabled={disabled}
          readOnly={status === "success"}
          aria-label={ariaLabel}
          aria-invalid={status === "error" || undefined}
          aria-describedby={messageId}
        />
        {Array.from({ length }, (_, i) => {
          const digit = code[i]
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: a cell is its position
            <span key={i} className="ds-otp__slot" style={{ "--i": i } as CSSProperties}>
              {groupSize > 0 && i > 0 && i % groupSize === 0 && (
                <span className="ds-otp__dash" aria-hidden />
              )}
              <span
                className="ds-otp__cell"
                data-active={(focused && !locked && i === active) || undefined}
                data-filled={digit ? true : undefined}
                aria-hidden
              >
                {digit ? (
                  // Keyed by the digit, so a changed digit lands again
                  <span key={digit} className="ds-otp__digit">
                    {digit}
                  </span>
                ) : (
                  <span className="ds-otp__placeholder">0</span>
                )}
              </span>
            </span>
          )
        })}
      </div>
      <p id={messageId} className="ds-otp__message" aria-live="polite">
        {status === "success" && <Icon name="check" size={14} stroke={2.2} />}
        {message}
      </p>
    </div>
  )
}
