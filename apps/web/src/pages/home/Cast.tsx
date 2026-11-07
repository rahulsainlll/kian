/*
 * Meet the cast: one Headspace-style poster per agent, each with its job,
 * one line about it and the room it works in.
 */
import { CAST, Mascot, type Mood } from '@kian/ui'
import type { ReactNode } from 'react'
import { Block } from './Block'

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
