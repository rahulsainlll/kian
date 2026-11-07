/*
 * Segmented: a segmented control on Radix ToggleGroup with a sliding thumb.
 */
"use client"

import { ToggleGroup } from "radix-ui"
import type { CSSProperties, ReactNode } from "react"
import { cn } from "./utils"
import "./designs.css"
import { useControllable } from "./useControllable"

export type SegmentedOption<T extends string = string> = {
  value: T
  label: ReactNode
  disabled?: boolean
}

export type SegmentedProps<T extends string = string> = {
  options: readonly SegmentedOption<T>[]
  value?: T
  defaultValue?: T
  onValueChange?: (value: T) => void
  /** default: the kit's gray track with a raised thumb (26px rows, 12px).
   *  soft: the poster's Day / Week / Month (48px, a soft accent thumb, 17px). */
  variant?: "default" | "soft"
  "aria-label": string
  className?: string
  style?: CSSProperties
}

/** Equal segments and one thumb that slides to the chosen one. Arrow keys move between them. */
export function Segmented<T extends string = string>({
  options,
  value,
  defaultValue,
  onValueChange,
  variant = "default",
  className,
  style,
  "aria-label": ariaLabel,
}: SegmentedProps<T>) {
  const [current, setCurrent] = useControllable(
    value,
    defaultValue ?? options[0]?.value,
    onValueChange,
  )
  const index = Math.max(
    0,
    options.findIndex((option) => option.value === current),
  )

  return (
    <ToggleGroup.Root
      type="single"
      value={current}
      // A segmented control always has one on; Radix would let it deselect
      onValueChange={(next) => next && setCurrent(next as T)}
      aria-label={ariaLabel}
      className={cn("ds-seg", className)}
      data-variant={variant === "soft" ? "soft" : undefined}
      style={{ "--n": options.length, ...style } as CSSProperties}
    >
      <span
        className="ds-seg__thumb"
        style={{ transform: `translateX(${index * 100}%)` }}
        aria-hidden
      />
      {options.map((option) => (
        <ToggleGroup.Item
          key={option.value}
          value={option.value}
          disabled={option.disabled}
          className="ds-seg__option"
          data-on={option.value === current || undefined}
        >
          {option.label}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  )
}
