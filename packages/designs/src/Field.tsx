/*
 * Field: a labelled text input, controlled or not, with status and hint.
 */
"use client"

import { type ComponentProps, type ReactNode, useId } from "react"
import { cn } from "./utils"
import "./designs.css"
import { useControllable } from "./useControllable"

export type FieldProps = Omit<ComponentProps<"input">, "value" | "defaultValue" | "onChange"> & {
  label?: ReactNode
  /** A line under the box: help text, or the error when `status` is error. */
  hint?: ReactNode
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** valid: a check draws in at the end. error: the ring turns danger. */
  status?: "valid" | "error"
  leading?: ReactNode
  trailing?: ReactNode
}

/**
 * The kit's text field: 34px box, 13px text, 11.5px label. The focus ring is a
 * shadow, so focusing never moves the text.
 */
export function Field({
  label,
  hint,
  value,
  defaultValue = "",
  onValueChange,
  status,
  leading,
  trailing,
  className,
  id,
  disabled,
  ...props
}: FieldProps) {
  const [current, setCurrent] = useControllable(value, defaultValue, onValueChange)
  const auto = useId()
  const inputId = id ?? auto
  const hintId = `${inputId}-hint`

  return (
    <div
      className={cn("ds-field", className)}
      data-status={status}
      data-filled={current ? true : undefined}
      data-disabled={disabled || undefined}
    >
      {label && (
        <label className="ds-field__label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <div className="ds-field__box">
        {leading}
        <input
          id={inputId}
          className="ds-field__input"
          value={current}
          onChange={(event) => setCurrent(event.target.value)}
          disabled={disabled}
          aria-invalid={status === "error" || undefined}
          aria-describedby={hint ? hintId : undefined}
          {...props}
        />
        {status === "valid" && (
          <svg
            className="ds-field__ok"
            viewBox="0 0 16 16"
            width="14"
            height="14"
            aria-hidden="true"
          >
            <path d="M3.5 8.5 6.5 11.5 12.5 4.5" pathLength={1} />
          </svg>
        )}
        {trailing}
      </div>
      {hint && (
        <span id={hintId} className="ds-field__hint">
          {hint}
        </span>
      )}
    </div>
  )
}
