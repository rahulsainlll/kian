"use client"

import { Select as SelectPrimitive } from "radix-ui"
import type { ReactNode } from "react"
import { cn } from "./utils"
import "./designs.css"
import { Icon } from "./Icon"

export type SelectOption<T extends string = string> = {
  value: T
  label: ReactNode
  disabled?: boolean
}

export type SelectProps<T extends string = string> = {
  options: readonly SelectOption<T>[]
  value?: T
  defaultValue?: T
  onValueChange?: (value: T) => void
  placeholder?: string
  disabled?: boolean
  "aria-label": string
  className?: string
}

/**
 * A Weekly ⌄ trigger at the control height (40px, at least 128 wide), opening the kit's menu.
 * The menu is at least as wide as the trigger and its labels line up with the trigger's, so the
 * choice reads as the same text dropping open; the check sits at the far end.
 */
export function Select<T extends string = string>({
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder,
  disabled,
  className,
  "aria-label": ariaLabel,
}: SelectProps<T>) {
  return (
    <SelectPrimitive.Root
      value={value}
      defaultValue={defaultValue}
      onValueChange={(next) => onValueChange?.(next as T)}
      disabled={disabled}
    >
      <SelectPrimitive.Trigger
        aria-label={ariaLabel}
        className={cn("ds-select ds-poster ds-surface", className)}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon className="ds-select__chevron">
          <Icon name="chevron-down" size={16} />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={6}
          className="ds-popover-surface ds-menu ds-select__menu"
        >
          <SelectPrimitive.Viewport>
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className="ds-menu__item"
              >
                <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                <span className="ds-menu__check ds-select__check">
                  <SelectPrimitive.ItemIndicator>
                    <Icon name="check" size={14} stroke={2} />
                  </SelectPrimitive.ItemIndicator>
                </span>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  )
}
