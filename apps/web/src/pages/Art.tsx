/*
 * Fixed-size artwork for the OG image and the README, rendered with the real
 * components and captured with headless Chrome (scripts/render-art.sh).
 * Visit /art/<name> to see one; every frame is exactly its target size.
 */
import { CAST, KianWidget, Mascot, type RoomMessage } from '@kian/ui'
import type { ReactNode } from 'react'
import { Logo } from '../Chrome'
import { SwitchNotebook } from './home/SwitchUse'
import './art.css'

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

/** 1200×630 share card: the README banner, at share size. */
function Og() {
  return <Banner w={1200} h={630} />
}

/** README header, 1280×560. */
function Hero() {
  return <Banner w={1280} h={560} />
}

/** The banner: grid band with stickers, the logo and one line, the cast peeking up. */
function Banner({ w, h }: { w: number; h: number }) {
  return (
    <Frame w={w} h={h} className="art--hero">
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

/** The desktop app's icon, 512×512: the blue flower on a cream squircle with room around it, as macOS expects. */
function AppIcon() {
  return (
    <div className="appicon" style={{ width: 512, height: 512 }}>
      <div className="appicon__tile">
        <Mascot size={300} mood="happy" />
      </div>
    </div>
  )
}

/** The menu bar icon, 18×18: the flower alone, on nothing. */
function TrayIcon() {
  return (
    <div className="trayicon" style={{ width: 18, height: 18 }}>
      <Mascot size={18} mood="happy" />
    </div>
  )
}

const ART: Record<string, () => ReactNode> = { og: Og, hero: Hero, cast: Cast, switch: Switch, widget: Widget, appicon: AppIcon, trayicon: TrayIcon }
const CLEAR = new Set(['appicon', 'trayicon'])

export function Art({ name }: { name?: string }) {
  const Piece = (name && ART[name]) || Og
  return (
    <div className={`art-page${name && CLEAR.has(name) ? ' art-page--clear' : ''}`}>
      <Piece />
    </div>
  )
}
