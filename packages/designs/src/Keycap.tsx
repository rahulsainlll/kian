import type { CSSProperties, ReactNode } from "react"
import { cn } from "./utils"
import "./designs.css"

export type KeycapProps = {
  /** The main glyph, centered (a kana, a letter, ⌘). */
  children?: ReactNode
  /** The small legend in the top-left corner. */
  legend?: ReactNode
  /** The cap's side in px; the poster's caps are 36–48. */
  size?: number
  pressed?: boolean
  className?: string
  style?: CSSProperties
}

/** The poster's keycap: a pale face over a darker lip, every proportion scaled from its size. */
export function Keycap({ children, legend, size = 44, pressed, className, style }: KeycapProps) {
  return (
    <kbd
      className={cn("ds-key", className)}
      data-pressed={pressed || undefined}
      style={{ "--ds-key": `${size}px`, ...style } as CSSProperties}
    >
      {legend && <small className="ds-key__legend">{legend}</small>}
      {children && <span className="ds-key__glyph">{children}</span>}
    </kbd>
  )
}
