/*
 * The explainer slides for the product video, 1920×1080 each, in the site's
 * style: the problem, how Kian uses Switch and the closing card, plus the
 * helpers every slide shares. The other slides live in ExplainerSwitch.tsx
 * and ExplainerScenes.tsx. Rendered from /art/x-<name>.
 *
 * Motion (choreography): the kicker pill only fades; the title leads, moving
 * first and furthest; the content follows with smaller moves on a stagger
 * whose gaps shrink, so the slide builds as one wave. The agents bob and
 * jiggle while the slide holds. ?t=<seconds> seeks every animation, so the
 * video can be captured frame by frame.
 */
import { Logo, Mascot, type Mood, type Shape } from '@kian/ui'
import type { CSSProperties, ReactNode } from 'react'
import './explainer.css'
import './explainer-motion.css'
import './explainer-v2.css'
import './explainer-scenes.css'
import './explainer-v2-motion.css'

export type Who = { shape: Shape; color: string; name: string }
export const RAHUL: Who = { shape: 'flower', color: '#3d7bf2', name: 'Rahul' }
export const MAYANK: Who = { shape: 'sun', color: '#ff8a1f', name: 'Mayank' }
export const YUKTI: Who = { shape: 'bubble', color: '#19b86b', name: 'Yukti' }
export const TEAM = [RAHUL, MAYANK, YUKTI]

export function Slide({ kicker, title, children }: { kicker: string; title: ReactNode; children: ReactNode }) {
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

export type Kind = 'lead' | 'item' | 'fade' | 'pop' | 'open' | 'draw' | 'slide'
/** Animation props: a role and a start time in seconds, plus any extra style. */
export const anim = (kind: Kind, d: number, style: CSSProperties = {}) => ({
  'data-anim': kind,
  style: { ...style, ['--d' as string]: `${d}s` },
})
/** Start times after the title: first gap 0.14s, each next one 0.02s shorter, never under 0.07s. */
export const wave = (i: number, start = 0.42) => {
  let t = start
  for (let k = 0; k < i; k++) t += Math.max(0.07, 0.14 - k * 0.02)
  return t
}

/** An agent's face that bobs and jiggles while the slide holds; b offsets its phase. */
export function Face({ who, size = 64, b = 1, mood = 'happy' }: { who: Who; size?: number; b?: number; mood?: Mood }) {
  return (
    <span className="x-bob" style={{ ['--b' as string]: `${b}s` }}>
      <span className="x-jig" style={{ ['--b' as string]: `${b * 0.6}s` }}>
        <Mascot size={size} shape={who.shape} color={who.color} mood={mood} />
      </span>
    </span>
  )
}

/** A one-colour brand mark from /art-logos, tinted with its brand colour. */
export function Brand({ name, color, size = 40 }: { name: string; color: string; size?: number }) {
  return (
    <i
      className="x-brand"
      style={{ width: size, height: size, ['--src' as string]: `url(/art-logos/${name}.svg)`, ['--c' as string]: color }}
    />
  )
}

/** A full-colour app icon from /art-logos (Switch, Wispr Flow). */
export const AppIcon = ({ name, size = 56 }: { name: string; size?: number }) => (
  <img className="x-appicon" src={`/art-logos/${name}.png`} width={size} height={size} alt="" />
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

export function XHowKian() {
  const desks = ['rahul-desk', 'mayank-desk', 'yukti-desk']
  return (
    <Slide kicker="How Kian uses Switch" title="An agent for every person, one room where they work together">
      <div className="x-team">
        {TEAM.map((who, i) => (
          <div key={who.name} className={`x-member x-member--${i}`} {...anim('pop', wave(i))}>
            <span className="x-desk">#{desks[i]}</span>
            <Face who={who} size={96} b={0.6 + i * 0.5} />
            <b>{who.name}</b>
            <small>works only on {who.name}’s own tasks, calendar and mail</small>
          </div>
        ))}
      </div>
      <div className="x-room" {...anim('item', wave(3) + 0.1)}>
        <i className="x-travel">Rahul → Mayank: Update request</i>
        <b>#kian-team</b>
        <span>the agents ask each other for updates, reminders and reviews, one thread per request, where everyone can see</span>
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
        {TEAM.map((w, i) => (
          <Face key={w.name} who={w} size={110} b={1 + i * 0.45} />
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
