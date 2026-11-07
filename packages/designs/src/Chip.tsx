/*
 * Chip: a removable filter chip that opens and closes its own width.
 */
"use client"

import { type ReactNode, useLayoutEffect, useRef, useState } from "react"
import { cn } from "./utils"
import "./designs.css"
import { Icon } from "./Icon"

export type ChipProps = {
  children: ReactNode
  /** Shows the remove ×. The chip closes its own width first, then this is called. */
  onRemove?: () => void
  /** The row's own gap, so a removed chip takes no space at all. */
  gap?: number
  className?: string
}

const CLOSE_MS = 500

/**
 * A 24px filter chip. It arrives by opening its own width (the chips after it
 * slide over) and leaves the same way when its × is pressed.
 */
export function Chip({ children, onRemove, gap = 0, className }: ChipProps) {
  const chip = useRef<HTMLSpanElement>(null)
  const [w, setW] = useState<number | null>(null)
  const [show, setShow] = useState(false)
  const label = typeof children === "string" ? children : "filter"

  useLayoutEffect(() => {
    const element = chip.current
    if (!element) return
    // Measured live, so a late font or stylesheet never leaves the slot too narrow
    const observer = new ResizeObserver(() => setW(element.offsetWidth))
    observer.observe(element)
    setW(element.offsetWidth)
    // Mount closed, then open on the next frame so the slot widens into place
    const frame = requestAnimationFrame(() => setShow(true))
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [])

  const remove = () => {
    setShow(false)
    setTimeout(() => onRemove?.(), CLOSE_MS)
  }

  return (
    <span
      className={cn("ds-chip-slot", className)}
      data-show={show || undefined}
      style={{ width: show ? (w ?? "auto") : 0, marginRight: show ? 0 : -gap }}
    >
      <span ref={chip} className="ds-chip" data-removable={onRemove ? true : undefined}>
        <span className="ds-chip__label">{children}</span>
        {onRemove && (
          <button
            type="button"
            className="ds-chip__x"
            onClick={remove}
            aria-label={`Remove ${label}`}
            tabIndex={show ? 0 : -1}
          >
            <Icon name="close" size={10} stroke={1.8} />
          </button>
        )}
      </span>
    </span>
  )
}
