/*
 * The hub window: a sidebar and one paper panel, like the website's team
 * dashboard but live. Today shows what agents just did across your rooms,
 * Rooms lists every room you are in, and Setup connects Kian to Switch.
 * It only reads the rooms; "Say morning" posts to the desk like you would.
 */
import { Button } from '@kian/designs'
import { ActivityRow, HashIcon, HomeIcon, GearIcon, Mascot, Panel, RoomRow, type Activity } from '@kian/ui'
import { useEffect, useState, type ReactNode } from 'react'
import type { RoomEvent, RoomSummary, Settings } from '../../shared/types'
import { Setup } from './Setup'

type View = 'today' | 'rooms' | 'setup'

export function Hub() {
  const [view, setView] = useState<View>('today')
  const [settings, setSettings] = useState<Settings | null>(null)

  useEffect(() => {
    void window.kian.hub.settings().then((s) => {
      setSettings(s)
      if (s.backend === 'mattermost' && !s.hasToken) setView('setup')
    })
  }, [])

  return (
    <div className="hub" data-platform={window.kian.platform}>
      <aside className="hub__side">
        <div className="hub__brand">
          <Mascot size={26} shape="flower" color="#3d7bf2" mood="happy" />
          <b>kian</b>
          <span className="hub__mode">{settings?.backend === 'mattermost' ? 'Switch' : 'Demo'}</span>
        </div>
        <nav className="hub__nav">
          <NavItem icon={<HomeIcon />} label="Today" active={view === 'today'} onClick={() => setView('today')} />
          <NavItem icon={<HashIcon />} label="Rooms" active={view === 'rooms'} onClick={() => setView('rooms')} />
          <NavItem icon={<GearIcon />} label="Setup" active={view === 'setup'} onClick={() => setView('setup')} />
        </nav>
        <p className="hub__hint">
          Press <kbd>{prettyHotkey(settings?.hotkey ?? '')}</kbd> anywhere to talk to Kian.
        </p>
      </aside>
      <main className="hub__paper">
        {view === 'today' && <Today deskRoom={settings?.deskRoom ?? 'kian-desk'} />}
        {view === 'rooms' && <Rooms />}
        {view === 'setup' && settings && <Setup settings={settings} onSaved={setSettings} />}
      </main>
    </div>
  )
}

function NavItem({ icon, label, active, onClick }: { icon: ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button className="hub__item" data-active={active || undefined} onClick={onClick}>
      {icon}
      <span>{label}</span>
    </button>
  )
}

function Today({ deskRoom }: { deskRoom: string }) {
  const [events, setEvents] = useState<RoomEvent[]>([])
  const [asked, setAsked] = useState(false)

  useEffect(() => {
    void window.kian.hub.feed().then(setEvents)
    return window.kian.hub.onFeed((e) => setEvents((prev) => [...prev.slice(-199), e]))
  }, [])

  const agentEvents = events.filter((e) => e.authorIsAgent).slice(-30).reverse()
  const morning = async () => {
    setAsked(true)
    await window.kian.desk.say('morning')
  }

  return (
    <>
      <header className="hub__head">
        <div>
          <h1>{greeting()}</h1>
          <p>What your agents did, newest first. Answer cards from the widget or in the room.</p>
        </div>
        <Button variant="primary" onClick={() => void morning()} disabled={asked}>
          {asked ? 'Asked for your brief' : 'Say “morning” to kian'}
        </Button>
      </header>
      <Panel title="Live from your rooms">
        {agentEvents.length ? (
          agentEvents.map((e) => <ActivityRow key={e.id} item={toActivity(e)} />)
        ) : (
          <p className="hub__empty">Nothing yet. Say “morning” in #{deskRoom} or press the button above.</p>
        )}
      </Panel>
    </>
  )
}

function Rooms() {
  const [rooms, setRooms] = useState<RoomSummary[] | null>(null)
  useEffect(() => void window.kian.hub.rooms().then(setRooms), [])
  return (
    <>
      <header className="hub__head">
        <div>
          <h1>Rooms</h1>
          <p>One room per deal, plus the desk, approvals and content. The history is the memory.</p>
        </div>
      </header>
      <Panel title={rooms ? `${rooms.length} rooms` : 'Loading rooms'}>
        {rooms?.map((r) => (
          <RoomRow
            key={r.name}
            room={{
              name: r.name,
              topic: r.last ? `${r.last.author}: ${firstLine(r.last.text)}` : r.title,
              members: r.members,
              updated: r.last ? clock(r.last.at) : '',
            }}
          />
        ))}
      </Panel>
    </>
  )
}

function toActivity(e: RoomEvent): Activity {
  const text = firstLine(e.text)
  const kind: Activity['kind'] = /draft/i.test(text)
    ? 'draft'
    : /decision/i.test(text)
      ? 'decision'
      : /sheet|→ .*→/i.test(text)
        ? 'sheet'
        : /next step|summary updated/i.test(text)
          ? 'task'
          : undefined
  return { id: e.id, actor: e.author, text, room: e.room, time: clock(e.at), kind }
}

const firstLine = (t: string) => t.split('\n')[0].slice(0, 140)
const clock = (at: number) => new Date(at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

function greeting() {
  const h = new Date().getHours()
  return h < 12 ? 'Morning' : h < 18 ? 'Afternoon' : 'Evening'
}

function prettyHotkey(accel: string) {
  const mac = window.kian.platform === 'darwin'
  return accel
    .replace('CommandOrControl', mac ? '⌘' : 'Ctrl')
    .replace('Shift', mac ? '⇧' : 'Shift')
    .replace('Alt', mac ? '⌥' : 'Alt')
    .split('+')
    .join(mac ? '' : '+')
}
