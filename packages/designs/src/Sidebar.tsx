/*
 * Sidebar: app navigation (header, sections, items, actions, footer).
 */
"use client"

import { type ComponentProps, type ReactNode, useId, useState } from "react"
import { cn } from "./utils"
import "./designs.css"

/**
 * A Linear-style navigation sidebar, measured from Linear's own: 12px gutters, 28px rows a
 * pixel apart, 13px medium labels after 14px icons, 8px corners, sections 16px apart under
 * small headings that fold their rows away.
 */
export function Sidebar({ className, ...props }: ComponentProps<"nav">) {
  return <nav className={cn("ds-sidebar", className)} {...props} />
}

export type SidebarHeaderProps = Omit<ComponentProps<"div">, "children"> & {
  /** The workspace's name, beside its mark. */
  name: string
  /** One or two letters on the mark. */
  initials: string
  /** Icon buttons on the right: search, new. */
  actions?: ReactNode
}

/** The workspace switcher and its quick actions, above the rows. */
export function SidebarHeader({
  name,
  initials,
  actions,
  className,
  ...props
}: SidebarHeaderProps) {
  return (
    <div className={cn("ds-sidebar__header", className)} {...props}>
      <button type="button" className="ds-sidebar__workspace">
        <span className="ds-sidebar__mark" aria-hidden>
          {initials}
        </span>
        <span className="ds-sidebar__name">{name}</span>
        <svg className="ds-sidebar__chevron" viewBox="0 0 8 8" aria-hidden="true">
          <path
            d="M1.5 3 4 5.5 6.5 3"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {actions && <div className="ds-sidebar__actions">{actions}</div>}
    </div>
  )
}

export type SidebarActionProps = ComponentProps<"button"> & {
  /** Raised: the white circle Linear gives its new-issue button. */
  raised?: boolean
}

/** A 28px round icon button for the header. Give it an `aria-label`. */
export function SidebarAction({
  raised,
  className,
  type = "button",
  ...props
}: SidebarActionProps) {
  return (
    <button
      type={type}
      className={cn("ds-sidebar__action", className)}
      data-raised={raised || undefined}
      {...props}
    />
  )
}

export type SidebarItemProps = Omit<ComponentProps<"a">, "children"> & {
  icon: ReactNode
  label: string
  /** The page you're on: filled, and the label goes dark. */
  active?: boolean
  /** A count after the label (unread, new). */
  count?: number
  /** One level in, for a team's own pages. */
  nested?: boolean
}

/** One row: an icon and a label, the whole row the link. */
export function SidebarItem({
  icon,
  label,
  active,
  count,
  nested,
  className,
  href = "#",
  onClick,
  ...props
}: SidebarItemProps) {
  return (
    <a
      href={href}
      className={cn("ds-sidebar__item", className)}
      data-active={active || undefined}
      data-nested={nested || undefined}
      aria-current={active ? "page" : undefined}
      onClick={(event) => {
        // A demo row has nowhere to go
        if (href === "#") event.preventDefault()
        onClick?.(event)
      }}
      {...props}
    >
      <span className="ds-sidebar__icon" aria-hidden>
        {icon}
      </span>
      <span className="ds-sidebar__label">{label}</span>
      {count !== undefined && <span className="ds-sidebar__count">{count}</span>}
    </a>
  )
}

export type SidebarSectionProps = {
  /** The small heading. Without one, the rows simply sit 16px below what's above. */
  title?: string
  /** A row that heads the group instead of a small heading (a team, with its pages). */
  header?: { icon: ReactNode; label: string }
  defaultOpen?: boolean
  children: ReactNode
  className?: string
}

/** A group of rows under a heading that folds them away; the caret turns as it does. */
export function SidebarSection({
  title,
  header,
  defaultOpen = true,
  children,
  className,
}: SidebarSectionProps) {
  const [open, setOpen] = useState(defaultOpen)
  const id = useId()
  const toggle = (
    <svg className="ds-sidebar__caret" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M5 6.5h6L8 10Z" fill="currentColor" />
    </svg>
  )
  return (
    <div className={cn("ds-sidebar__section", className)} data-open={open || undefined}>
      {title && (
        <button
          type="button"
          className="ds-sidebar__heading"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((o) => !o)}
        >
          {title}
          {toggle}
        </button>
      )}
      {header && (
        <button
          type="button"
          className="ds-sidebar__item ds-sidebar__group"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((o) => !o)}
        >
          <span className="ds-sidebar__icon" aria-hidden>
            {header.icon}
          </span>
          <span className="ds-sidebar__label">{header.label}</span>
          {toggle}
        </button>
      )}
      <div id={id} className="ds-sidebar__rows" hidden={!open}>
        {children}
      </div>
    </div>
  )
}

/** Pinned to the bottom: help, settings. */
export function SidebarFooter({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("ds-sidebar__footer", className)} {...props} />
}
