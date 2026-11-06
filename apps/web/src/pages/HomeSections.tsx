import { Accordion, Chip } from '@heroui/react'
import { CAST, Mascot, PersonAvatar, type Mood, type Shape } from '@kian/ui'
import { useEffect, useState, type ReactNode } from 'react'
import { ContentScene, MeetingScene, RoomScene } from '../scenes/Scenes'
import { useReveal } from '../scenes/useScene'

/* Home page sections. One idea each: a short heading, one sentence, a visual. */

/** Reveals once on scroll: heading, then text, then the visual (marketing timing). */
export function Feature({ id, title, body, children }: { id?: string; title: string; body: string; children: ReactNode }) {
  const ref = useReveal<HTMLElement>()
  return (
    <section className="feature reveal" id={id} ref={ref}>
      <h2 className="feature__title" style={{ ['--i' as string]: 0 }}>
        {title}
      </h2>
      <p className="feature__body" style={{ ['--i' as string]: 1 }}>
        {body}
      </p>
      <div className="feature__visual" style={{ ['--i' as string]: 2 }}>
        {children}
      </div>
    </section>
  )
}

export function Block({ id, eyebrow, title, children }: { id?: string; eyebrow?: string; title: string; children: ReactNode }) {
  const ref = useReveal<HTMLElement>()
  return (
    <section className="block reveal" id={id} ref={ref}>
      {eyebrow && (
        <p className="eyebrow" style={{ ['--i' as string]: 0 }}>
          {eyebrow}
        </p>
      )}
      <h2 className="block__title" style={{ ['--i' as string]: 0 }}>
        {title}
      </h2>
      <div className="block__body" style={{ ['--i' as string]: 1 }}>
        {children}
      </div>
    </section>
  )
}

// ── The cast ────────────────────────────────────────────────────────────────

const AGENTS: { who: keyof typeof CAST; mood: Mood; job: string; line: string; room: string }[] = [
  { who: 'kian', mood: 'look', job: 'The coordinator', line: 'Reads the inbox and calendar, ranks your day, opens a room for every deal.', room: 'Lives in the desk' },
  { who: 'kian-scribe', mood: 'wink', job: 'The writer', line: 'Drafts replies in your voice and turns calls into notes and tasks.', room: 'Works in every deal room' },
  { who: 'kian-studio', mood: 'happy', job: 'The storyteller', line: 'Asks four questions and turns your answers into this week’s posts.', room: 'Lives in content' },
]

/** A Headspace-style poster: flat colour, sun rings, a big character, words at the bottom. */
export function Poster({ bg, ring, ink, accent, art, title, sub, foot }: { bg: string; ring: string; ink: string; accent: string; art: ReactNode; title: string; sub: string; foot?: ReactNode }) {
  return (
    <article className="poster" style={{ ['--bg' as string]: bg, ['--ring' as string]: ring, ['--ink' as string]: ink, ['--accent' as string]: accent }}>
      <div className="poster__rings" aria-hidden>
        <i />
        <i />
      </div>
      <svg className="poster__squiggle" viewBox="0 0 120 200" aria-hidden>
        <path d="M110 0 C 60 40, 130 70, 80 100 S 20 150, 70 170 S 120 200, 90 220" />
      </svg>
      <div className="poster__art">{art}</div>
      <div className="poster__words">
        <div className="poster__title">{title}</div>
        <div className="poster__sub">{sub}</div>
        {foot && <div className="poster__foot">{foot}</div>}
      </div>
    </article>
  )
}

const POSTER_TONES: Record<string, { bg: string; ring: string; ink: string; accent: string }> = {
  kian: { bg: '#cfe0ff', ring: '#b4ceff', ink: '#13254d', accent: '#2a5fd1' },
  'kian-scribe': { bg: '#c9f0d9', ring: '#a9e5c2', ink: '#0f3a24', accent: '#118a4c' },
  'kian-studio': { bg: '#ffd84a', ring: '#ffc21f', ink: '#3a2a00', accent: '#e8650a' },
}

export function Cast() {
  return (
    <Block id="cast" eyebrow="Meet the cast" title="Three agents, one job each">
      <div className="cast">
        {AGENTS.map((a) => {
          const c = CAST[a.who]
          return (
            <Poster
              key={a.who}
              {...POSTER_TONES[a.who]}
              art={<Mascot size={150} shape={c.shape} color={c.color} mood={a.mood} />}
              title={a.who}
              sub={a.line}
              foot={
                <>
                  <span className="poster__job">{a.job}</span>
                  <span className="poster__room">
                    <i className="poster__dot" />
                    {a.room}
                  </span>
                </>
              }
            />
          )
        })}
      </div>
    </Block>
  )
}

// ── Who it's for: a bento, each person a character with what they actually see ──

export function People() {
  return (
    <Block id="who" eyebrow="Who it’s for" title="Built for the whole team">
      <div className="bento">
        <article className="bento__card" data-tone="blue">
          <div className="bento__top">
            <Mascot size={56} shape="blob" color="#ff7eb0" mood="happy" />
            <div>
              <div className="bento__who">The rep</div>
              <div className="bento__line">A ranked morning instead of three tabs.</div>
            </div>
          </div>
          <div className="bento__snip snip-stack" aria-hidden>
            <div>Priya wants Tuesday · <b>draft</b></div>
            <div>Rahul at 10:30 · <b>done</b></div>
            <div>Harbor quiet 6 days · <b>skip</b></div>
          </div>
        </article>

        <article className="bento__card" data-tone="yellow">
          <div className="bento__top">
            <Mascot size={56} shape="sun" color="#ee3f4f" mood="excited" />
            <div>
              <div className="bento__who">The sales lead</div>
              <div className="bento__line">Every discount in one room, margin stated.</div>
            </div>
          </div>
          <div className="bento__snip snip-sheet" aria-hidden>
            <div>
              <span>Lumen · 15% off</span>
              <b>Approved</b>
            </div>
            <div>
              <span>Northwind · 25% off</span>
              <s>Refused</s>
            </div>
            <div>
              <span>Kestrel · pilot price</span>
              <b>Waiting</b>
            </div>
          </div>
        </article>

        <article className="bento__card" data-tone="green">
          <div className="bento__top">
            <Mascot size={56} shape="bubble" color="#3d7bf2" mood="surprised" />
            <div>
              <div className="bento__who">The teammate taking over</div>
              <div className="bento__line">Join the room, read the trail, done.</div>
            </div>
          </div>
          <div className="bento__snip snip-trail" aria-hidden>
            <div className="snip-trail__join">Meera joined the Lumen room</div>
            <div>12 messages · 2 decisions · 1 draft</div>
          </div>
        </article>

        <article className="bento__card" data-tone="pink">
          <div className="bento__top">
            <Mascot size={56} shape="flower" color="#ff8a1f" mood="wink" />
            <div>
              <div className="bento__who">The founder selling alone</div>
              <div className="bento__line">A sales desk without hiring one.</div>
            </div>
          </div>
          <div className="bento__snip snip-sheet" aria-hidden>
            <div>
              <span>Kestrel</span>
              <s>Discovery</s> <b>Pilot</b>
            </div>
            <div>
              <span>Lumen</span>
              <b>Proposal</b>
            </div>
          </div>
        </article>
      </div>
    </Block>
  )
}

// ── How Kian uses Switch: three bound notebook cards ───────────────────────

/** Three cards bound with rings: the rooms, today's work, and a live hand-off. */
export function SwitchNotebook() {
  return (
    <div className="notebook" aria-label="How Kian uses Switch">
      <article className="nb nb--rooms">
        <h3 className="nb__title">
          Rooms,
          <br />
          one per deal
        </h3>
        <ul className="nb__rooms">
          {[
            { name: 'Desk', note: 'Your morning', shape: 'flower', color: '#3d7bf2' },
            { name: 'Lumen Health', note: 'Annual plan', shape: 'bubble', color: '#19b86b' },
            { name: 'Approvals', note: 'Sales lead only', shape: 'blob', color: '#ffcf1f' },
          ].map((r) => (
            <li key={r.name}>
              <Mascot size={32} shape={r.shape as Shape} color={r.color} mood="happy" />
              <span>
                <b>{r.name}</b>
                <small>{r.note}</small>
              </span>
            </li>
          ))}
        </ul>
        <div className="nb__tags">
          <span>History is memory</span>
          <span>Decisions on record</span>
        </div>
      </article>

      <article className="nb nb--work">
        <span className="nb__rings" aria-hidden>
          {Array.from({ length: 7 }, (_, i) => (
            <i key={i} />
          ))}
        </span>
        <h3 className="nb__title">
          Today’s
          <br />
          work
        </h3>
        <ul className="nb__checks">
          {[
            ['Brief posted', true],
            ['Draft for Priya', true],
            ['Kestrel notes', true],
            ['Room for Harbor', false],
            ['Weekly post', false],
          ].map(([label, done]) => (
            <li key={label as string} data-done={done || undefined}>
              <i />
              {label}
            </li>
          ))}
        </ul>
      </article>

      <article className="nb nb--live">
        <span className="nb__rings" aria-hidden>
          {Array.from({ length: 7 }, (_, i) => (
            <i key={i} />
          ))}
        </span>
        <h3 className="nb__title">
          Agents talk
          <br />
          by name
        </h3>
        <div className="nb__chat">
          <div className="nb__msg">
            <Mascot size={28} mood="look" />
            <span>
              <b>@kian-scribe</b> Priya wants Tuesday. Draft it.
            </span>
          </div>
          <div className="nb__msg nb__msg--right">
            <span>Draft saved in Gmail. Not sent.</span>
            <Mascot size={28} shape="bubble" color="#19b86b" mood="wink" />
          </div>
          <div className="nb__msg">
            <PersonAvatar name="Yukti" size={28} />
            <span>yes</span>
          </div>
        </div>
      </article>
    </div>
  )
}

const MORE: { name: string; use: string; color: string }[] = [
  { name: 'Rules', use: 'Every room says it: agents draft, people send.', color: '#ff7eb0' },
  { name: 'Who can talk to whom', use: 'Only the sales lead can approve a price.', color: '#ffcf1f' },
  { name: 'Bridges', use: 'The desk is on Telegram and Mattermost at once.', color: '#7c5cff' },
  { name: 'One template', use: 'One YAML creates every agent and room.', color: '#19b86b' },
]

export function SwitchUse() {
  return (
    <Block id="switch" eyebrow="How Kian uses Switch" title="Take Switch away and there is no product left">
      <SwitchNotebook />
      <ul className="nb-more">
        {MORE.map((m) => (
          <li key={m.name} style={{ ['--c' as string]: m.color }}>
            <b>{m.name}</b>
            <span>{m.use}</span>
          </li>
        ))}
      </ul>
    </Block>
  )
}

// ── The story in three steps (Granola-style switcher) ───────────────────────

const STEPS3: { key: string; time: string; who: keyof typeof CAST; mood: Mood; says: string; title: string; body: string; scene: ReactNode }[] = [
  {
    key: 'meeting',
    time: '11:15 AM',
    who: 'kian-scribe',
    mood: 'done',
    says: 'Notes from the Kestrel call are in. Two tasks, one Sheet change for you.',
    title: 'Calls turn into tasks.',
    body: 'Record a call from the widget. kian-scribe writes the notes and next steps, and asks before it touches the lead list.',
    scene: <MeetingScene />,
  },
  {
    key: 'room',
    time: '2:30 PM',
    who: 'kian',
    mood: 'surprised',
    says: 'Someone new emailed. I opened a room for Harbor Foods.',
    title: 'Every new deal gets its own room.',
    body: 'A new name in the inbox becomes a room with the right people in it. Its history is the deal’s memory.',
    scene: <RoomScene />,
  },
  {
    key: 'content',
    time: '5:00 PM',
    who: 'kian-studio',
    mood: 'excited',
    says: 'Four quick questions, then this week’s post is ready.',
    title: 'End the day with a post.',
    body: 'Answer four questions out loud. kian-studio turns them into a LinkedIn post and an X thread, ready for you to publish.',
    scene: <ContentScene />,
  },
]

// where each moment sits on the ruler, as a share of its width
const STOPS = ['16.66%', '50%', '83.33%']
const TICKS = 48

/** A morning as a day timeline (after Grok Bot): a ruler, a time pill, and the agent talking. */
export function Story() {
  const [i, setI] = useState(0)
  const [held, setHeld] = useState(false)
  const ref = useReveal<HTMLElement>()

  // move to the next moment after one loop of its scene, until someone takes the wheel
  useEffect(() => {
    if (held || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = setTimeout(() => setI((n) => (n + 1) % STEPS3.length), 4500)
    return () => clearTimeout(t)
  }, [i, held])

  const go = (n: number) => {
    setI((n + STEPS3.length) % STEPS3.length)
    setHeld(true)
  }
  const step = STEPS3[i]
  const c = CAST[step.who]

  return (
    <section className="story reveal" id="story" ref={ref}>
      <div className="tl">
        <div className="tl__mover" style={{ ['--x' as string]: STOPS[i] }}>
          <div className="tl__actor">
            <div className="tl__says" key={step.key}>
              {step.says}
            </div>
            <Mascot size={88} shape={c.shape} color={c.color} mood={step.mood} />
          </div>
          <div className="tl__pill">
            <button aria-label="Earlier" onClick={() => go(i - 1)}>
              ‹
            </button>
            <span key={step.time}>{step.time}</span>
            <button aria-label="Later" onClick={() => go(i + 1)}>
              ›
            </button>
            {!held && <i className="tl__timer" key={`t-${i}`} aria-hidden />}
          </div>
        </div>
        <div className="tl__ruler" role="tablist" aria-label="The rest of the day">
          {Array.from({ length: TICKS }, (_, t) => (
            <i key={t} className="tl__tick" />
          ))}
          {STOPS.map((x, n) => (
            <button
              key={x}
              role="tab"
              aria-selected={n === i}
              aria-label={`${STEPS3[n].time}: ${STEPS3[n].title}`}
              className="tl__stop"
              style={{ left: x }}
              onClick={() => go(n)}
            />
          ))}
        </div>
      </div>

      <div className="story__copy" key={step.key}>
        <p className="eyebrow">The rest of the day</p>
        <h2 className="feature__title">{step.title}</h2>
        <p className="feature__body">{step.body}</p>
      </div>
      <div className="story__scene" key={`s-${step.key}`} role="tabpanel">
        {step.scene}
      </div>
    </section>
  )
}

// ── Everywhere you are ──────────────────────────────────────────────────────

export function Everywhere() {
  return (
    <Block id="download" eyebrow="Everywhere you are" title="On your desk and in your pocket">
      <div className="where">
        <article className="where__card where__card--desk">
          <div className="where__words">
            <b>Mac and Windows</b>
            <span>A small widget that listens when you talk and taps you when a room needs you.</span>
            <div className="where__dl">
              <span className="where__btn">macOS</span>
              <span className="where__btn">Windows</span>
              <span className="where__soon">Builds land with v0.1</span>
            </div>
          </div>
          <svg className="where__art" viewBox="0 0 400 230" aria-hidden>
            <path d="M50 190 A150 150 0 0 1 350 190 Z" fill="#ff8a1f" />
            <path d="M184 112 Q196 124 208 112 M226 112 Q238 124 250 112" fill="none" stroke="#111" strokeWidth="5" strokeLinecap="round" />
            <circle cx="104" cy="66" r="42" fill="#fbf7f0" />
            <path d="M94 100 L88 120 L108 104 Z" fill="#fbf7f0" />
            <path d="M78 56 q8 -6 16 0 t16 0 t16 0 M78 72 q8 -6 16 0 t16 0 t16 0" fill="none" stroke="#cfc8bb" strokeWidth="4" strokeLinecap="round" />
            <rect y="186" width="400" height="44" fill="#4aa3f5" />
            <rect x="96" y="112" width="104" height="72" rx="8" fill="#e9e4da" />
            <rect x="104" y="120" width="88" height="56" rx="4" fill="#20232c" />
            <rect x="126" y="158" width="44" height="12" rx="6" fill="#3a3d47" />
            <circle cx="140" cy="164" r="3" fill="#fff" />
            <circle cx="156" cy="164" r="3.4" fill="none" stroke="#fff" strokeWidth="1.6" />
            <rect x="80" y="182" width="136" height="8" rx="4" fill="#d9d3c7" />
            <rect x="264" y="164" width="76" height="14" rx="7" fill="#e6e2da" />
            <rect x="254" y="176" width="98" height="14" rx="7" fill="#fbf7f0" />
          </svg>
        </article>

        <article className="where__card where__card--phone">
          <div className="where__words">
            <b>Your phone</b>
            <span>Check in from Telegram, Slack, Teams or Discord. Switch bridges the same rooms there.</span>
          </div>
          <div className="where__phone-art" aria-hidden>
            <span className="where__spark where__spark--a" />
            <span className="where__spark where__spark--b" />
            <span className="where__star" />
            <Mascot size={150} shape="blob" color="#ffcf1f" mood="look" />
            <svg className="where__check" viewBox="0 0 100 100">
              <path d="M18 52 L42 76 L86 20" fill="none" stroke="#ff8a1f" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="where__note">
            <span className="where__app" aria-hidden>
              <i />
              <i />
              <i />
            </span>
            <span>
              <b>kian</b> Priya replied. Your draft is ready for a yes.
            </span>
          </div>
        </article>
      </div>

      <ul className="a11y" aria-label="Accessibility">
        <li style={{ ['--c' as string]: '#3d7bf2' }}>Keyboard first</li>
        <li style={{ ['--c' as string]: '#19b86b' }}>Screen reader labels</li>
        <li style={{ ['--c' as string]: '#ff8a1f' }}>Reduced motion respected</li>
        <li style={{ ['--c' as string]: '#ff5a8a' }}>Voice on or off</li>
      </ul>
    </Block>
  )
}

// ── Judging ─────────────────────────────────────────────────────────────────

const CRITERIA = [
  ['Use of Switch', 'Rooms per deal, agent hand-offs, approvals, rules, tasks, decisions, two bridges, a template.'],
  ['Technical execution', 'One template, a toolkit with no send command, a seed script with synthetic leads.'],
  ['Creativity and impact', 'Every Switch example is engineering triage. Kian is sales, the most common workflow there is.'],
  ['Presentation', 'A three minute video of one real morning, each beat labelled with its Switch feature.'],
]

export function Criteria() {
  return (
    <Block id="judging" eyebrow="For the judges" title="What Kian shows for each criterion">
      <div className="criteria">
        {CRITERIA.map(([name, a], i) => (
          <article className="criteria__item" key={name}>
            <Chip size="sm" variant="soft" color={(['accent', 'success', 'warning', 'danger'] as const)[i]}>
              {name}
            </Chip>
            <p className="criteria__a">{a}</p>
          </article>
        ))}
      </div>
    </Block>
  )
}

// ── Setup ───────────────────────────────────────────────────────────────────

const STEPS = [
  ['Install Switch Console', 'Run the quickstart until an agent answers in Mattermost.'],
  ['Seed a demo account', 'seed.py adds 7 synthetic leads, 6 emails and 2 meetings.'],
  ['Import the template', 'kian.template.yaml creates the agents and rooms.'],
  ['Say “morning, Kian”', 'From the widget, Mattermost or Telegram.'],
]

export function Setup() {
  return (
    <Block id="setup" eyebrow="Try it" title="Four steps to your first brief">
      <ol className="steps">
        {STEPS.map(([t, b], i) => (
          <li className="step" key={t}>
            <span className="step__n">{i + 1}</span>
            <div className="step__title">{t}</div>
            <p className="step__body">{b}</p>
          </li>
        ))}
      </ol>
    </Block>
  )
}

// ── FAQ (HeroUI Accordion) ──────────────────────────────────────────────────

const FAQ = [
  ['Does Kian ever email a customer?', 'No. The toolkit can read mail, create drafts and update the lead list after a yes. There is no send command for an agent to call.'],
  ['Why a widget if everything lives in chat?', 'Chat is where the work is recorded. The widget is the fast way in: talk instead of typing, and get tapped when a room needs you.'],
  ['Isn’t the dashboard a second UI?', 'It only reads the rooms. Every button on it posts the same message you would have typed, so the rooms stay the source of truth.'],
  ['What does it run on?', 'Switch runs the agents and rooms, the agents are Claude, and the site runs on free tiers. Your data stays in your own Google account.'],
  ['Can my team use it today?', 'Yes, with a Switch server, a Google account and the template. Start with the synthetic demo account, then switch to a real one.'],
]

export function Faq() {
  return (
    <Block id="faq" eyebrow="Questions" title="Things people ask">
      <Accordion className="faq" defaultExpandedKeys={['0']}>
        {FAQ.map(([q, a], i) => (
          <Accordion.Item key={q} id={String(i)}>
            <Accordion.Heading>
              <Accordion.Trigger className="faq__q">
                {q}
                <Accordion.Indicator />
              </Accordion.Trigger>
            </Accordion.Heading>
            <Accordion.Panel>
              <Accordion.Body className="faq__a">{a}</Accordion.Body>
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
    </Block>
  )
}
