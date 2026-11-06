import type { CSSProperties } from "react"
import { cn } from "./utils"
import { Avatar, type AvatarTone } from "./Avatar"
import "./designs.css"

export type FacepileProps = {
  names: readonly string[]
  size?: number
  overlap?: number
  /** The real gap cut around each face where the next sits on it. */
  gap?: number
  tones?: readonly AvatarTone[]
  className?: string
  style?: CSSProperties
}

/**
 * Overlapping avatars, each cut out where the next sits on it: a real gap (a
 * mask), so whatever is behind shows through, never a ring painted in one color.
 */
export function Facepile({
  names,
  size = 22,
  overlap = 6,
  gap = 2,
  tones,
  className,
  style,
}: FacepileProps) {
  const r = size / 2
  const next = size - overlap + r
  const mask = `radial-gradient(circle at ${next}px 50%, transparent ${r + gap}px, black ${r + gap + 0.5}px)`
  return (
    <span
      role="img"
      aria-label={names.join(", ")}
      className={cn("ds-facepile", className)}
      style={{ "--ds-overlap": `${-overlap}px`, ...style } as CSSProperties}
    >
      {names.map((name, i) => (
        <span
          // biome-ignore lint/suspicious/noArrayIndexKey: names can repeat; faces are positional
          key={`${name}-${i}`}
          className="ds-facepile__face"
          style={i < names.length - 1 ? { WebkitMaskImage: mask, maskImage: mask } : undefined}
        >
          <Avatar name={name} size={size} tone={tones?.[i] ?? "person"} />
        </span>
      ))}
    </span>
  )
}
