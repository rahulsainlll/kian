/*
 * Toast and notify(): confirmation pills, shown through Sonner.
 */
"use client"

import type { ReactNode } from "react"
import { toast as sonner } from "sonner"
import { cn } from "./utils"
import "./designs.css"

export type ToastProps = {
  children: ReactNode
  icon?: ReactNode
  /** A quiet trailing action, e.g. an Undo button. */
  action?: ReactNode
  /** Rises in when it turns true; stays mounted and fades, so it never pops. */
  show?: boolean
  className?: string
}

/** A confirmation pill: "Link copied", "Snoozed until 8:00 AM". Dark on light, raised on dark. */
export function Toast({ children, icon, action, show = true, className }: ToastProps) {
  return (
    <div className={cn("ds-toast", className)} data-show={show || undefined} role="status">
      {icon && <span className="ds-toast__icon">{icon}</span>}
      <span>{children}</span>
      {action && <span className="ds-toast__action">{action}</span>}
    </div>
  )
}

/** Shows a kit toast through the app's Sonner <Toaster />. */
export function notify(
  message: ReactNode,
  options: {
    icon?: ReactNode
    action?: { label: string; onClick: () => void }
    duration?: number
  } = {},
) {
  return sonner.custom(
    (id) => (
      <Toast
        icon={options.icon}
        action={
          options.action && (
            <button
              type="button"
              className="cursor-pointer"
              onClick={() => {
                options.action?.onClick()
                sonner.dismiss(id)
              }}
            >
              {options.action.label}
            </button>
          )
        }
      >
        {message}
      </Toast>
    ),
    { duration: options.duration ?? 3000, unstyled: true },
  )
}
