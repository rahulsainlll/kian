import { CAST, KianWidget, Mascot, type RoomMessage } from '@kian/ui'
import type { ReactNode } from 'react'
import { Logo } from '../Chrome'
import { SwitchNotebook } from './HomeSections'
import './art.css'

/*
 * Fixed-size artwork for the OG image and the README, rendered with the real
 * components and captured with headless Chrome (scripts/render-art.sh).
 * Visit /art/<name> to see one; every frame is exactly its target size.
 */

const BRIEF: RoomMessage = {
  id: 'a1',
  author: 'kian',
  room: 'kian-desk',
  text: 'Priya Shah at Lumen Health wants to move the call to Tuesday.',
  chips: [{ label: 'done' }, { label: 'skip' }, { label: 'draft', tone: 'primary' }],
  voiceReply: true,
}

function Frame({ w, h, className = '', children }: { w: number; h: number; className?: string; children: ReactNode }) {
  return (
    <div id="art" className={`art ${className}`} style={{ width: w, height: h }}>
      {children}
    </div>
  )
}

function Dots() {
  const dots: [number, number, number, string][] = [
    [4, 8, 22, '#3d7bf2'], [12, 78, 14, '#ffcf1f'], [27, 6, 12, '#19b86b'], [46, 90, 10, '#ff7eb0'],
    [62, 5, 14, '#ff8a1f'], [94, 14, 20, '#19b86b'], [88, 84, 12, '#3d7bf2'], [97, 58, 10, '#ff7eb0'],
  ]
  return (
    <div className="art__dots" aria-hidden>
      {dots.map(([x, y, r, c], i) => (
        <i key={i} style={{ left: `${x}%`, top: `${y}%`, width: r, height: r, background: c }} />
      ))}
    </div>
  )
}

function CastRow({ size = 120 }: { size?: number }) {
  return (
    <div className="art__cast">
      {(['kian', 'kian-scribe', 'kian-studio'] as const).map((who, i) => (
        <span key={who} style={{ ['--r' as string]: `${[-8, 4, 10][i]}deg` }}>
          <Mascot size={size} shape={CAST[who].shape} color={CAST[who].color} mood={(['look', 'wink', 'happy'] as const)[i]} />
        </span>
      ))}
    </div>
  )
}

/** 1200×630 share card: the logo and one line on a soft sunrise, with the cast peeking up. */
function Og() {
  return (
    <Frame w={1200} h={630} className="art--og">
      <div className="og__center">
        <Logo size={140} />
        <p className="og__line">Your sales desk, run by agents.</p>
        <p className="og__sub">Built on Switch</p>
      </div>
      <div className="og__cast" aria-hidden>
        <span style={{ ['--r' as string]: '-10deg' }}>
          <Mascot size={150} shape="bubble" color="#19b86b" mood="wink" />
        </span>
        <span style={{ ['--r' as string]: '4deg' }}>
          <Mascot size={190} mood="look" />
        </span>
        <span style={{ ['--r' as string]: '12deg' }}>
          <Mascot size={150} shape="sun" color="#ff8a1f" mood="happy" />
        </span>
      </div>
    </Frame>
  )
}

/** README header, 1280×560. */
function Hero() {
  return (
    <Frame w={1280} h={560} className="art--hero">
      <Dots />
      <div className="hero-art__band">
        <span className="hero-art__ticket">
          <small>Rule one</small>
          Agents draft.
        </span>
        <span className="hero-art__burst">People send!</span>
      </div>
      <div className="hero-art__body">
        <Logo size={150} />
        <p>A sales desk run by agents in your team’s Switch rooms.</p>
      </div>
      <CastRow size={110} />
    </Frame>
  )
}

/** README: meet the cast, 1280×440. */
function Cast() {
  const people = [
    { who: 'kian', job: 'The coordinator', line: 'Ranks your morning and opens a room for every deal.', bg: '#cfe0ff', ink: '#13254d', mood: 'look' },
    { who: 'kian-scribe', job: 'The writer', line: 'Drafts replies in your voice. Never sends.', bg: '#c9f0d9', ink: '#0f3a24', mood: 'wink' },
    { who: 'kian-studio', job: 'The storyteller', line: 'Turns four spoken answers into posts.', bg: '#ffd84a', ink: '#3a2a00', mood: 'happy' },
  ] as const
  return (
    <Frame w={1280} h={440} className="art--cast">
      {people.map((p) => (
        <div className="cast-art__card" key={p.who} style={{ background: p.bg, color: p.ink }}>
          <div className="cast-art__face">
            <Mascot size={140} shape={CAST[p.who].shape} color={CAST[p.who].color} mood={p.mood} />
          </div>
          <b>{p.who}</b>
          <span className="cast-art__job">{p.job}</span>
          <span className="cast-art__line">{p.line}</span>
        </div>
      ))}
    </Frame>
  )
}

/** README: how Kian uses Switch, 1280×460. */
function Switch() {
  return (
    <Frame w={1280} h={460} className="art--switch">
      <SwitchNotebook />
    </Frame>
  )
}

/** README: the widget on a desktop, 1280×520. */
function Widget() {
  return (
    <Frame w={1280} h={520} className="art--widget">
      <div className="widget-art__said">“Morning, Kian.”</div>
      <div>
        <KianWidget keyboard={false} voiceState="idle" message={BRIEF} queued={2} />
      </div>
    </Frame>
  )
}

const ART: Record<string, () => ReactNode> = { og: Og, hero: Hero, cast: Cast, switch: Switch, widget: Widget }

export function Art({ name }: { name?: string }) {
  const Piece = (name && ART[name]) || Og
  return (
    <div className="art-page">
      <Piece />
    </div>
  )
}
