import type { CSSProperties } from "react"
import { cn } from "./utils"
import "./designs.css"

export type SpinnerProps = {
  size?: number
  /** Read by screen readers. */
  label?: string
  className?: string
  style?: CSSProperties
}

/** A thin arc turning in the current color. Holds still under reduced motion. */
export function Spinner({ size = 14, label = "Loading", className, style }: SpinnerProps) {
  return (
    <svg
      role="status"
      aria-label={label}
      className={cn("ds-spinner", className)}
      viewBox="0 0 16 16"
      width={size}
      height={size}
      style={style}
    >
      <circle
        cx="8"
        cy="8"
        r="6.25"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.18"
        strokeWidth="1.5"
      />
      <path
        d="M8 1.75a6.25 6.25 0 0 1 6.25 6.25"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}
