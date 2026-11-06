"use client"

import { Checkbox } from "radix-ui"
import { type ReactNode, useId } from "react"
import { cn } from "./utils"
import { Check } from "./Check"
import "./designs.css"
import { useControllable } from "./useControllable"

export type ChecklistItem = { value: string; label: ReactNode; disabled?: boolean }

export type ChecklistProps = {
  items: readonly ChecklistItem[]
  /** The checked values. */
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
  "aria-label": string
  className?: string
}

/** The poster's Design ✓ Build ✓ Ship: 36px rows, 18px checks, 17px labels on a raised card. */
export function Checklist({
  items,
  value,
  defaultValue = [],
  onValueChange,
  className,
  "aria-label": ariaLabel,
}: ChecklistProps) {
  const [checked, setChecked] = useControllable(value, defaultValue, onValueChange)
  const id = useId()

  return (
    <ul aria-label={ariaLabel} className={cn("ds-tasks ds-poster ds-surface", className)}>
      {items.map((item) => {
        const on = checked.includes(item.value)
        const itemId = `${id}-${item.value}`
        return (
          <li key={item.value} className="ds-task">
            <Checkbox.Root
              id={itemId}
              className="ds-task__box"
              checked={on}
              disabled={item.disabled}
              onCheckedChange={(next) =>
                setChecked(
                  next === true
                    ? [...checked, item.value]
                    : checked.filter((v) => v !== item.value),
                )
              }
            >
              <Check on={on} size={18} />
            </Checkbox.Root>
            <label htmlFor={itemId} className="ds-task__label">
              {item.label}
            </label>
          </li>
        )
      })}
    </ul>
  )
}
