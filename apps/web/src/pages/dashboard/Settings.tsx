/*
 * The settings modal: general, agents, connectors, team and privacy tabs.
 * A bottom sheet on phones. Connectors show a connect button that resolves.
 */
import { ActionButton, BrandMark, type ActionStatus, type BrandName } from '@kian/designs'
import { BoltIcon, ChatIcon, CheckIcon, CloseIcon, GearIcon, PlaneIcon, ShieldIcon, TableIcon } from '@kian/ui'
import { useEffect, useState, type ReactNode } from 'react'
import { NavItem } from '../Dashboard'

// ── Settings modal ──────────────────────────────────────────────────────────

export type SettingsTab = 'general' | 'agents' | 'connectors' | 'team' | 'privacy'

const TABS: { id: SettingsTab; label: string; icon: ReactNode }[] = [
  { id: 'general', label: 'General', icon: <GearIcon /> },
  { id: 'agents', label: 'Agents', icon: <BoltIcon /> },
  { id: 'connectors', label: 'Connectors', icon: <TableIcon /> },
  { id: 'team', label: 'Team', icon: <ChatIcon /> },
  { id: 'privacy', label: 'Data and privacy', icon: <ShieldIcon /> },
]

export function Settings({ tab, onTab, onClose }: { tab: SettingsTab; onTab: (t: SettingsTab) => void; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label="Settings">
      <div className="modal__scrim" onClick={onClose} />
      <div className="modal__sheet">
        <nav className="modal__nav">
          <div className="hub__label">Settings</div>
          {TABS.map((t) => (
            <NavItem key={t.id} icon={t.icon} label={t.label} active={tab === t.id} onClick={() => onTab(t.id)} />
          ))}
          <div className="modal__version">Kian v0.1 · Switch 0.31</div>
        </nav>
        <div className="modal__body">
          <button className="modal__close" aria-label="Close settings" onClick={onClose}>
            <CloseIcon />
          </button>
          <h2 className="modal__title">{TABS.find((t) => t.id === tab)?.label}</h2>
          <div className="set-rows">{ROWS[tab]}</div>
        </div>
      </div>
    </div>
  )
}

function SetRow({ title, desc, action }: { title: string; desc: ReactNode; action: ReactNode }) {
  return (
    <div className="set-row">
      <div>
        <div className="set-row__title">{title}</div>
        <div className="set-row__desc">{desc}</div>
      </div>
      {action}
    </div>
  )
}

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

function Connector({ name, desc, brand, glyph, connected }: { name: string; desc: string; brand?: BrandName; glyph?: ReactNode; connected?: boolean }) {
  const [status, setStatus] = useState<ActionStatus>(connected ? 'done' : 'idle')
  return (
    <div className="set-row">
      <div className="set-row__lead">
        {brand ? <BrandMark brand={brand} size={32} tile /> : <span className="glyph-tile">{glyph}</span>}
        <div>
          <div className="set-row__title">{name}</div>
          <div className="set-row__desc">{desc}</div>
        </div>
      </div>
      {status === 'done' ? (
        <span className="connected">
          <CheckIcon size={12} /> Connected
        </span>
      ) : (
        <ActionButton
          status={status}
          doneLabel="Connected"
          onClick={async () => {
            setStatus('pending')
            await wait(1300)
            setStatus('done')
          }}
        >
          Connect
        </ActionButton>
      )}
    </div>
  )
}

export const change = <button className="cream-btn">Change</button>

const ROWS: Record<SettingsTab, ReactNode> = {
  general: (
    <>
      <SetRow
        title="Shortcut"
        desc={
          <>
            Press <kbd>⌘⇧Space</kbd> and speak.
          </>
        }
        action={change}
      />
      <SetRow title="Microphone" desc="Built-in mic (recommended)" action={change} />
      <SetRow title="Morning brief" desc="Weekdays at 9:00, the first time you open your laptop" action={change} />
      <SetRow title="Read cards aloud" desc="Brief and approvals only" action={change} />
    </>
  ),
  agents: (
    <>
      <SetRow title="kian" desc="Coordinator. Anyone in its rooms can address it." action={change} />
      <SetRow title="kian-scribe" desc="Writer. Only you and kian can address it." action={change} />
      <SetRow title="kian-studio" desc="Content. Lives in #content." action={change} />
      <SetRow title="Your voice" desc="identity.md, learned from 5 sent emails" action={<button className="cream-btn">Update</button>} />
    </>
  ),
  connectors: (
    <>
      <Connector name="Switch server" desc="localhost:8081 · 3 agents online" glyph={<BoltIcon />} connected />
      <Connector name="Mattermost" desc="Where the rooms live" glyph={<ChatIcon />} connected />
      <Connector name="Gmail" desc="Reads replies and saves drafts. Never sends." brand="gmail" connected />
      <Connector name="Google Calendar" desc="Today’s meetings for the brief" brand="google-calendar" connected />
      <Connector name="Google Sheets" desc="The lead list. Every change needs a yes." brand="google-sheets" />
      <Connector name="Telegram" desc="The brief on your phone" glyph={<PlaneIcon />} />
    </>
  ),
  team: (
    <>
      <SetRow title="Yukti" desc="Rep · owns #kian-desk" action={<span className="role">Owner</span>} />
      <SetRow title="Ravi Kapoor" desc="Sales lead · approves in #approvals" action={<span className="role">Approver</span>} />
      <SetRow title="Invite a teammate" desc="They join the rooms you add them to" action={<button className="cream-btn">Invite</button>} />
    </>
  ),
  privacy: (
    <>
      <SetRow title="Where your data lives" desc="Your Google account and your own Switch server. Kian keeps no copy." action={<span className="role">Local</span>} />
      <SetRow title="Sending" desc="Agents can only create drafts. There is no send command." action={<span className="role">Off</span>} />
      <SetRow title="Demo mode" desc="Use the synthetic leads from seed.py" action={change} />
    </>
  ),
}
