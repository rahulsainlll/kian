/*
 * The desktop hub: the same @kian/hub the website shows, filled from the
 * live rooms instead of demo data. Today lists what agents just did,
 * Approvals holds what waits for the sales lead (approve right here),
 * Rooms lists every room you are in, and Settings holds the app's real
 * options. A #settings/<tab> hash opens a tab (the tray's Settings item).
 */
import { Hub as SharedHub, type HubData, type SettingsTab } from '@kian/hub'
import { Logo, type Approval } from '@kian/ui'
import { useEffect, useMemo, useState } from 'react'
import { parseAnswers } from '../../shared/answers'
import type { RoomEvent, RoomSummary, Settings, SettingsUpdate } from '../../shared/types'
import { settingsTabs } from './SettingsTabs'

const tabFromHash = (): SettingsTab | null => {
  const m = /^#settings\/(\w+)/.exec(location.hash)
  return (m?.[1] as SettingsTab) ?? null
}

export function Hub() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [events, setEvents] = useState<RoomEvent[]>([])
  const [rooms, setRooms] = useState<RoomSummary[]>([])
  const [me, setMe] = useState('')
  const [answered, setAnswered] = useState<Set<string>>(new Set())
  const [openTab, setOpenTab] = useState<SettingsTab | null>(tabFromHash)

  useEffect(() => {
    void window.kian.hub.settings().then(setSettings)
    void window.kian.hub.feed().then(setEvents)
    void window.kian.hub.rooms().then(setRooms)
    void window.kian.desk.state().then((s) => s && setMe(s.me))
    const offs = [
      window.kian.hub.onFeed((e) => {
        setEvents((prev) => [...prev.slice(-199), e])
        void window.kian.hub.rooms().then(setRooms)
      }),
      window.kian.hub.onSettings(setSettings),
      window.kian.desk.onState((s) => setMe(s.me)),
    ]
    const onHash = () => setOpenTab(tabFromHash())
    window.addEventListener('hashchange', onHash)
    return () => {
      offs.forEach((off) => off())
      window.removeEventListener('hashchange', onHash)
    }
  }, [])

  const data = useMemo(() => toHubData(events, rooms, settings, me, answered), [events, rooms, settings, me, answered])
  if (!settings) return null

  const save = async (update: SettingsUpdate) => setSettings(await window.kian.hub.save(update))
  const decide = (a: Approval, reply: 'approve' | 'refuse') => {
    setAnswered((prev) => new Set(prev).add(a.id))
    void window.kian.desk.answer(a.id, reply)
  }

  return (
    <SharedHub
      className="hub--desktop"
      logo={<Logo size={30} />}
      badge={settings.backend === 'mattermost' ? 'Switch' : 'Demo'}
      data={data}
      banner={{
        title: (
          <>
            Say <em>morning</em> to kian
          </>
        ),
        text: 'Your brief arrives in the widget, one card at a time. Answer with a tap or your voice.',
        action: 'Start my morning',
        onAction: () => void window.kian.desk.say('morning'),
      }}
      settings={settingsTabs(settings, save)}
      openSettings={openTab}
      onApprove={(a) => decide(a, 'approve')}
      onRefuse={(a) => decide(a, 'refuse')}
    />
  )
}

function toHubData(events: RoomEvent[], rooms: RoomSummary[], s: Settings | null, me: string, answered: Set<string>): HubData {
  const agentEvents = events.filter((e) => e.authorIsAgent)
  const approvals: Approval[] = agentEvents
    .filter((e) => s && e.room === s.approvalsRoom && !answered.has(e.id) && parseAnswers(e.text).chips.some((c) => c.hold))
    .filter((e) => !events.some((r) => r.rootId === e.id && !r.authorIsAgent))
    .map((e) => {
      const [ask, ...rest] = parseAnswers(e.text).body.replace(/^@\S+\s*/, '').split(/(?<=\.)\s+/)
      return { id: e.id, deal: `#${e.room}`, ask, detail: rest.join(' '), requestedBy: e.author }
    })
  const drafts = agentEvents.filter((e) => /draft/i.test(e.text)).length
  const cards = agentEvents.filter((e) => parseAnswers(e.text).chips.length).length
  const live = s?.backend === 'mattermost' && s.hasToken

  return {
    greeting: `${greeting()}${me ? `, ${me[0].toUpperCase()}${me.slice(1)}` : ''}`,
    stats: [
      { n: String(cards), label: 'cards today' },
      { n: String(drafts), label: 'drafts in Gmail' },
      { n: String(rooms.length), label: 'rooms' },
    ],
    approvals,
    timeline: agentEvents
      .slice(-40)
      .reverse()
      .map((e) => ({ id: e.id, time: clock(e.at), who: e.author, text: `${parseAnswers(e.text).body.split('\n')[0]} · #${e.room}` })),
    rooms: rooms.map((r) => ({
      name: r.name,
      topic: r.last ? `${r.last.author}: ${r.last.text.split('\n')[0]}` : r.title,
      members: r.members,
      updated: r.last ? clock(r.last.at) : '',
    })),
    setup: [
      { label: 'Try the demo morning', done: agentEvents.length > 1 },
      { label: 'Connect your Switch rooms', done: !!live, tab: 'connectors' },
      { label: 'Pick a voice engine', done: s?.sttProvider !== 'off', tab: 'agents' },
      { label: 'Choose your shortcut', done: !!s && s.hotkey !== 'CommandOrControl+Shift+K', tab: 'general' },
    ],
  }
}

const clock = (at: number) => new Date(at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).toLowerCase().replace(' ', '')

function greeting() {
  const h = new Date().getHours()
  return h < 12 ? 'Morning' : h < 18 ? 'Afternoon' : 'Evening'
}
