import type { ComponentProps, ReactNode } from "react"
import { cn } from "./utils"
import "./designs.css"

export type BadgeProps = ComponentProps<"span"> & {
  tone?: "neutral" | "accent" | "success" | "danger" | "warning"
  /** A status dot before the label. */
  dot?: boolean
  /** A glyph before the label instead of the dot. */
  icon?: ReactNode
}

/** A 20px status pill. A tone change eases on the same pill. */
export function Badge({ tone = "neutral", dot, icon, children, className, ...props }: BadgeProps) {
  return (
    <span
      className={cn("ds-badge", className)}
      data-tone={tone}
      data-lead={dot || icon ? "" : undefined}
      {...props}
    >
      {dot && <span className="ds-badge__dot" />}
      {icon}
      <span className="ds-badge__label">{children}</span>
    </span>
  )
}
