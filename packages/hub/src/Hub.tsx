/*
 * The hub, in the shape of Wispr Flow's: a cream sidebar, one large paper
 * panel, serif numbers, and settings in a modal. Purely presentational: the
 * host passes the data and the actions, so the website's demo and the
 * desktop app's live rooms look exactly the same.
 */
import { BoltIcon, ChatIcon, CheckIcon, GearIcon, HashIcon, HomeIcon, ShieldIcon } from '@kian/ui'
import { useEffect, useState } from 'react'
import { Insights } from './Insights'
import { NavItem } from './NavItem'
import { Approvals, Rooms } from './Lists'
import { Settings } from './Settings'
import { Today } from './Today'
import type { HubProps, HubSetupStep, SettingsTab } from './types'

type View = 'today' | 'approvals' | 'rooms' | 'insights'

export function Hub(props: HubProps) {
  const { data } = props
  const [view, setView] = useState<View>('today')
  const [settings, setSettings] = useState<SettingsTab | null>(props.openSettings ?? null)

  useEffect(() => {
    if (props.openSettings) setSettings(props.openSettings)
  }, [props.openSettings])

  return (
    <div className={`hub ${props.className ?? ''}`}>
      <aside className="hub__side">
        <div className="hub__logo">
          {props.logo}
          {props.badge && <span className="hub__chip">{props.badge}</span>}
        </div>
        <nav className="hub__nav" aria-label="Kian">
          <NavItem icon={<HomeIcon />} label="Today" active={view === 'today'} onClick={() => setView('today')} />
          <NavItem
            icon={<ShieldIcon />}
            label="Approvals"
            count={data.approvals.length}
            active={view === 'approvals'}
            onClick={() => setView('approvals')}
          />
          <NavItem icon={<HashIcon />} label="Rooms" active={view === 'rooms'} onClick={() => setView('rooms')} />
          {props.insights && (
            <NavItem icon={<BoltIcon />} label="Insights" active={view === 'insights'} onClick={() => setView('insights')} />
          )}
        </nav>
        {data.setup.some((s) => !s.done) && <SetupCard steps={data.setup} onOpen={(tab) => setSettings(tab)} />}
        <div className="hub__side-foot">
          <NavItem icon={<ChatIcon />} label="Invite your team" onClick={() => setSettings('team')} />
          <NavItem icon={<GearIcon />} label="Settings" onClick={() => setSettings('general')} />
        </div>
      </aside>

      <main className="hub__panel">
        {view === 'today' && (
          <Today
            data={data}
            banner={props.banner}
            onApprovals={() => setView('approvals')}
            onVoice={() => setSettings('agents')}
          />
        )}
        {view === 'approvals' && <Approvals approvals={data.approvals} onApprove={props.onApprove} onRefuse={props.onRefuse} />}
        {view === 'rooms' && <Rooms rooms={data.rooms} />}
        {view === 'insights' && <Insights />}
      </main>

      {settings && <Settings tab={settings} rows={props.settings} onTab={setSettings} onClose={() => setSettings(null)} />}
    </div>
  )
}

function SetupCard({ steps, onOpen }: { steps: HubSetupStep[]; onOpen: (tab: SettingsTab) => void }) {
  const done = steps.filter((s) => s.done).length
  return (
    <div className="setup-card">
      <div className="setup-card__title">Set up Kian</div>
      <div className="setup-card__bar" aria-label={`${done} of ${steps.length} done`}>
        <i style={{ transform: `scaleX(${done / steps.length})` }} />
      </div>
      <ul>
        {steps.map((s) => (
          <li key={s.label}>
            <button
              className="setup-card__row"
              data-done={s.done || undefined}
              onClick={s.done ? undefined : () => onOpen(s.tab ?? 'connectors')}
            >
              <span className="setup-card__check">{s.done && <CheckIcon size={12} />}</span>
              {s.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
