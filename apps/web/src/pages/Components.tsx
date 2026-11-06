import { useState, type ReactNode } from 'react'
import { ActionButton, Button, RowList, Segmented, type ActionStatus } from '@kian/designs'
import {
  ActivityRow,
  ApprovalCard,
  BoltIcon,
  ChatIcon,
  ChipButton,
  ConnectionRow,
  HoldButton,
  MicIcon,
  Panel,
  PendingRow,
  RoomRow,
  KianWidget,
  MessageCard,
  NudgeCard,
  Pill,
  TypeBar,
  Waveform,
  useMicLevel,
  type Orientation,
  type RoomMessage,
  type VoiceState,
} from '@kian/ui'
import { Nav, Stage } from '../Chrome'
import { ACTIVITY, APPROVAL, PENDING, ROOMS } from '../demo/dashboardData'
import { LabeledToggle } from './Home'
import { useDemoDesk } from '../demo/useDemoDesk'

const SAMPLES: Record<string, RoomMessage> = {
  brief: {
    id: 's1',
    author: 'kian',
    room: 'kian-desk',
    text: 'Priya Shah, Lumen Health, replied: can the call move to Tuesday? She also asks about 15% off annual.',
    chips: [{ label: 'done' }, { label: 'skip' }, { label: 'draft', tone: 'primary' }],
    voiceReply: true,
  },
  draft: {
    id: 's2',
    author: 'kian-scribe',
    room: 'deal-lumen',
    text: 'Draft is in Gmail: moves the call to Tue 3 PM and holds the price until #approvals decides. Not sent.',
    chips: [{ label: 'yes', tone: 'primary' }],
    voiceReply: true,
    link: { label: 'Open draft', href: '#draft' },
  },
  approval: {
    id: 's3',
    author: 'kian',
    room: 'approvals',
    text: 'Lumen Health wants 15% off annual. Margin stays above floor. Approve?',
    chips: [
      { label: 'approved', tone: 'primary', hold: true, holdLabel: 'Hold to approve' },
      { label: 'refused', tone: 'danger' },
    ],
  },
  content: {
    id: 's4',
    author: 'kian-studio',
    room: 'content',
    text: 'Question 2 of 4: what did a customer say this week that surprised you?',
    voiceReply: true,
  },
  long: {
    id: 's5',
    author: 'kian-scribe',
    room: 'deal-kestrel-logistics-international-holdings',
    text:
      'Notes from the 47 min call. Summary: Kestrel wants a pilot across two depots before committing to 40 seats, and procurement joins next week. Decided: a 6 week pilot for 2 depots starting 1 December. Concerns: onboarding for night shift drivers, SSO through their own identity provider, and keeping data in region. Next: SOC 2 report by Friday, pricing for 40 seats by Monday, intro to their IT lead on Tuesday. Move the Sheet from Discovery to Pilot?',
    chips: [{ label: 'yes', tone: 'primary' }, { label: 'skip' }],
    voiceReply: true,
  },
}

/** The kit's Segmented takes {value, label} options. */
const opts = <T extends string>(values: readonly T[]) => values.map((v) => ({ value: v, label: v }))

const PILL_STATES = ['idle', 'listening', 'recording', 'sending', 'sent'] as const
const CARD_KINDS = ['brief', 'draft', 'approval', 'content', 'long', 'loading'] as const

export function Components() {
  return (
    <div className="page">
      <Nav active="components" />
      <header className="hero hero--small">
        <p className="eyebrow">@kian/ui</p>
        <h1 className="hero__title">Components</h1>
        <p className="hero__lede">
          Kian is built from these. The website and the desktop app import the same packages,{' '}
          <code>@kian/ui</code> for the widget and <code>@kian/designs</code> for the kit, so what you see here is what runs
          on Mac and Windows. Every action a component offers ends up as a message in a Switch room.
        </p>
        <ul className="toc">
          {['Buttons', 'KianWidget', 'Pill', 'Waveform', 'MessageCard', 'NudgeCard', 'TypeBar', 'Chip', 'Dashboard'].map((n) => (
            <li key={n}>
              <a href={`#${n}`}>{n}</a>
            </li>
          ))}
        </ul>
      </header>

      <ButtonsSpecimen />
      <WidgetSpecimen />
      <PillSpecimen />
      <WaveformSpecimen />
      <CardSpecimen />

      <Specimen
        id="NudgeCard"
        title="NudgeCard"
        blurb="The widget’s one unprompted opener. At the morning time the pill glows and asks once; tapping it posts the action to #kian-desk."
        code={`<NudgeCard nudge={{ text: 'Morning, Yukti. Want your brief?', action: 'morning, Kian' }} onAction={…} />`}
      >
        <Stage wallpaper="graphite" height={220} align="center">
          <div className="kian">
            <NudgeCard nudge={{ text: 'Morning, Yukti. Want your brief?', action: 'morning, Kian', dismiss: 'Later' }} />
          </div>
        </Stage>
      </Specimen>

      <Specimen
        id="TypeBar"
        title="TypeBar"
        blurb="Type into a room. It is also how you dictate into Kian with Wispr Flow: focus it and talk. Enter sends, Esc closes."
        code={`<TypeBar room="kian-desk" onSubmit={(text) => rooms.post('kian-desk', text)} />`}
      >
        <TypeBarDemo />
      </Specimen>

      <Specimen
        id="Chip"
        title="Chip"
        blurb="A word you can answer with. The label is posted to the room as a reply, so the chat history reads exactly as if you had typed it. Number keys press them in order."
        code={`<ChipButton chip={{ label: 'approved', tone: 'primary' }} index={0} onPress={…} />`}
      >
        <Stage wallpaper="grid" height={180} align="center">
          <div className="kian row">
            <ChipButton chip={{ label: 'done' }} index={0} />
            <ChipButton chip={{ label: 'skip' }} index={1} />
            <ChipButton chip={{ label: 'draft', tone: 'primary' }} index={2} />
            <ChipButton chip={{ label: 'refused', tone: 'danger' }} />
            <ChipButton chip={{ label: 'approved', tone: 'primary', hold: true, holdLabel: 'Hold to approve' }} />
          </div>
        </Stage>
      </Specimen>

      <DashboardSpecimen />

      <footer className="foot">
        <span>The same components run on the website and the desktop app.</span>
        <a href="/">Back to the demo</a>
      </footer>
    </div>
  )
}

function Specimen({ id, title, blurb, code, controls, children }: { id: string; title: string; blurb: string; code: string; controls?: ReactNode; children: ReactNode }) {
  return (
    <section className="specimen" id={id}>
      <div className="specimen__head">
        <div>
          <div className="specimen__title">{title}</div>
          <p className="specimen__blurb">{blurb}</p>
        </div>
        {controls && <div className="specimen__controls">{controls}</div>}
      </div>
      {children}
      <pre className="code">
        <code>{code}</code>
      </pre>
    </section>
  )
}

function WidgetSpecimen() {
  const [orientation, setOrientation] = useState<Orientation>('horizontal')
  const desk = useDemoDesk({ voiceOut: false, simulateMic: true })
  return (
    <Specimen
      id="KianWidget"
      title="KianWidget"
      blurb="The pill plus whatever floats beside it: one card, nudge or type bar at a time. It holds no state of its own. Here a scripted morning drives it; in the desktop app the same props come from Switch."
      controls={
        <>
          <Segmented aria-label="Orientation" value={orientation} options={opts(['horizontal', 'vertical'] as const)} onValueChange={setOrientation} />
          <button className="btn btn--quiet" onClick={desk.reset}>
            Reset
          </button>
        </>
      }
      code={`<KianWidget
  orientation="${orientation}"
  voiceState={voiceState}       // idle | listening | recording | sending | sent | typing
  message={queue[0]}            // the one card on screen
  pending={working}             // skeleton while an agent writes
  queued={queue.length - 1}
  onTalk={…} onStop={…} onChip={(msg, chip) => rooms.post(msg.room, chip.label, { rootId: msg.id })}
/>`}
    >
      <Stage wallpaper="sky" height={440} align={orientation === 'horizontal' ? 'bottom' : 'right'}>
        <KianWidget {...desk.widget} orientation={orientation} keyboard={false} />
      </Stage>
    </Specimen>
  )
}

function PillSpecimen() {
  const [state, setState] = useState<VoiceState>('idle')
  const [orientation, setOrientation] = useState<Orientation>('horizontal')
  const mic = useMicLevel(state === 'listening', { simulate: true })
  return (
    <Specimen
      id="Pill"
      title="Pill"
      blurb="Quiet at rest. The mic talks to Kian; ◉ records a meeting for kian-scribe. While listening it shows a live waveform with cancel and stop, and status words roll instead of crossfading."
      controls={
        <>
          <Segmented aria-label="State" value={state as (typeof PILL_STATES)[number]} options={opts(PILL_STATES)} onValueChange={setState} />
          <Segmented aria-label="Orientation" value={orientation} options={opts(['horizontal', 'vertical'] as const)} onValueChange={setOrientation} />
        </>
      }
      code={`<Pill state="${state}" orientation="${orientation}" getLevel={mic.getLevel} onTalk={…} onRecord={…} onStop={…} onCancel={…} />`}
    >
      <Stage wallpaper="sky" height={240} align="center">
        <div className="kian">
          <Pill
            state={state}
            orientation={orientation}
            getLevel={mic.getLevel}
            onTalk={() => setState('listening')}
            onRecord={() => setState('recording')}
            onStop={() => {
              setState('sending')
              setTimeout(() => setState('sent'), 900)
              setTimeout(() => setState('idle'), 1900)
            }}
            onCancel={() => setState('idle')}
          />
        </div>
      </Stage>
    </Specimen>
  )
}

function WaveformSpecimen() {
  const [real, setReal] = useState(false)
  const mic = useMicLevel(true, { simulate: !real })
  return (
    <Specimen
      id="Waveform"
      title="Waveform"
      blurb="A scrolling history of how loud the mic is. Bars are written straight to style.transform each frame, with no React state per frame, and it falls back to a simulated voice if the mic is blocked."
      controls={
        <LabeledToggle on={real} onChange={setReal}>
          Use my mic {real && mic.source === 'simulated' ? '(blocked, simulating)' : ''}
        </LabeledToggle>
      }
      code={`const mic = useMicLevel(listening)\n<Waveform getLevel={mic.getLevel} bars={24} />`}
    >
      <Stage wallpaper="graphite" height={160} align="center">
        <div className="kian">
          <div className="k-glass wave-demo">
            <Waveform getLevel={mic.getLevel} bars={32} />
          </div>
        </div>
      </Stage>
    </Specimen>
  )
}

function CardSpecimen() {
  const [kind, setKind] = useState<(typeof CARD_KINDS)[number]>('brief')
  const [speaking, setSpeaking] = useState(false)
  const loading = kind === 'loading'
  const message = loading ? SAMPLES.brief : SAMPLES[kind]
  return (
    <Specimen
      id="MessageCard"
      title="MessageCard"
      blurb="One message from one room, never a list. The buttons depend on the room: done, skip and draft on the desk, yes in a deal room, and hold to approve in #approvals. Loading shows a skeleton shaped like real text, and the reply reveals into it."
      controls={
        <>
          <Segmented aria-label="Kind" value={kind} options={opts(CARD_KINDS)} onValueChange={setKind} />
          <LabeledToggle on={speaking} onChange={setSpeaking}>
            Speaking
          </LabeledToggle>
        </>
      }
      code={`<MessageCard message={msg} queued={2} ${loading ? 'loading ' : ''}${speaking ? 'speaking ' : ''}onChip={…} onVoiceReply={…} onDismiss={…} />`}
    >
      <Stage wallpaper="grid" height={kind === 'long' ? 340 : 280} align="center">
        <div className="kian">
          <MessageCard message={message} queued={kind === 'brief' ? 2 : 0} loading={loading} speaking={speaking} />
        </div>
      </Stage>
    </Specimen>
  )
}

function TypeBarDemo() {
  const [sent, setSent] = useState<string[]>([])
  return (
    <Stage wallpaper="graphite" height={200} align="center">
      <div className="kian col">
        <TypeBar room="kian-desk" autoFocus={false} onSubmit={(t) => setSent((s) => [...s.slice(-2), t])} />
        {sent.map((t, i) => (
          <div className="sent-line" key={i + t}>
            → #kian-desk: {t}
          </div>
        ))}
      </div>
    </Stage>
  )
}

function ButtonsSpecimen() {
  const [status, setStatus] = useState<ActionStatus>('idle')
  const [held, setHeld] = useState(0)
  return (
    <Specimen
      id="Buttons"
      title="Buttons"
      blurb="A lit face, a glow under it, a rim, and a 1px sink when pressed. Primary is the one thing to do on a screen. Hold to approve is Kian’s own, for the one action that must never happen by accident."
      code={`<Button variant="primary" icon={<MicIcon />}>Talk to Kian</Button>
<ActionButton status={status} doneLabel="Connected">Connect</ActionButton>
<HoldButton doneLabel="Approved" onConfirm={approve}>Hold to approve</HoldButton>`}
    >
      <Stage wallpaper="grid" align="center" height={300}>
        <div className="button-board">
          <div className="button-board__row">
            <span className="button-board__label">variants</span>
            <Button variant="primary" icon={<MicIcon />}>
              Talk to Kian
            </Button>
            <Button variant="secondary">Open draft</Button>
            <Button variant="ghost">Later</Button>
            <Button variant="danger">Refuse</Button>
          </div>
          <div className="button-board__row">
            <span className="button-board__label">small</span>
            <Button size="sm" variant="primary">
              draft
            </Button>
            <Button size="sm" variant="secondary">
              done
            </Button>
            <Button size="sm" variant="secondary" icon={<BoltIcon />} aria-label="Agents" />
            <Button size="sm" variant="secondary" disabled>
              Sent
            </Button>
          </div>
          <div className="button-board__row">
            <span className="button-board__label">async</span>
            <ActionButton
              status={status}
              doneLabel="Connected"
              onClick={() => {
                setStatus('pending')
                setTimeout(() => setStatus('done'), 1400)
                setTimeout(() => setStatus('idle'), 4000)
              }}
            >
              Connect Gmail
            </ActionButton>
            <HoldButton key={held} doneLabel="Approved" onConfirm={() => setTimeout(() => setHeld((h) => h + 1), 1600)}>
              Hold to approve
            </HoldButton>
          </div>
        </div>
      </Stage>
    </Specimen>
  )
}

function DashboardSpecimen() {
  return (
    <Specimen
      id="Dashboard"
      title="Dashboard parts"
      blurb="Rows, panels and cards for the dashboard, composed from the kit’s Row, Badge, Avatar and BrandMark. The dashboard only shows what the rooms already hold; acting on anything posts to the room."
      code={`<Panel title="Needs you">
  <ApprovalCard approval={approval} onApprove={…} />
  <RowList>{pending.map((p) => <PendingRow {...p} />)}</RowList>
</Panel>
<ConnectionRow connection={{ name: 'Gmail', brand: 'gmail', connected: false, … }} onConnect={…} />`}
    >
      <div className="specimen-grid">
        <Stage wallpaper="graphite" align="center">
          <div className="panel-demo">
            <Panel title="Needs you">
              <ApprovalCard approval={APPROVAL} />
              <RowList aria-label="Waiting on you">
                <PendingRow {...PENDING[0]} />
              </RowList>
            </Panel>
          </div>
        </Stage>
        <Stage wallpaper="graphite" align="center">
          <div className="panel-demo">
            <Panel title="Connections">
              <RowList aria-label="Connections">
                <ConnectionRow connection={{ id: 'mm', name: 'Mattermost', role: 'Where the rooms live', glyph: <ChatIcon />, connected: true, note: '6 rooms · signed in' }} />
                <ConnectionRow connection={{ id: 'gmail', name: 'Gmail', role: 'Drafts only, never sends', brand: 'gmail', connected: false }} onConnect={() => new Promise((r) => setTimeout(r, 1400))} />
                <ConnectionRow connection={{ id: 'sheets', name: 'Google Sheets', role: 'The lead list', brand: 'google-sheets', connected: false }} onConnect={() => new Promise((r) => setTimeout(r, 1400))} />
              </RowList>
            </Panel>
          </div>
        </Stage>
        <Stage wallpaper="graphite" align="center">
          <div className="panel-demo">
            <Panel title="Activity">
              <RowList aria-label="Activity">{ACTIVITY.slice(0, 3).map((a) => <ActivityRow key={a.id} item={a} />)}</RowList>
            </Panel>
          </div>
        </Stage>
        <Stage wallpaper="graphite" align="center">
          <div className="panel-demo">
            <Panel title="Rooms">
              <RowList aria-label="Rooms">{ROOMS.slice(0, 3).map((r) => <RoomRow key={r.name} room={r} />)}</RowList>
            </Panel>
          </div>
        </Stage>
      </div>
    </Specimen>
  )
}
