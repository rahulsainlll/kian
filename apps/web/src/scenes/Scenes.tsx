import { Badge, BrandMark, Button } from '@kian/designs'
import { CheckIcon, KianWidget, PersonAvatar, Pill, useMicLevel, type RoomMessage } from '@kian/ui'
import type { ReactNode } from 'react'
import { Skeleton } from 'skullet/react'
import { CAST, Mascot, type Mood } from '@kian/ui'
import { useScene } from './useScene'

/*
 * Product scenes for the home page. Each one plays a single moment of the
 * product with the real components, only while on screen, and loops.
 * Choreography: one lead per beat; support follows; nothing waits on a queue.
 */

function Frame({
  tint,
  children,
  label,
  sceneRef,
  buddy,
}: {
  tint: string
  children: ReactNode
  label: string
  sceneRef: React.RefObject<HTMLDivElement | null>
  /** The agent this moment belongs to, in the corner, wearing the moment's mood. */
  buddy: { who: keyof typeof CAST; mood: Mood }
}) {
  const c = CAST[buddy.who]
  return (
    <div className="scene" data-tint={tint} ref={sceneRef} role="img" aria-label={label}>
      <span className="scene-buddy" key={buddy.mood}>
        <Mascot size={60} shape={c.shape} color={c.color} mood={buddy.mood} />
      </span>
      {children}
    </div>
  )
}

/** Lines in a mini chat. `show` controls the entrance; layout never jumps. */
function Line({ who, show, children }: { who: string; show: boolean; children: ReactNode }) {
  return (
    <div className="scene-line" data-show={show || undefined}>
      <PersonAvatar name={who === 'Yukti' ? 'Yukti' : who} size={26} />
      <div className="scene-line__body">
        <div className="scene-line__who">{who}</div>
        {children}
      </div>
    </div>
  )
}

// ── 1. Say morning, get your day ────────────────────────────────────────────

const BRIEF: RoomMessage = {
  id: 'b1',
  author: 'kian',
  room: 'kian-desk',
  text: 'Hey Yukti. 3 people replied overnight, and Rahul at 10:30 is your first meeting.',
  chips: [{ label: 'go', tone: 'primary' }],
}
const PRIYA: RoomMessage = {
  id: 'b2',
  author: 'kian',
  room: 'kian-desk',
  text: 'Priya Shah at Lumen Health wants to move the call to Tuesday.',
  chips: [{ label: 'done' }, { label: 'skip' }, { label: 'draft', tone: 'primary' }],
  voiceReply: true,
}

export function BriefScene() {
  // idle, listening, sending, sent + kian working, brief, item, hold
  const { ref, step } = useScene([900, 1900, 600, 1500, 2600, 3200, 600])
  const mic = useMicLevel(step === 1, { simulate: true })
  const voiceState = step === 1 ? 'listening' : step === 2 ? 'sending' : step === 3 ? 'sent' : 'idle'
  const message = step === 4 ? BRIEF : step >= 5 ? PRIYA : null
  return (
    <Frame tint="blue" label="Saying morning to the Kian widget and getting the brief" sceneRef={ref} buddy={{ who: 'kian', mood: step >= 4 ? 'happy' : step >= 1 ? 'look' : 'sleepy' }}>
      <div className="scene-said" data-show={(step >= 1 && step <= 3) || undefined}>
        “Morning, Kian.”
      </div>
      <div className="scene-widget">
        <KianWidget
          keyboard={false}
          voiceState={voiceState}
          getLevel={mic.getLevel}
          message={message}
          queued={step === 4 ? 0 : step >= 5 ? 2 : 0}
          pending={step === 3 ? { author: 'kian', room: 'kian-desk' } : null}
        />
      </div>
    </Frame>
  )
}

// ── 2. Every deal gets a room ───────────────────────────────────────────────

export function RoomScene() {
  // rooms, new room slides in, people join, kian asks
  const { ref, step } = useScene([1200, 1400, 1600, 3600])
  return (
    <Frame tint="green" label="kian opens a room for a new deal and adds the right people" sceneRef={ref} buddy={{ who: 'kian', mood: step === 1 ? 'surprised' : step >= 2 ? 'happy' : 'look' }}>
      <div className="mini-app">
        <aside className="mini-app__rail">
          <div className="mini-app__team">Yukti’s desk</div>
          {['kian-desk', 'deal-lumen', 'deal-kestrel'].map((r) => (
            <div className="mini-room" key={r}>
              <span>#</span>
              {r}
            </div>
          ))}
          <div className="mini-room mini-room--new" data-show={step >= 1 || undefined}>
            <span>#</span>deal-harbor
          </div>
        </aside>
        <div className="mini-app__main">
          <div className="mini-app__head">
            <b># deal-harbor</b>
            <span className="mini-faces">
              {['Yukti', 'kian', 'kian-scribe'].map((n, i) => (
                <span className="mini-face" key={n} data-show={step >= 2 || undefined} style={{ ['--i' as string]: i }}>
                  <PersonAvatar name={n} size={24} />
                </span>
              ))}
            </span>
          </div>
          <div className="mini-app__body">
            <Line who="kian" show={step >= 3}>
              <p>New sender: dana@harborfoods.example. Not on the lead list yet. Add a row?</p>
              <div className="scene-chips">
                <Button size="sm" variant="primary">
                  yes
                </Button>
                <Button size="sm" variant="secondary">
                  not a lead
                </Button>
              </div>
            </Line>
          </div>
        </div>
      </div>
    </Frame>
  )
}

// ── 3. Agents pass work by name ─────────────────────────────────────────────

export function HandoffScene() {
  // ask, scribe working, draft lands
  const { ref, step } = useScene([1400, 1700, 4200])
  return (
    <Frame tint="pink" label="kian hands a reply to kian-scribe, which leaves a Gmail draft" sceneRef={ref} buddy={{ who: 'kian-scribe', mood: step === 1 ? 'done' : step >= 2 ? 'wink' : 'look' }}>
      <div className="mini-chat">
        <div className="mini-chat__head"># deal-lumen</div>
        <Line who="kian" show>
          <p>
            <span className="mention">@kian-scribe</span> Priya wants Tuesday. Draft it here.
          </p>
        </Line>
        <Line who="kian-scribe" show={step >= 1}>
          <Skeleton loading={step === 1} label="kian-scribe is writing">
            <p>Draft is ready in Gmail. It moves the call to Tuesday at 3 PM.</p>
          </Skeleton>
          <div className="draft-card" data-show={step >= 2 || undefined}>
            <BrandMark brand="gmail" size={28} tile />
            <div className="draft-card__text">
              <b>Re: Moving our call to Tuesday</b>
              <span>To Priya Shah · Lumen Health</span>
            </div>
            <Badge tone="warning" dot>
              Not sent
            </Badge>
          </div>
        </Line>
      </div>
    </Frame>
  )
}

// ── 4. Nothing goes out without a yes ───────────────────────────────────────

export function ApprovalScene() {
  // ask, holding, approved, decision recorded
  const { ref, step } = useScene([1500, 1000, 700, 3600])
  return (
    <Frame tint="yellow" label="The sales lead holds to approve a discount, and it becomes a decision" sceneRef={ref} buddy={{ who: 'kian', mood: step === 1 ? 'excited' : step >= 2 ? 'happy' : 'look' }}>
      <div className="approve-stack">
        <div className="k-approval approve-card">
          <div className="k-approval__top">
            <Badge tone="warning" dot>
              #approvals
            </Badge>
            <span className="k-approval__by">asked by kian · 9:04</span>
          </div>
          <div className="k-approval__deal">Lumen Health · annual plan</div>
          <p className="k-approval__ask">Priya asked for 15% off if they sign for a year. Margin stays above floor.</p>
          <div className="k-approval__actions">
            <Button size="sm" variant="secondary">
              Refuse
            </Button>
            <Button size="sm" variant="primary" className="k-hold" data-holding={step === 1 || undefined} data-done={step >= 2 || undefined} style={{ ['--k-hold' as string]: '900ms' }}>
              <span className="k-hold__fill" aria-hidden />
              <span className="k-hold__text">{step === 1 ? 'Keep holding' : step >= 2 ? 'Approved' : 'Hold to approve'}</span>
            </Button>
          </div>
        </div>
        <div className="decision" data-show={step >= 3 || undefined}>
          <span className="decision__icon">
            <CheckIcon size={14} />
          </span>
          <div>
            <b>Decision recorded</b>
            <span>15% off annual · approved by Ravi Kapoor · 9:05</span>
          </div>
        </div>
      </div>
    </Frame>
  )
}

// ── 5. Meetings turn into work ──────────────────────────────────────────────

const TASKS = ['Send SOC 2 report · Fri', 'Pricing for 40 seats · Mon', 'Intro to their IT lead · Tue']

export function MeetingScene() {
  // recording, notes, tasks, sheet change
  const { ref, step } = useScene([2200, 900, 1300, 3800])
  return (
    <Frame tint="orange" label="A recorded call becomes notes, tasks and a proposed Sheet change" sceneRef={ref} buddy={{ who: 'kian-scribe', mood: step === 0 ? 'look' : step >= 3 ? 'happy' : 'done' }}>
      <div className="meeting">
        <div className="kian dark meeting__pill">
          <Pill state={step === 0 ? 'recording' : step === 1 ? 'sending' : 'sent'} room="deal-kestrel" />
        </div>
        <div className="notes" data-show={step >= 1 || undefined}>
          <div className="notes__head">
            <PersonAvatar name="kian-scribe" size={24} />
            <b>Kestrel call · notes</b>
            <span>47 min</span>
          </div>
          <ul className="notes__tasks">
            {TASKS.map((t, i) => (
              <li key={t} data-show={step >= 2 || undefined} style={{ ['--i' as string]: i }}>
                <span className="notes__check">
                  <CheckIcon size={12} />
                </span>
                {t}
              </li>
            ))}
          </ul>
          <div className="sheet-change" data-show={step >= 3 || undefined}>
            <BrandMark brand="google-sheets" size={22} tile />
            <span>
              Stage <s>Discovery</s> → <b>Pilot</b>
            </span>
            <Button size="sm" variant="primary">
              yes
            </Button>
          </div>
        </div>
      </div>
    </Frame>
  )
}

// ── 6. One file sets up the desk ────────────────────────────────────────────

const YAML: [string, string?][] = [
  ['agents:'],
  ['  - name: kian', 'coordinates'],
  ['    addressing: anyone'],
  ['  - name: kian-scribe', 'drafts, notes'],
  ['    addressing: owner-agents'],
  ['  - name: kian-studio', 'content'],
  ['room:'],
  ['  name: kian-desk'],
  ['  bridge: telegram', 'phone'],
  ['  kickoff: Say hello and wait for "morning, Kian".'],
]

export function TemplateScene() {
  const beats = [...YAML.map(() => 260), 3800]
  const { ref, step } = useScene(beats)
  return (
    <Frame tint="red" label="kian.template.yaml creating three agents and the rooms" sceneRef={ref} buddy={{ who: 'kian-studio', mood: step >= YAML.length - 1 ? 'excited' : 'look' }}>
      <div className="yaml">
        <div className="yaml__bar">
          <span className="yaml__dots" aria-hidden>
            <i />
            <i />
            <i />
          </span>
          kian.template.yaml
        </div>
        <pre className="yaml__code">
          {YAML.map(([line, note], i) => (
            <div className="yaml__line" key={i} data-show={step >= i || undefined}>
              <code>{line}</code>
              {note && <span className="yaml__note">{note}</span>}
            </div>
          ))}
        </pre>
      </div>
    </Frame>
  )
}

// ── 7. Posts, by voice ──────────────────────────────────────────────────────

export function ContentScene() {
  // question, voice note, post
  const { ref, step } = useScene([1400, 1800, 4200])
  return (
    <Frame tint="orange" label="kian-studio asks a question, Yukti answers by voice, and a post comes back" sceneRef={ref} buddy={{ who: 'kian-studio', mood: step >= 2 ? 'excited' : step === 1 ? 'look' : 'happy' }}>
      <div className="mini-chat">
        <div className="mini-chat__head">Content</div>
        <Line who="kian-studio" show>
          <p>Question 2 of 4: what did a customer say this week that surprised you?</p>
        </Line>
        <div className="voice-note" data-show={step >= 1 || undefined}>
          <span className="voice-note__play" aria-hidden />
          <span className="voice-note__wave" aria-hidden>
            {Array.from({ length: 22 }, (_, i) => (
              <i key={i} style={{ height: `${30 + ((i * 37) % 70)}%` }} />
            ))}
          </span>
          <span className="voice-note__time">0:14</span>
        </div>
        <Line who="kian-studio" show={step >= 2}>
          <div className="post-card">
            <div className="post-card__top">
              <b>LinkedIn post</b>
              <Badge tone="warning" dot>
                Not posted
              </Badge>
            </div>
            <p>“We don’t want more dashboards.” A logistics lead told me that on Tuesday, and it changed how we pitch…</p>
          </div>
        </Line>
      </div>
    </Frame>
  )
}
