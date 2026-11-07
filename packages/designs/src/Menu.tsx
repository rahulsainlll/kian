/*
 * Menu: a dropdown menu on Radix, with items, separators and labels.
 */
"use client"

import { DropdownMenu } from "radix-ui"
import type { ReactNode } from "react"
import { cn } from "./utils"
import "./designs.css"
import { Icon } from "./Icon"

export type MenuEntry =
  | {
      label: ReactNode
      icon?: ReactNode
      shortcut?: string
      onSelect?: () => void
      disabled?: boolean
      /** Shows a tick, for an option that is on. */
      checked?: boolean
    }
  | "separator"

export type MenuProps = {
  /** The control that opens the menu. Rendered as-is (asChild), so pass a button. */
  trigger: ReactNode
  items: readonly MenuEntry[]
  align?: "start" | "center" | "end"
  className?: string
}

/** The kit's menu: 26px rows of 12px text on a raised popover, opened from any trigger. */
export function Menu({ trigger, items, align = "start", className }: MenuProps) {
  const ticks = items.some((item) => item !== "separator" && item.checked !== undefined)
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align={align}
          sideOffset={6}
          className={cn("ds-popover-surface ds-menu", className)}
        >
          {items.map((item, i) =>
            item === "separator" ? (
              // biome-ignore lint/suspicious/noArrayIndexKey: separators have no identity
              <DropdownMenu.Separator key={`sep-${i}`} className="ds-menu__separator" />
            ) : (
              <DropdownMenu.Item
                // biome-ignore lint/suspicious/noArrayIndexKey: menu rows are positional
                key={i}
                className="ds-menu__item"
                disabled={item.disabled}
                onSelect={item.onSelect}
              >
                {ticks && (
                  <span className="ds-menu__check">
                    {item.checked && <Icon name="check" size={12} stroke={1.8} />}
                  </span>
                )}
                {item.icon && <span className="ds-menu__icon">{item.icon}</span>}
                <span className="ds-menu__label">{item.label}</span>
                {item.shortcut && <span className="ds-menu__shortcut">{item.shortcut}</span>}
              </DropdownMenu.Item>
            ),
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
