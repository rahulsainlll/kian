import type { ComponentProps } from "react"
import { cn } from "./utils"
import "./designs.css"

export type CheckProps = ComponentProps<"span"> & {
  on: boolean
  /** An arc turning inside the ring, for work in flight. */
  pending?: boolean
  size?: number
}

/**
 * A status circle. Pending turns an arc inside the ring; on fills the circle from
 * its center, then draws the tick. Pending hands over to done in one mark.
 */
export function Check({ on, pending, size = 16, className, style, ...props }: CheckProps) {
  return (
    <span
      className={cn("ds-check", className)}
      data-on={on || undefined}
      data-pending={(pending && !on) || undefined}
      style={{ width: size, height: size, ...style }}
      {...props}
    >
      <svg viewBox="0 0 16 16" width={size} height={size} aria-hidden="true">
        <circle className="ds-check__ring" cx="8" cy="8" r="7.25" />
        <circle className="ds-check__arc" cx="8" cy="8" r="7.25" pathLength={1} />
        <circle className="ds-check__fill" cx="8" cy="8" r="8" />
        <path className="ds-check__tick" d="M4.5 8.2 7 10.6l4.6-5" pathLength={1} />
      </svg>
    </span>
  )
}
