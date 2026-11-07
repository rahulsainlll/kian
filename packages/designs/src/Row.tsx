/*
 * Row: one inbox-style list row (lead, title, preview, meta, unread dot).
 */
import type { CSSProperties, ReactNode } from "react"
import { cn } from "./utils"
import "./designs.css"

export type RowProps = {
  /** The disc on the left: an Avatar, an icon tile, a thumbnail. */
  lead?: ReactNode
  title: ReactNode
  subtitle?: ReactNode
  /** Trailing detail on the first line: a time, a count. */
  meta?: ReactNode
  /** Up to two lines of preview text under the subtitle. */
  preview?: ReactNode
  /** An unread dot hanging in the margin left of the lead; the row never moves. */
  unread?: boolean
  selected?: boolean
  /** Inset of the row's fill, in px. 12 by default; a dense list takes 8. */
  pad?: number
  /** Makes the row a button, with the kit's hover fill. */
  onClick?: () => void
  /** Trailing controls: a Toggle, a chevron, a Badge. */
  children?: ReactNode
  className?: string
}

/**
 * One row of a list: the lead centered on the two lines, the title 4–6px above its
 * subtitle, meta on the first line, and an unread dot hanging in the margin.
 */
export function Row({
  lead,
  title,
  subtitle,
  meta,
  preview,
  unread,
  selected,
  pad = 12,
  onClick,
  children,
  className,
}: RowProps) {
  const parts = (
    <>
      {unread && <span className="ds-row__dot" aria-hidden />}
      {lead && <span className="ds-row__lead">{lead}</span>}
      <span className="ds-row__body">
        <span className="ds-row__head">
          <span className="ds-row__title">{title}</span>
          {meta && <span className="ds-row__meta">{meta}</span>}
        </span>
        {subtitle && <span className="ds-row__subtitle">{subtitle}</span>}
      </span>
      {preview && (
        <span className="ds-row__preview" data-text>
          {preview}
        </span>
      )}
      {children}
    </>
  )
  const shared = {
    className: cn("ds-row", className),
    "data-selected": selected || undefined,
    "data-unread": unread || undefined,
    "data-lead": lead ? "" : undefined,
    style: { "--ds-row-pad": `${pad}px` } as CSSProperties,
  }
  return onClick ? (
    <button
      type="button"
      onClick={onClick}
      data-interactive=""
      aria-pressed={selected}
      {...shared}
      style={{ ...shared.style, width: "100%" }}
    >
      {parts}
    </button>
  ) : (
    <div {...shared}>{parts}</div>
  )
}
