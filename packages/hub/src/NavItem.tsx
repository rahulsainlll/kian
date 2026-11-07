/*
 * NavItem: one row of the hub's sidebar or the settings modal's tab list,
 * with an icon, a label and an optional count.
 */
import type { ReactNode } from 'react'

export function NavItem({ icon, label, count, active, onClick }: { icon: ReactNode; label: string; count?: number; active?: boolean; onClick?: () => void }) {
  return (
    <button className="hub__item" aria-current={active ? 'page' : undefined} onClick={onClick}>
      <span className="hub__icon">{icon}</span>
      {label}
      {count ? <span className="hub__count">{count}</span> : null}
    </button>
  )
}
