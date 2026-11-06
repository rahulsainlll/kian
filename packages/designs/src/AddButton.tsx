import type { ComponentProps, ReactNode } from "react"
import { cn } from "./utils"
import "./designs.css"

export type AddButtonProps = Omit<ComponentProps<"button">, "children"> & {
  /** The label. "Add content" by default. */
  children?: ReactNode
}

function PlusGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        className="ds-add__arm"
        d="M3.5 8h9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        className="ds-add__arm"
        d="M8 3.5v9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

/** The plus twice in one cell: the gray one, and a blue copy that fades in on hover. */
function Plus() {
  return (
    <span className="ds-add__plus" aria-hidden>
      <span className="ds-add__layer">
        <PlusGlyph />
      </span>
      <span className="ds-add__layer ds-add__lit">
        <PlusGlyph />
      </span>
    </span>
  )
}

/**
 * LearnMore's pill, for adding: a plus before the label. On hover (or keyboard focus) the
 * plus warms to the accent and its arms reach out a little, the way something grows; a
 * press gives the pill a small give. Only opacity and transform move, so it stays on the GPU.
 */
export function AddButton({
  children = "Add content",
  className,
  type = "button",
  ...props
}: AddButtonProps) {
  return (
    <button type={type} className={cn("ds-learn ds-add", className)} {...props}>
      <Plus />
      {children}
    </button>
  )
}
