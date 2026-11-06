"use client"

import { Popover } from "radix-ui"
import { cn } from "./utils"
import "./designs.css"
import { useControllable } from "./useControllable"

/** A swatch: its value, its name, and the CSS color that paints it (use a token). */
export type ColorOption = { value: string; label: string; color: string }

export const DEFAULT_COLORS: readonly ColorOption[] = [
  { value: "orange", label: "Orange", color: "var(--color-ds-wheel-1)" },
  { value: "yellow", label: "Yellow", color: "var(--color-ds-wheel-2)" },
  { value: "green", label: "Green", color: "var(--color-ds-wheel-3)" },
  { value: "cyan", label: "Cyan", color: "var(--color-ds-wheel-4)" },
  { value: "blue", label: "Blue", color: "var(--color-ds-wheel-5)" },
  { value: "purple", label: "Purple", color: "var(--color-ds-wheel-6)" },
  { value: "pink", label: "Pink", color: "var(--color-ds-wheel-7)" },
  { value: "ink", label: "Ink", color: "var(--ds-text-strong)" },
]

export type ColorPickerProps = {
  colors?: readonly ColorOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  "aria-label"?: string
  className?: string
}

/** The poster's color wheel button (48px, a 24px spectrum ring), swatches in the kit's popover. */
export function ColorPicker({
  colors = DEFAULT_COLORS,
  value,
  defaultValue,
  onValueChange,
  className,
  "aria-label": ariaLabel = "Color",
}: ColorPickerProps) {
  const [current, setCurrent] = useControllable(
    value,
    defaultValue ?? colors[0]?.value ?? "",
    onValueChange,
  )
  const selected = colors.find((c) => c.value === current)

  return (
    <Popover.Root>
      <Popover.Trigger
        aria-label={`${ariaLabel}: ${selected?.label ?? "none"}`}
        className={cn("ds-wheel ds-surface", className)}
      >
        <span className="ds-wheel__ring" />
        <span className="ds-wheel__dot" style={{ background: selected?.color }} />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content sideOffset={8} className="ds-popover-surface" style={{ minWidth: 0 }}>
          <div role="radiogroup" aria-label={ariaLabel} className="ds-swatches">
            {colors.map((color) => (
              // biome-ignore lint/a11y/useSemanticElements: a round swatch acting as a radio
              <button
                key={color.value}
                type="button"
                role="radio"
                aria-checked={color.value === current}
                aria-label={color.label}
                className="ds-swatch"
                style={{ background: color.color }}
                onClick={() => setCurrent(color.value)}
              />
            ))}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
