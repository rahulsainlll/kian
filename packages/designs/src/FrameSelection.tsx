"use client"

import { type CSSProperties, type ReactNode, useLayoutEffect, useRef, useState } from "react"
import { cn } from "./utils"
import "./designs.css"
import { useControllable } from "./useControllable"

export type FrameSelectionProps = {
  label: string
  selected?: boolean
  defaultSelected?: boolean
  onSelectedChange?: (selected: boolean) => void
  children?: ReactNode
  className?: string
  /** The frame's own size; the poster's is 104×84. */
  style?: CSSProperties
}

/**
 * The poster's design-tool frame: dashed, its name above in 12px mono. Selected,
 * the edge turns solid accent with corner handles and its live size below.
 */
export function FrameSelection({
  label,
  selected,
  defaultSelected = false,
  onSelectedChange,
  children,
  className,
  style,
}: FrameSelectionProps) {
  const [on, setOn] = useControllable(selected, defaultSelected, onSelectedChange)
  const ref = useRef<HTMLButtonElement>(null)
  const [size, setSize] = useState({ w: 104, h: 84 })

  useLayoutEffect(() => {
    const element = ref.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) => {
      const box = entry.borderBoxSize[0]
      setSize({ w: Math.round(box.inlineSize), h: Math.round(box.blockSize) })
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <div className={cn("ds-frame-wrap", className)}>
      <span className="ds-frame__name">{label}</span>
      <button
        ref={ref}
        type="button"
        className="ds-frame"
        aria-pressed={on}
        aria-label={`Frame ${label}`}
        onClick={() => setOn(!on)}
        style={style}
      >
        {children}
        <span className="ds-frame__detail" aria-hidden>
          {[0, 1, 2, 3].map((corner) => (
            <span key={corner} className="ds-frame__handle" data-corner={corner} />
          ))}
          <span className="ds-frame__size">
            {size.w} × {size.h}
          </span>
        </span>
      </button>
    </div>
  )
}
