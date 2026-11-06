"use client"

import type { ReactNode } from "react"
import { cn } from "./utils"
import "./designs.css"

export type AppIconTone =
  | "blue"
  | "white"
  | "orange"
  | "black"
  | "green"
  | "purple"
  | "red"
  | "sky"
  | "yellow"
  | "teal"
  | "coral"

export type AppIconProps = {
  /** The app's name: the label, and the caption when `caption` is on. */
  label: string
  tone?: AppIconTone
  /** The 24px glyph. */
  children: ReactNode
  /** Jiggle mode: a wobble and the − badge (when `onRemove` is set). */
  editing?: boolean
  onRemove?: () => void
  onClick?: () => void
  caption?: boolean
  className?: string
}

/** The poster's home-screen icon: 48px, a 24% squircle with a glossy edge. */
export function AppIcon({
  label,
  tone = "blue",
  children,
  editing,
  onRemove,
  onClick,
  caption,
  className,
}: AppIconProps) {
  return (
    <div className={cn("ds-app", className)} data-tone={tone} data-editing={editing || undefined}>
      <span className="ds-app__wobble">
        {onClick ? (
          <button type="button" className="ds-app__tile" onClick={onClick} aria-label={label}>
            {children}
          </button>
        ) : (
          <span role="img" aria-label={label} className="ds-app__tile">
            {children}
          </span>
        )}
      </span>
      {editing && onRemove && (
        <button
          type="button"
          className="ds-app__remove"
          onClick={onRemove}
          aria-label={`Remove ${label}`}
        />
      )}
      {caption && <span className="ds-app__caption">{label}</span>}
    </div>
  )
}

export type CalendarIconProps = Omit<AppIconProps, "children" | "tone" | "label"> & {
  date?: Date
  label?: string
}

/** The calendar icon: the weekday in red over the date (FRI / 24). */
export function CalendarIcon({ date = new Date(), label, ...props }: CalendarIconProps) {
  const weekday = date.toLocaleDateString("en", { weekday: "short" }).toUpperCase()
  return (
    <AppIcon tone="white" label={label ?? `Calendar, ${date.toDateString()}`} {...props}>
      <span className="ds-calendar">
        <small>{weekday}</small>
        {date.getDate()}
      </span>
    </AppIcon>
  )
}
