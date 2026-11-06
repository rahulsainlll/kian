"use client"

import { Switch } from "radix-ui"
import { type ComponentProps, useState } from "react"
import { cn } from "./utils"
import "./designs.css"

export type ToggleProps = Omit<ComponentProps<typeof Switch.Root>, "asChild"> & {
  /** md: the kit's 30×18 switch. lg: the poster's, 1.6× (48×29). */
  size?: "md" | "lg"
}

/**
 * A switch: the knob slides and the track takes the accent when on. Hovering stretches the
 * knob toward the other side; once it's flipped, the knob rests until the pointer leaves and
 * comes back, so the stretch only ever hints at the next move.
 */
export function Toggle({
  size = "md",
  className,
  checked,
  defaultChecked,
  onCheckedChange,
  onPointerLeave,
  ...props
}: ToggleProps) {
  const [settled, setSettled] = useState(false)
  return (
    <Switch.Root
      className={cn("ds-toggle", className)}
      data-size={size === "lg" ? "lg" : undefined}
      data-settled={settled || undefined}
      checked={checked}
      defaultChecked={defaultChecked}
      onCheckedChange={(value) => {
        setSettled(true)
        onCheckedChange?.(value)
      }}
      onPointerLeave={(event) => {
        setSettled(false)
        onPointerLeave?.(event)
      }}
      {...props}
    >
      <Switch.Thumb className="ds-toggle__knob" />
    </Switch.Root>
  )
}
