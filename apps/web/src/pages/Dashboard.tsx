import { ActionButton, BrandMark, type ActionStatus, type BrandName } from '@kian/designs'
import {
  ApprovalCard,
  BoltIcon,
  ChatIcon,
  CheckIcon,
  CloseIcon,
  GearIcon,
  HashIcon,
  HomeIcon,
  Mascot,
  PersonAvatar,
  PlaneIcon,
  ShieldIcon,
  TableIcon,
} from '@kian/ui'
import { useEffect, useState, type ReactNode } from 'react'
import { APPROVAL, ROOMS } from '../demo/dashboardData'
import { Logo } from '../Chrome'
import './dashboard.css'

/*
 * The team dashboard, in the shape of Wispr Flow's hub: a cream sidebar, one
 * large paper panel, serif numbers, and settings in a modal. It only reads the
 * rooms; every button posts to a room.
 */

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

function NavItem({ icon, label, count, active, onClick }: { icon: ReactNode; label: string; count?: number; active?: boolean; onClick?: () => void }) {
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

// ── Today ───────────────────────────────────────────────────────────────────

const TIMELINE = [
  { time: '9:14am', who: 'kian', text: 'Asked Ravi about 15% off for Lumen Health in #approvals.' },
  { time: '9:12am', who: 'kian-scribe', text: 'Drafted a reply to Priya Shah moving the call to Tuesday. Waiting in Gmail, not sent.' },
  { time: '9:05am', who: 'kian-scribe', text: 'Turned the Kestrel call into notes, two tasks and a Sheet change for you to approve.' },
  { time: '8:58am', who: 'kian', text: 'Opened #deal-harbor for a new sender, dana@harborfoods.example, and asked whether to add a lead row.' },
  { time: '8:30am', who: 'kian', text: 'Ranked your morning: 3 replies, Rahul at 10:30 first, Harbor Foods waiting 6 days.' },
  { time: 'Yesterday', who: 'kian-studio', text: 'Wrote this week’s LinkedIn post and an X thread from your four answers.' },
]

function Today({ onApprovals, onVoice }: { onApprovals: () => void; onVoice: () => void }) {
  return (
    <>
      <h1 className="hub__title">Morning, Yukti</h1>
      <div className="today">
        <div className="banner">
          <div className="banner__text">
            <h2 className="banner__title">
              Make Kian sound like <em>you</em>
            </h2>
            <p>Give kian-scribe five emails you sent, and every draft starts in your voice.</p>
            <button className="cream-btn" onClick={onVoice}>
              Start now
            </button>
          </div>
          <div className="banner__art" aria-hidden>
            <span style={{ ['--x' as string]: '0px', ['--y' as string]: '18px', ['--r' as string]: '-8deg' }}>
              <Mascot size={110} shape="bubble" color="#19b86b" mood="wink" />
            </span>
            <span style={{ ['--x' as string]: '-34px', ['--y' as string]: '-8px', ['--r' as string]: '6deg' }}>
              <Mascot size={130} mood="look" />
            </span>
            <span style={{ ['--x' as string]: '-60px', ['--y' as string]: '26px', ['--r' as string]: '10deg' }}>
              <Mascot size={96} shape="sun" color="#ff8a1f" mood="happy" />
            </span>
          </div>
        </div>

        <div className="stats">
          <div className="stats__nums">
            <Num n="12" label="drafts written" />
            <Num n="3" label="replies waiting" />
            <Num n="11" label="day streak" />
          </div>
          <div className="stats__call">
            <b>1 approval waiting</b>
            <p>Lumen Health wants 15% off annual.</p>
            <button className="orange-btn" onClick={onApprovals}>
              Review approval
            </button>
          </div>
        </div>
      </div>

      <div className="hub__label">Today</div>
      <ol className="timeline">
        {TIMELINE.map((t) => (
          <li key={t.time + t.text}>
            <span className="timeline__time">{t.time}</span>
            <PersonAvatar name={t.who} size={22} />
            <span className="timeline__text">{t.text}</span>
          </li>
        ))}
      </ol>
    </>
  )
}

function Num({ n, label }: { n: string; label: string }) {
  return (
    <div className="num">
      <span className="num__n">{n}</span>
      <span className="num__label">{label}</span>
    </div>
  )
}

// ── Approvals and rooms ─────────────────────────────────────────────────────

function Approvals() {
  return (
    <>
      <h1 className="hub__title">Approvals</h1>
      <p className="hub__sub">Only the sales lead can approve. Holding the button records a decision in #approvals.</p>
      <div className="approvals">
        <ApprovalCard approval={APPROVAL} />
      </div>
    </>
  )
}

function Rooms() {
  return (
    <>
      <h1 className="hub__title">Rooms</h1>
      <p className="hub__sub">One room per deal. Add a teammate to a room and the handover is done.</p>
      <ul className="rooms">
        {ROOMS.map((r) => (
          <li key={r.name} className="rooms__row">
            <span className="rooms__hash">#</span>
            <span className="rooms__text">
              <b>{r.name}</b>
              <span>{r.topic}</span>
            </span>
            <span className="rooms__faces">
              {r.members.map((m) => (
                <PersonAvatar key={m} name={m} size={22} />
              ))}
            </span>
            <span className="rooms__time">{r.updated}</span>
          </li>
        ))}
      </ul>
    </>
  )
}

// ── Insights ────────────────────────────────────────────────────────────────

// darkest for the busiest room, lighter down the list
const TEAL_RAMP = ['#1f6f6b', '#2d8a84', '#3fa59c', '#6cc2b9', '#9fdad2']

const ROOM_BARS = [
  { room: 'deal-lumen', pct: 42, label: '18 drafts' },
  { room: 'deal-kestrel', pct: 27, label: '11 notes' },
  { room: 'kian-desk', pct: 18, label: '64 brief items' },
  { room: 'approvals', pct: 8, label: '4 decisions' },
  { room: 'content', pct: 5, label: '3 posts' },
]

function Insights() {
  const [tab, setTab] = useState<'usage' | 'agents' | 'team'>('usage')
  return (
    <>
      <h1 className="hub__title">Insights</h1>
      <div className="hub-tabs" role="tablist">
        {(['usage', 'agents', 'team'] as const).map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} className="hub-tabs__tab" onClick={() => setTab(t)}>
            {t === 'usage' ? 'Your desk' : t === 'agents' ? 'Agents' : 'Team'}
          </button>
        ))}
      </div>

      <div className="ins-grid">
        <div className="ins-card">
          <div className="ins-card__n">86%</div>
          <div className="ins-card__label">Drafts approved as written</div>
          <Gauge value={0.86} />
        </div>
        <div className="ins-card">
          <div className="ins-card__n">6.5 h</div>
          <div className="ins-card__label">Saved this week</div>
          <div className="ins-card__rows">
            <span>Triage you didn’t do</span>
            <b>3.1 h</b>
            <span>Drafts you didn’t write</span>
            <b>2.6 h</b>
            <span>Notes you didn’t type</span>
            <b>0.8 h</b>
          </div>
        </div>
        <div className="ins-card">
          <div className="ins-card__n">0</div>
          <div className="ins-card__label">Emails sent without you</div>
          <p className="ins-card__note">The toolkit has no send command. This number cannot go up.</p>
        </div>
      </div>

      <div className="ins-grid ins-grid--2">
        <div className="ins-card">
          <div className="ins-card__head">
            <b>Room activity</b>
            <span>5 rooms</span>
          </div>
          <ul className="hub-bars">
            {ROOM_BARS.map((b, i) => (
              <li key={b.room}>
                <span className="hub-bars__bar" style={{ ['--w' as string]: `${Math.max(b.pct, 6)}%`, ['--i' as string]: i, background: TEAL_RAMP[i] }}>
                  {b.pct}%
                </span>
                <span className="hub-bars__label">
                  #{b.room} · {b.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="ins-card">
          <div className="ins-card__head">
            <b>11 day streak</b>
            <span>Every follow-up answered</span>
          </div>
          <Heatmap />
        </div>
      </div>
    </>
  )
}

function Gauge({ value }: { value: number }) {
  const r = 46
  const len = Math.PI * r
  return (
    <svg className="gauge" viewBox="0 0 120 70" aria-hidden>
      <path d={`M14 62 A${r} ${r} 0 0 1 106 62`} className="gauge__track" />
      <path d={`M14 62 A${r} ${r} 0 0 1 106 62`} className="gauge__fill" style={{ strokeDasharray: len, strokeDashoffset: len * (1 - value) }} />
    </svg>
  )
}

/** Weeks by weekday; the last 11 days are the streak. Deterministic, not random. */
function Heatmap() {
  const weeks = 18
  const cells = []
  for (let w = 0; w < weeks; w++) {
    for (let d = 0; d < 7; d++) {
      const day = w * 7 + d
      const fromEnd = weeks * 7 - day
      const level = fromEnd <= 11 ? 1 + ((day * 7) % 3) : (day * 13) % 9 === 0 ? 1 : 0
      cells.push(<i key={day} data-level={level} />)
    }
  }
  return <div className="heat">{cells}</div>
}

// ── Settings modal ──────────────────────────────────────────────────────────

type SettingsTab = 'general' | 'agents' | 'connectors' | 'team' | 'privacy'

const TABS: { id: SettingsTab; label: string; icon: ReactNode }[] = [
  { id: 'general', label: 'General', icon: <GearIcon /> },
  { id: 'agents', label: 'Agents', icon: <BoltIcon /> },
  { id: 'connectors', label: 'Connectors', icon: <TableIcon /> },
  { id: 'team', label: 'Team', icon: <ChatIcon /> },
  { id: 'privacy', label: 'Data and privacy', icon: <ShieldIcon /> },
]

function Settings({ tab, onTab, onClose }: { tab: SettingsTab; onTab: (t: SettingsTab) => void; onClose: () => void }) {
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

const change = <button className="cream-btn">Change</button>

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

