"use client"

import {
  type ComponentProps,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  useRef,
  useState,
} from "react"
import { cn } from "./utils"
import "./designs.css"
import { useControllable } from "./useControllable"

export type SplitViewProps = Omit<ComponentProps<"div">, "children"> & {
  /** What sits on the left: a sidebar, a list. */
  sidebar: ReactNode
  /** The main panel. */
  children: ReactNode
  /** The sidebar's width in px. */
  size?: number
  defaultSize?: number
  onSizeChange?: (size: number) => void
  /** Narrowest and widest the sidebar can be dragged to. */
  min?: number
  max?: number
  /** Names the handle for a screen reader. */
  label?: string
}

const KEY_STEP = 16

/**
 * A sidebar and a main panel with a handle between them. The handle rests as a short faint
 * bar; near it, the bar lengthens and follows the pointer up and down the gutter; pressed,
 * it darkens and the sidebar follows the drag. Arrow keys resize it too.
 */
export function SplitView({
  sidebar,
  children,
  size,
  defaultSize = 200,
  onSizeChange,
  min = 120,
  max = 360,
  label = "Resize sidebar",
  className,
  style,
  ...props
}: SplitViewProps) {
  const [width, setWidth] = useControllable(size, defaultSize, onSizeChange)
  const [dragging, setDragging] = useState(false)
  const handle = useRef<HTMLDivElement>(null)
  const start = useRef({ x: 0, width: 0 })
  const clamp = (n: number) => Math.round(Math.min(max, Math.max(min, n)))

  // The bar rides the pointer down the gutter: written straight to a CSS variable, so
  // following the pointer never re-renders anything
  const follow = (event: PointerEvent<HTMLDivElement>) => {
    const el = handle.current
    if (!el) return
    const box = el.getBoundingClientRect()
    el.style.setProperty("--ds-split-y", `${event.clientY - box.top}px`)
  }

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    start.current = { x: event.clientX, width }
    setDragging(true)
  }

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    follow(event)
    if (!dragging) return
    const next = clamp(start.current.width + event.clientX - start.current.x)
    if (next !== width) setWidth(next)
  }

  const stop = () => setDragging(false)

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const keys: Record<string, number | undefined> = {
      ArrowLeft: width - KEY_STEP,
      ArrowRight: width + KEY_STEP,
      Home: min,
      End: max,
    }
    const next = keys[event.key]
    if (next === undefined) return
    event.preventDefault()
    setWidth(clamp(next))
  }

  return (
    <div
      className={cn("ds-split", className)}
      data-dragging={dragging || undefined}
      style={{ "--ds-split-size": `${width}px`, ...style } as CSSProperties}
      {...props}
    >
      <div className="ds-split__side">{sidebar}</div>
      {/* biome-ignore lint/a11y/useSemanticElements: a focusable, draggable separator has no native element */}
      <div
        ref={handle}
        className="ds-split__handle"
        role="separator"
        tabIndex={0}
        aria-orientation="vertical"
        aria-label={label}
        aria-valuenow={width}
        aria-valuemin={min}
        aria-valuemax={max}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={stop}
        onPointerCancel={stop}
        onLostPointerCapture={stop}
        onKeyDown={onKeyDown}
      >
        <span className="ds-split__rail">
          <span className="ds-split__bar" />
        </span>
      </div>
      <div className="ds-split__main">{children}</div>
    </div>
  )
}
