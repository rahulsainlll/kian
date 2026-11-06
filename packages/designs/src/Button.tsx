import type { ComponentProps, ReactNode } from "react"
import { cn } from "./utils"
import "./designs.css"

export type ButtonProps = ComponentProps<"button"> & {
  /** primary: the lit accent face. danger: the same face in orange, for destructive actions.
   *  secondary: a neutral raised face. ghost: flat until hovered. */
  variant?: "primary" | "danger" | "secondary" | "ghost"
  /** sm: 32px. md: 40px, the same height as Field. */
  size?: "sm" | "md"
  /** A glyph before the label (or the only content, with `aria-label`). */
  icon?: ReactNode
  /** A glyph after the label, e.g. a chevron on a menu trigger. */
  trailing?: ReactNode
}

/** A tactile button on the type scale's label step: lit face, glow, rim; hover, press, focus, disabled. */
export function Button({
  variant = "secondary",
  size = "md",
  icon,
  trailing,
  children,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn("ds-button", className)}
      data-variant={variant}
      data-size={size}
      data-icon-only={!children || undefined}
      {...props}
    >
      {icon}
      {children}
      {trailing}
    </button>
  )
}
