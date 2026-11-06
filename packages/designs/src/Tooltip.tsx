"use client"

import { Tooltip as TooltipPrimitive } from "radix-ui"
import type { ReactNode } from "react"
import "./designs.css"

export type TooltipProps = {
  /** What the control is called. A tooltip names an icon; it never carries the story. */
  label: ReactNode
  /** The control it names. Rendered as-is (asChild), so pass a focusable element. */
  children: ReactNode
  side?: "top" | "bottom" | "left" | "right"
  delay?: number
}

/** The kit's 22px dark label, placed by Radix, shown on hover and keyboard focus. */
export function Tooltip({ label, children, side = "bottom", delay = 400 }: TooltipProps) {
  return (
    <TooltipPrimitive.Provider delayDuration={delay}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content side={side} sideOffset={6} className="ds-tip">
            <span>{label}</span>
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  )
}
