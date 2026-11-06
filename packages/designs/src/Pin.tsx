import type { CSSProperties } from "react"
import { cn } from "./utils"
import "./designs.css"

export type PinProps = {
  /** The commenter's name: the initial and the label. */
  name?: string
  src?: string
  size?: number
  /** Which corner is the point, the one on the thing the comment is about. */
  corner?: "bl" | "br" | "tl" | "tr"
  /** accent: the pin the story is about. ink: the others. */
  tone?: "accent" | "ink"
  /** The pin whose thread is open: a ring in its own color. */
  selected?: boolean
  /** Makes the pin a button (open its thread). */
  onClick?: () => void
  className?: string
  style?: CSSProperties
}

/** A comment pin: one rounded square with a single square corner, as design tools draw it. */
export function Pin({
  name = "",
  src,
  size = 24,
  corner = "bl",
  tone = "accent",
  selected,
  onClick,
  className,
  style,
}: PinProps) {
  const shared = {
    className: cn("ds-pin", className),
    "data-corner": corner,
    "data-tone": tone,
    "data-selected": selected || undefined,
    style: { width: size, height: size, fontSize: Math.round(size * 0.42), ...style },
  }
  const face = (
    <span className="ds-pin__face">
      {src ? (
        // biome-ignore lint/performance/noImgElement: commenter photos are remote and arbitrary-size
        <img src={src} alt="" />
      ) : (
        name.trim()[0]?.toUpperCase()
      )}
    </span>
  )
  return onClick ? (
    <button
      type="button"
      onClick={onClick}
      data-interactive=""
      aria-pressed={selected}
      aria-label={name ? `Comment by ${name}` : "Comment"}
      {...shared}
    >
      {face}
    </button>
  ) : (
    <span role="img" aria-label={name ? `Comment by ${name}` : "Comment"} {...shared}>
      {face}
    </span>
  )
}
