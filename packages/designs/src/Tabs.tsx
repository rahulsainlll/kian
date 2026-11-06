"use client"

import { Tabs as TabsPrimitive } from "radix-ui"
import { type ReactNode, useLayoutEffect, useRef, useState } from "react"
import { cn } from "./utils"
import "./designs.css"
import { useControllable } from "./useControllable"

export type TabItem<T extends string = string> = {
  value: T
  label: ReactNode
  /** The panel shown while this tab is on. */
  content?: ReactNode
  disabled?: boolean
}

export type TabsProps<T extends string = string> = {
  items: readonly TabItem<T>[]
  value?: T
  defaultValue?: T
  onValueChange?: (value: T) => void
  "aria-label": string
  className?: string
  panelClassName?: string
}

/** A row of tabs over a hairline, with an underline that slides to the active one (measured). */
export function Tabs<T extends string = string>({
  items,
  value,
  defaultValue,
  onValueChange,
  className,
  panelClassName,
  "aria-label": ariaLabel,
}: TabsProps<T>) {
  const [current, setCurrent] = useControllable(
    value,
    defaultValue ?? items[0]?.value,
    onValueChange,
  )
  const row = useRef<HTMLDivElement>(null)
  const [bar, setBar] = useState({ x: 0, w: 0 })

  // biome-ignore lint/correctness/useExhaustiveDependencies: re-measures the active tab whenever it or the tab set changes
  useLayoutEffect(() => {
    const list = row.current
    if (!list) return
    const measure = () => {
      const tab = list.querySelector<HTMLElement>('[data-state="active"]')
      if (tab) setBar({ x: tab.offsetLeft, w: tab.offsetWidth })
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(list)
    return () => observer.disconnect()
  }, [current, items.length])

  return (
    <TabsPrimitive.Root value={current} onValueChange={(next) => setCurrent(next as T)}>
      <TabsPrimitive.List ref={row} aria-label={ariaLabel} className={cn("ds-tabs", className)}>
        {/* A 1px line scaled to the tab's width: it slides on transform alone */}
        <span
          className="ds-tabs__bar"
          style={{ transform: `translateX(${bar.x}px) scaleX(${bar.w})` }}
          aria-hidden
        />
        {items.map((item) => (
          <TabsPrimitive.Trigger
            key={item.value}
            value={item.value}
            disabled={item.disabled}
            className="ds-tabs__tab"
            data-on={item.value === current || undefined}
          >
            {item.label}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>
      {items.map(
        (item) =>
          item.content !== undefined && (
            <TabsPrimitive.Content key={item.value} value={item.value} className={panelClassName}>
              {item.content}
            </TabsPrimitive.Content>
          ),
      )}
    </TabsPrimitive.Root>
  )
}
