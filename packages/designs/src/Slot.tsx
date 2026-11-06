import type { ComponentProps } from "react"
import { cn } from "./utils"
import "./designs.css"

export type SlotProps = ComponentProps<"div"> & {
  open: boolean
  height: number
  /** The list's own gap, so a closed slot takes no space at all. */
  gap?: number
  /** Show the dashed drop mark (while something is being dragged over). */
  dashed?: boolean
}

/**
 * A gap in a list that opens and closes: the source closes behind a card as it
 * is picked up, the destination opens (dashed) where it will land.
 */
export function Slot({
  open,
  height,
  gap = 0,
  dashed,
  className,
  style,
  children,
  ...props
}: SlotProps) {
  return (
    <div
      className={cn("ds-slot", className)}
      data-open={open || undefined}
      data-dashed={dashed || undefined}
      style={{ height: open ? height : 0, marginTop: open ? 0 : -gap, ...style }}
      {...props}
    >
      <div className="ds-slot__clip">
        <div className="ds-slot__mark" style={{ height }} />
      </div>
      {children}
    </div>
  )
}
