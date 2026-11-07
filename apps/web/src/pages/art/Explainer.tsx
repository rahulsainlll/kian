/*
 * The explainer slides for the product video, 1920×1080 each, in the OG art's
 * style: the problem, why Switch, how Kian uses Switch, the architecture, use
 * cases and impact, and the closing card. Rendered from /art/x-<name>.
 *
 * Motion (choreography): the kicker pill only fades; the title leads, moving
 * first and furthest; the content follows with smaller moves on a stagger
 * whose gaps shrink, so the slide builds as one wave. ?t=<seconds> seeks the
 * animation, so the video can be captured frame by frame.
 */
import { Logo, Mascot, type Shape } from '@kian/ui'
import type { ReactNode } from 'react'
import './explainer.css'
import './explainer-motion.css'

const RAHUL = { shape: 'flower' as Shape, color: '#3d7bf2' }
const MAYANK = { shape: 'sun' as Shape, color: '#ff8a1f' }
const YUKTI = { shape: 'bubble' as Shape, color: '#19b86b' }

function Slide({ kicker, title, children }: { kicker: string; title: ReactNode; children: ReactNode }) {
  return (
    <div id="art" className="x" style={{ width: 1920, height: 1080 }}>
      <header className="x__head" {...anim('fade', 0)}>
        <Logo size={40} />
        <span className="x__kicker">{kicker}</span>
      </header>
      <h1 className="x__title" {...anim('lead', 0.08)}>
        {title}
      </h1>
      <div className="x__body">{children}</div>
    </div>
  )
}

function Tile({ icon, title, line, i = 0 }: { icon: ReactNode; title: string; line: string; i?: number }) {
  return (
    <div
      className="x-tile"
      data-anim="item"
      data-glow
      style={{ ['--d' as string]: `${wave(i)}s`, ['--g' as string]: `${2 + i * 1.6}s` }}
    >
      <div className="x-tile__icon">{icon}</div>
      <b>{title}</b>
      <p>{line}</p>
    </div>
  )
}

type Kind = 'lead' | 'item' | 'fade'
/** Animation props: a role and a start time in seconds. */
const anim = (kind: Kind, d: number) => ({ 'data-anim': kind, style: { ['--d' as string]: `${d}s` } })
/** Start times after the title: first gap 0.14s, each next one 0.02s shorter, never under 0.07s. */
const wave = (i: number, start = 0.42) => {
  let t = start
  for (let k = 0; k < i; k++) t += Math.max(0.07, 0.14 - k * 0.02)
  return t
}

const Face = ({ who, size = 64 }: { who: { shape: Shape; color: string }; size?: number }) => (
  <Mascot size={size} shape={who.shape} color={who.color} mood="happy" />
)

export function XProblem() {
  return (
    <Slide kicker="The problem" title={<>The work that hurts is <em>between</em> people</>}>
      <div className="x-pings">
        {['Did Mayank send the proposal?', 'Can someone remind Yukti about the deck?', 'Who is following up with the new client?', 'Is the discount approved?'].map((t, i) => (
          <div key={t} className="x-ping" data-anim="item" style={{ ['--i' as string]: i, ['--d' as string]: `${wave(i)}s` }}>
            <span className="x-bob" style={{ ['--b' as string]: `${1.8 + i * 0.7}s` }}>
              {t}
            </span>
          </div>
        ))}
      </div>
      <p className="x__lede" {...anim('item', wave(4))}>
        Personal AI assistants only know one person. Teams lose hours to status pings, reminders and hand-offs.
      </p>
    </Slide>
  )
}

export function XWhySwitch() {
  return (
    <Slide kicker="Why Switch" title="Agents need a place to meet. Switch is that place.">
      <div className="x-grid x-grid--3">
        <Tile i={0} icon="#" title="Shared rooms" line="People and agents in the same channels, with the whole history." />
        <Tile i={1} icon="@" title="Agents talk by name" line="One agent asks another with send_targeted_message, in the open." />
        <Tile i={2} icon="⎘" title="One template" line="A single import creates every agent, room and link for the team." />
        <Tile i={3} icon="⇄" title="Where you already chat" line="Mattermost, Slack, Teams, Telegram and Discord, through bridges." />
        <Tile i={4} icon="⌂" title="Your own server" line="Agents run on your machines, with your accounts and your rules." />
        <Tile i={5} icon="✓" title="Rules on the room" line="Room instructions every agent follows, like: ask before you send." />
      </div>
    </Slide>
  )
}

export function XHowKian() {
  return (
    <Slide kicker="How Kian uses Switch" title="An agent for every person, one room where they work together">
      <div className="x-team">
        {[
          { who: RAHUL, name: 'rahul-kian', desk: 'rahul-desk' },
          { who: MAYANK, name: 'mayank-kian', desk: 'mayank-desk' },
          { who: YUKTI, name: 'yukti-kian', desk: 'yukti-desk' },
        ].map((a, i) => (
          <div key={a.name} className="x-member" {...anim('item', wave(i))}>
            <span className="x-desk">#{a.desk}</span>
            <Face who={a.who} size={84} />
            <b>{a.name}</b>
            <small>acts only on its own person’s tasks, calendar and mail</small>
          </div>
        ))}
      </div>
      <div className="x-room" {...anim('item', wave(3) + 0.1)}>
        <i className="x-travel">rahul-kian → mayank-kian: Update request from rahul</i>
        <b>#kian-team</b>
        <span>agents ask each other for updates, reminders and reviews, one thread per request, where everyone can see</span>
      </div>
    </Slide>
  )
}

export function XArchitecture() {
  return (
    <Slide kicker="Architecture" title="Talk, and the right agent does the work">
      <div className="x-arch">
        <i className="x-packet" />
        <div className="x-node x-node--you" {...anim('item', wave(0, 0.4))}>
          <Face who={RAHUL} size={56} />
          <b>You</b>
          <small>hold fn and talk</small>
        </div>
        <span className="x-link">→</span>
        <div className="x-node x-node--wispr" {...anim('item', wave(1, 0.4))}>
          <b>Wispr Flow</b>
          <small>voice to text, the default input</small>
        </div>
        <span className="x-link">→</span>
        <div className="x-node" {...anim('item', wave(2, 0.4))}>
          <b>Kian widget</b>
          <small>macOS and Windows, cards with buttons</small>
        </div>
        <span className="x-link">→</span>
        <div className="x-node x-node--switch" {...anim('item', wave(3, 0.4))}>
          <b>Switch rooms</b>
          <small>Mattermost, your desk and #kian-team</small>
        </div>
        <span className="x-link">→</span>
        <div className="x-node" {...anim('item', wave(4, 0.4))}>
          <b>Claude Code agents</b>
          <small>one per person, created from team.template.yaml</small>
        </div>
        <span className="x-link">→</span>
        <div className="x-node" {...anim('item', wave(5, 0.4))}>
          <b>kian_tools</b>
          <small>each person’s Gmail, Calendar and Tasks; send only with a yes</small>
        </div>
      </div>
      <p className="x__lede" {...anim('fade', wave(6, 0.4))}>
        Answers flow back the same way and pop up above your flower.
      </p>
    </Slide>
  )
}

export function XImpact() {
  return (
    <Slide kicker="Use cases and impact" title="Every team runs on hand-offs">
      <div className="x-grid x-grid--4">
        <Tile i={0} icon="💼" title="Sales" line="Discounts approved by the lead, follow-ups drafted, nothing sent without a yes." />
        <Tile i={1} icon="🛠" title="Operations" line="Reminders that land on the right person’s calendar, with who asked." />
        <Tile i={2} icon="🤝" title="Hiring and partners" line="Updates gathered from each owner’s agent, not a status meeting." />
        <Tile i={3} icon="🚀" title="Founders" line="A team of agents that keeps everyone moving while you sell." />
      </div>
      <div className="x-wins" {...anim('item', wave(4) + 0.1)}>
        <span>Fewer status pings</span>
        <span>Every hand-off visible</span>
        <span>Nothing goes out without its owner’s yes</span>
      </div>
    </Slide>
  )
}

export function XClosing() {
  return (
    <div id="art" className="x x--close" style={{ width: 1920, height: 1080 }}>
      <Logo size={150} />
      <p {...anim('item', 0.95)}>An agent for everyone on your team, working together in Switch.</p>
      <div className="x-cast" {...anim('item', 1.1)}>
        {[RAHUL, MAYANK, YUKTI].map((w, i) => (
          <span key={i} className="x-bob" style={{ ['--b' as string]: `${1 + i * 0.45}s` }}>
            <Face who={w} size={110} />
          </span>
        ))}
      </div>
      <div className="x-links" {...anim('item', 1.22)}>
        <span>kiandesk.vercel.app</span>
        <span>github.com/rahulsainlll/kian</span>
      </div>
      <small {...anim('fade', 1.35)}>Built with Switch, Claude and Wispr Flow</small>
    </div>
  )
}
