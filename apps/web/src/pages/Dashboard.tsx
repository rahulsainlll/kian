/*
 * The team dashboard, in the shape of Wispr Flow's hub: a cream sidebar, one
 * large paper panel, serif numbers, and settings in a modal. It only reads the
 * rooms; every button posts to a room. The views live in dashboard/.
 */
import { BoltIcon, ChatIcon, CheckIcon, GearIcon, HashIcon, HomeIcon, ShieldIcon } from '@kian/ui'
import { useState, type ReactNode } from 'react'
import { Logo } from '../Chrome'
import './dashboard.css'
import { Today } from './dashboard/Today'
import { Approvals, Rooms } from './dashboard/Lists'
import { Insights } from './dashboard/Insights'
import { Settings, type SettingsTab } from './dashboard/Settings'

type View = 'today' | 'approvals' | 'rooms' | 'insights'

export function Dashboard() {
  const [view, setView] = useState<View>('today')
  const [settings, setSettings] = useState<SettingsTab | null>(null)

  return (
    <div className="hub">
      <aside className="hub__side">
        <a className="hub__logo" href="/" aria-label="kian home">
          <Logo size={30} />
          <span className="hub__chip">Team</span>
        </a>
        <nav className="hub__nav" aria-label="Kian">
          <NavItem icon={<HomeIcon />} label="Today" active={view === 'today'} onClick={() => setView('today')} />
          <NavItem icon={<ShieldIcon />} label="Approvals" count={1} active={view === 'approvals'} onClick={() => setView('approvals')} />
          <NavItem icon={<HashIcon />} label="Rooms" active={view === 'rooms'} onClick={() => setView('rooms')} />
          <NavItem icon={<BoltIcon />} label="Insights" active={view === 'insights'} onClick={() => setView('insights')} />
        </nav>
        <SetupCard onConnect={() => setSettings('connectors')} />
        <div className="hub__side-foot">
          <NavItem icon={<ChatIcon />} label="Invite your team" onClick={() => setSettings('team')} />
          <NavItem icon={<GearIcon />} label="Settings" onClick={() => setSettings('general')} />
        </div>
      </aside>

      <main className="hub__panel">
        {view === 'today' && <Today onApprovals={() => setView('approvals')} onVoice={() => setSettings('agents')} />}
        {view === 'approvals' && <Approvals />}
        {view === 'rooms' && <Rooms />}
        {view === 'insights' && <Insights />}
      </main>

      {settings && <Settings tab={settings} onTab={setSettings} onClose={() => setSettings(null)} />}
    </div>
  )
}

export function NavItem({ icon, label, count, active, onClick }: { icon: ReactNode; label: string; count?: number; active?: boolean; onClick?: () => void }) {
  return (
    <button className="hub__item" aria-current={active ? 'page' : undefined} onClick={onClick}>
      <span className="hub__icon">{icon}</span>
      {label}
      {count ? <span className="hub__count">{count}</span> : null}
    </button>
  )
}

const SETUP = [
  { label: 'Start a Switch server', done: true },
  { label: 'Connect Gmail and Calendar', done: true },
  { label: 'Import your lead sheet', done: false },
  { label: 'Bridge Telegram', done: false },
]

function SetupCard({ onConnect }: { onConnect: () => void }) {
  const done = SETUP.filter((s) => s.done).length
  return (
    <div className="setup-card">
      <div className="setup-card__title">Set up Kian</div>
      <div className="setup-card__bar" aria-label={`${done} of ${SETUP.length} done`}>
        <i style={{ transform: `scaleX(${done / SETUP.length})` }} />
      </div>
      <ul>
        {SETUP.map((s) => (
          <li key={s.label}>
            <button className="setup-card__row" data-done={s.done || undefined} onClick={s.done ? undefined : onConnect}>
              <span className="setup-card__check">{s.done && <CheckIcon size={12} />}</span>
              {s.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
