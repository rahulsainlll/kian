"use client"

import { type ComponentProps, type ReactNode, useId, useRef } from "react"
import { cn } from "./utils"
import "./designs.css"
import { useControllable } from "./useControllable"

export type SiInputProps = Omit<ComponentProps<"input">, "value" | "defaultValue" | "onChange"> & {
  /** The field's name. Read out always; shown above the box only with `showLabel`. */
  label: string
  /** Show the label above the box. Off by default: the placeholder carries it on screen. */
  showLabel?: boolean
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** The × at the end, shown while the field has focus: empties it and keeps focus. */
  onClear?: () => void
  /** A line under the box: what the field is for. Links in it take the focus colour. */
  hint?: ReactNode
}

/** The clear glyph: a solid disc with a cut-out ×, drawn on a 24-unit grid */
function ClearGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        fill="currentColor"
        d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM8.47 9.88a1 1 0 0 1 1.41-1.41L12 10.59l2.12-2.12a1 1 0 1 1 1.41 1.41L13.41 12l2.13 2.12a1 1 0 0 1-1.42 1.42L12 13.41l-2.12 2.12a1 1 0 0 1-1.41-1.41L10.59 12Z"
      />
    </svg>
  )
}

/**
 * SI's own text field: a soft grey box with a 2px edge that turns blue on focus, a clear
 * button that shows only while you're in it, and an optional line of help below.
 */
export function SiInput({
  label,
  showLabel = false,
  value,
  defaultValue = "",
  onValueChange,
  onClear,
  hint,
  id,
  className,
  disabled,
  type = "text",
  ...props
}: SiInputProps) {
  const [current, setCurrent] = useControllable(value, defaultValue, onValueChange)
  const input = useRef<HTMLInputElement>(null)
  const auto = useId()
  const inputId = id ?? auto
  const hintId = `${inputId}-hint`

  return (
    <div className={cn("ds-si-input", className)} data-disabled={disabled || undefined}>
      <label className={showLabel ? "ds-si-input__label" : "ds-sr-only"} htmlFor={inputId}>
        {label}
      </label>
      <div className="ds-si-input__box">
        <input
          ref={input}
          id={inputId}
          type={type}
          className="ds-si-input__field"
          value={current}
          onChange={(event) => setCurrent(event.target.value)}
          disabled={disabled}
          aria-describedby={hint ? hintId : undefined}
          {...props}
        />
        {!disabled && (
          <button
            type="button"
            className="ds-si-input__clear"
            tabIndex={-1}
            aria-label={`Clear ${label}`}
            // Keep focus in the field: the press would otherwise move it to the button
            onPointerDown={(event) => event.preventDefault()}
            onClick={() => {
              setCurrent("")
              onClear?.()
              input.current?.focus()
            }}
          >
            <ClearGlyph />
          </button>
        )}
      </div>
      {hint && (
        <p id={hintId} className="ds-si-input__hint">
          {hint}
        </p>
      )}
    </div>
  )
}
