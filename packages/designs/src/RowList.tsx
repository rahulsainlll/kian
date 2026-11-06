import { Children, type CSSProperties, type ReactNode } from "react"
import { cn } from "./utils"
import "./designs.css"

export type RowListProps = {
  /** Row elements. Each is wrapped in an <li>. */
  children: ReactNode
  /** Space between rows in px, so adjacent fills (selected, hovered) never merge. 2 by default. */
  gap?: number
  /** Reserve a left gutter for unread dots. Use it when the list isn't already inside padding. */
  dotGutter?: boolean
  "aria-label"?: string
  className?: string
  style?: CSSProperties
}

/** A list of Rows with the kit's spacing: a small gap between fills, and room for the unread dot. */
export function RowList({
  children,
  gap = 2,
  dotGutter,
  className,
  style,
  "aria-label": ariaLabel,
}: RowListProps) {
  return (
    <ul
      aria-label={ariaLabel}
      className={cn("ds-row-list", className)}
      data-gutter={dotGutter || undefined}
      style={{ "--ds-row-list-gap": `${gap}px`, ...style } as CSSProperties}
    >
      {Children.map(children, (child) => child && <li>{child}</li>)}
    </ul>
  )
}
