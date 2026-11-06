import type { CSSProperties } from "react"
import { cn } from "./utils"
import "./designs.css"

export type MeterProps = {
  /** 0 to 1. */
  value: number
  /** Recolors the fill (a password meter going danger → success); the color eases. */
  tone?: "accent" | "danger" | "warning" | "success" | "ink"
  "aria-label": string
  className?: string
  style?: CSSProperties
}

/** A 6px usage bar filling to `value` with the accent gradient. */
export function Meter({
  value,
  tone = "accent",
  className,
  style,
  "aria-label": ariaLabel,
}: MeterProps) {
  const clamped = Math.max(0, Math.min(1, value))
  return (
    // biome-ignore lint/a11y/useSemanticElements: a native <meter> cannot take the clip-path fill and its tone layer
    <span
      role="meter"
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped * 100)}
      className={cn("ds-meter", className)}
      data-tone={tone}
      style={style}
    >
      {/* Revealed with clip-path, not width, so nothing re-lays out and the end stays round */}
      <span
        className="ds-meter__fill"
        style={{ clipPath: `inset(0 ${(1 - clamped) * 100}% 0 0 round 3px)` }}
      />
    </span>
  )
}
