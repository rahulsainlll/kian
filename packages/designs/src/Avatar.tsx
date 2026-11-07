/*
 * Avatar: an image or initials in a circle, with tones and a stable colour
 * per person name.
 */
import type { ComponentProps } from "react"
import { cn } from "./utils"
import "./designs.css"

export type AvatarTone = "accent" | "ink" | "success" | "person" | "ios"

export type AvatarProps = ComponentProps<"span"> & {
  /** Whose avatar: the initial(s), the alt text, and the person color. */
  name?: string
  size?: number
  /** person: a muted color of its own, picked from the name. accent: the one the
   *  story is about. ink: a gray disc. ios: Apple's contact monogram, two initials. */
  tone?: AvatarTone
  src?: string
  /** A status ring cut out from the background; it eases between states. */
  ring?: "pending" | "waiting" | "confirmed" | "declined"
}

// Six muted, opaque fills that read on light and dark grounds, one per person
const PEOPLE = 6
const personOf = (name: string) => {
  let h = 0
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % 9973
  return (h % PEOPLE) + 1
}

/** A round avatar with an initial, or a photo from `src`. */
export function Avatar({
  name = "",
  size = 24,
  tone = name ? "person" : "ink",
  src,
  ring,
  className,
  style,
  ...props
}: AvatarProps) {
  const words = name.trim().split(/\s+/).filter(Boolean)
  const initials =
    tone === "ios"
      ? (words[0]?.[0] ?? "") + (words.length > 1 ? (words[words.length - 1]?.[0] ?? "") : "")
      : (name.trim()[0] ?? "")

  return (
    <span
      role="img"
      aria-label={name || undefined}
      aria-hidden={name ? undefined : true}
      className={cn("ds-avatar", className)}
      data-tone={tone}
      data-ring={ring}
      data-person={tone === "person" && name ? personOf(name) : undefined}
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * (tone === "ios" ? 0.4 : size < 24 ? 0.5 : 0.42)),
        ...style,
      }}
      {...props}
    >
      {src ? (
        // biome-ignore lint/performance/noImgElement: avatars are remote, arbitrary-size user photos
        <img src={src} alt="" />
      ) : (
        initials && <span className="ds-avatar__initial">{initials.toUpperCase()}</span>
      )}
    </span>
  )
}
