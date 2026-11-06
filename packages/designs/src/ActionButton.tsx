"use client"

import type { ComponentProps, ReactNode } from "react"
import { cn } from "./utils"
import { Check } from "./Check"
import "./designs.css"

export type ActionStatus = "idle" | "pending" | "done"

export type ActionButtonProps = ComponentProps<"button"> & {
  /** idle shows `children`, pending the check's turning arc, done the check with `doneLabel`. */
  status?: ActionStatus
  doneLabel?: ReactNode
}

/**
 * The poster's Publish → ✓ Live: 48px, radius 14, accent. Each status is a layer
 * in one cell that crossfades, so nothing resizes or slides across the button.
 */
export function ActionButton({
  status = "idle",
  doneLabel = "Done",
  className,
  children,
  disabled,
  ...props
}: ActionButtonProps) {
  return (
    <button
      type="button"
      aria-busy={status === "pending" || undefined}
      disabled={disabled || status === "pending"}
      className={cn("ds-action ds-poster", className)}
      {...props}
    >
      <span
        className="ds-action__layer"
        data-on={status === "idle" || undefined}
        aria-hidden={status !== "idle"}
      >
        {children}
      </span>
      <span
        className="ds-action__layer"
        data-on={status === "pending" || undefined}
        aria-hidden={status !== "pending"}
      >
        <Check on={false} pending size={18} />
        <span className="sr-only">Working</span>
      </span>
      <span
        className="ds-action__layer"
        data-on={status === "done" || undefined}
        aria-hidden={status !== "done"}
      >
        <Check on={status === "done"} size={18} />
        {doneLabel}
      </span>
    </button>
  )
}
