/*
 * Insights: drafts and replies over time, a gauge for time saved, bars per
 * room and a heatmap of when the team works.
 */
import { useState } from 'react'

// ── Insights ────────────────────────────────────────────────────────────────

// darkest for the busiest room, lighter down the list
const TEAL_RAMP = ['#1f6f6b', '#2d8a84', '#3fa59c', '#6cc2b9', '#9fdad2']

const ROOM_BARS = [
  { room: 'deal-lumen', pct: 42, label: '18 drafts' },
  { room: 'deal-kestrel', pct: 27, label: '11 notes' },
  { room: 'kian-desk', pct: 18, label: '64 brief items' },
  { room: 'approvals', pct: 8, label: '4 decisions' },
  { room: 'content', pct: 5, label: '3 posts' },
]

export function Insights() {
  const [tab, setTab] = useState<'usage' | 'agents' | 'team'>('usage')
  return (
    <>
      <h1 className="hub__title">Insights</h1>
      <div className="hub-tabs" role="tablist">
        {(['usage', 'agents', 'team'] as const).map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} className="hub-tabs__tab" onClick={() => setTab(t)}>
            {t === 'usage' ? 'Your desk' : t === 'agents' ? 'Agents' : 'Team'}
          </button>
        ))}
      </div>

      <div className="ins-grid">
        <div className="ins-card">
          <div className="ins-card__n">86%</div>
          <div className="ins-card__label">Drafts approved as written</div>
          <Gauge value={0.86} />
        </div>
        <div className="ins-card">
          <div className="ins-card__n">6.5 h</div>
          <div className="ins-card__label">Saved this week</div>
          <div className="ins-card__rows">
            <span>Triage you didn’t do</span>
            <b>3.1 h</b>
            <span>Drafts you didn’t write</span>
            <b>2.6 h</b>
            <span>Notes you didn’t type</span>
            <b>0.8 h</b>
          </div>
        </div>
        <div className="ins-card">
          <div className="ins-card__n">0</div>
          <div className="ins-card__label">Emails sent without you</div>
          <p className="ins-card__note">The toolkit has no send command. This number cannot go up.</p>
        </div>
      </div>

      <div className="ins-grid ins-grid--2">
        <div className="ins-card">
          <div className="ins-card__head">
            <b>Room activity</b>
            <span>5 rooms</span>
          </div>
          <ul className="hub-bars">
            {ROOM_BARS.map((b, i) => (
              <li key={b.room}>
                <span className="hub-bars__bar" style={{ ['--w' as string]: `${Math.max(b.pct, 6)}%`, ['--i' as string]: i, background: TEAL_RAMP[i] }}>
                  {b.pct}%
                </span>
                <span className="hub-bars__label">
                  #{b.room} · {b.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="ins-card">
          <div className="ins-card__head">
            <b>11 day streak</b>
            <span>Every follow-up answered</span>
          </div>
          <Heatmap />
        </div>
      </div>
    </>
  )
}

function Gauge({ value }: { value: number }) {
  const r = 46
  const len = Math.PI * r
  return (
    <svg className="gauge" viewBox="0 0 120 70" aria-hidden>
      <path d={`M14 62 A${r} ${r} 0 0 1 106 62`} className="gauge__track" />
      <path d={`M14 62 A${r} ${r} 0 0 1 106 62`} className="gauge__fill" style={{ strokeDasharray: len, strokeDashoffset: len * (1 - value) }} />
    </svg>
  )
}

/** Weeks by weekday; the last 11 days are the streak. Deterministic, not random. */
function Heatmap() {
  const weeks = 18
  const cells = []
  for (let w = 0; w < weeks; w++) {
    for (let d = 0; d < 7; d++) {
      const day = w * 7 + d
      const fromEnd = weeks * 7 - day
      const level = fromEnd <= 11 ? 1 + ((day * 7) % 3) : (day * 13) % 9 === 0 ? 1 : 0
      cells.push(<i key={day} data-level={level} />)
    }
  }
  return <div className="heat">{cells}</div>
}
