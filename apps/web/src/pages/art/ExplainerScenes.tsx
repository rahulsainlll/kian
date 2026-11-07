/*
 * More slides for the product video: use cases as a bento of gradient tiles
 * (the site's Why Kian palette), the desktop app card, the Today feed with
 * Kian notifications sliding in, and the stage that frames screen
 * recordings: cream paper, a shadowed slot the footage is laid into, the
 * agents bobbing in the margins and, for the settings tour, callouts.
 * /art/x-stage?r=x,y,w,h&c=settings positions the slot and picks callouts.
 */
import { Mascot } from '@kian/ui'
import { anim, Face, MAYANK, RAHUL, Slide, TEAM, wave, YUKTI } from './Explainer'

export function XImpact() {
  return (
    <Slide kicker="Use cases and impact" title="Every team runs on hand-offs">
      <div className="x-bento">
        <article className="x-tile2 x-tile2--sales" {...anim('pop', wave(0))}>
          <h3>Sales</h3>
          <p>Discounts approved by the lead, nothing sent without a yes.</p>
          <div className="x-mini" {...anim('item', 1.2)}>
            <small>From Mayank</small>
            <b>12% off the annual plan for Avenish?</b>
            <div className="x-mini__btns">
              <span className="is-blue">Hold to approve</span>
              <span className="is-orange">refuse</span>
            </div>
          </div>
        </article>
        <article className="x-tile2 x-tile2--ops" {...anim('pop', wave(1))}>
          <h3>Operations</h3>
          <p>Reminders land on the right person’s calendar, with who asked.</p>
          <div className="x-mini x-mini--cal" {...anim('item', 1.4)}>
            <span className="x-mini__day">
              <small>FRI</small>
              <b>7</b>
            </span>
            <span>
              <b>Send the proposal</b>
              <small>5:00 PM · asked by Rahul</small>
            </span>
          </div>
          <div className="x-peek">
            <Face who={MAYANK} size={210} b={1.2} mood="look" />
          </div>
        </article>
        <article className="x-tile2 x-tile2--hire" {...anim('pop', wave(2))}>
          <h3>Hiring and partners</h3>
          <p>Updates from each owner’s agent, not a status meeting.</p>
          <div className="x-mini x-mini--upd" {...anim('item', 1.6)}>
            <Mascot size={40} shape={MAYANK.shape} color={MAYANK.color} mood="happy" />
            <span>
              <b>Mayank’s agent</b>
              <small>The Avenish email is done.</small>
            </span>
          </div>
        </article>
        <article className="x-tile2 x-tile2--found" {...anim('pop', wave(3))}>
          <h3>Founders</h3>
          <p>A team of agents keeps everyone moving while you sell.</p>
          <div className="x-tile2__cast">
            {TEAM.map((w, i) => (
              <Face key={w.name} who={w} size={92} b={0.4 + i * 0.45} />
            ))}
          </div>
        </article>
      </div>
      <div className="x-wins2">
        {['Fewer status pings', 'Every hand-off visible', 'Nothing goes out without its owner’s yes'].map((t, i) => (
          <span key={t} className={`x-win x-win--${i}`} {...anim('pop', 2.2 + i * 0.35)}>
            {t}
          </span>
        ))}
      </div>
    </Slide>
  )
}

export function XDesktop() {
  return (
    <Slide kicker="The desktop app" title="Kian lives on your desktop, on Mac and Windows">
      <article className="x-desk-card" {...anim('pop', 0.35)}>
        <div className="x-desk-card__words">
          <b {...anim('item', 0.7)}>A small flower that listens when you talk</b>
          <span {...anim('item', 0.85)}>and taps you with a card when a room needs you.</span>
          <div className="x-desk-card__dl">
            {['Mac, Apple silicon', 'Mac, Intel', 'Windows'].map((t, i) => (
              <span key={t} {...anim('pop', 1.3 + i * 0.25)}>
                {t}
              </span>
            ))}
          </div>
          <small {...anim('fade', 2.2)}>Free at kiandesk.vercel.app</small>
        </div>
        <svg className="x-desk-card__art" viewBox="0 0 400 230" aria-hidden>
          <g className="x-bob x-svgbob" style={{ ['--b' as string]: '0.8s' }}>
            <path d="M50 190 A150 150 0 0 1 350 190 Z" fill="#ff8a1f" />
            <path d="M184 112 Q196 124 208 112 M226 112 Q238 124 250 112" fill="none" stroke="#111" strokeWidth="5" strokeLinecap="round" />
          </g>
          <rect y="186" width="400" height="44" fill="#4aa3f5" />
          <rect x="96" y="112" width="104" height="72" rx="8" fill="#e9e4da" />
          <rect x="104" y="120" width="88" height="56" rx="4" fill="#20232c" />
          <rect x="80" y="182" width="136" height="8" rx="4" fill="#d9d3c7" />
          <rect x="264" y="164" width="76" height="14" rx="7" fill="#e6e2da" />
          <rect x="254" y="176" width="98" height="14" rx="7" fill="#fbf7f0" />
        </svg>
        <div className="x-desk-card__flower" {...anim('pop', 1)}>
          <div className="x-desk-card__say" {...anim('pop', 1.8)}>
            Morning, Rahul. Three things need you.
          </div>
          <Face who={RAHUL} size={86} b={0.3} />
        </div>
      </article>
    </Slide>
  )
}

const FEED = [
  { who: RAHUL, by: 'Rahul’s agent', text: 'Thanks. Rahul has been told the Avneesh email is done.', room: 'kian-team', time: '10:51' },
  { who: RAHUL, by: 'Rahul’s agent', text: 'Mayank has finished the Avneesh project email you asked him to draft.', room: 'rahul-desk', time: '10:50' },
  { who: MAYANK, by: 'Mayank’s agent', text: 'Update for Rahul: Mayank has done the Avneesh project email.', room: 'kian-team', time: '10:50' },
  { who: RAHUL, by: 'Rahul’s agent', text: 'On it. Asking Mayank’s agent to draft the reply, and Yukti’s for the case study.', room: 'rahul-desk', time: '10:46' },
  { who: YUKTI, by: 'Yukti’s agent', text: 'The pitch deck and the Atlas case study are attached.', room: 'kian-team', time: '10:45' },
]

export function XNotify() {
  return (
    <div id="art" className="x x--plain" style={{ width: 1920, height: 1080 }}>
      <div className="x-hubwin" {...anim('pop', 0.1)}>
        <aside>
          <b className="x-hubwin__logo">kian</b>
          <span className="is-on">Today</span>
          <span>Approvals</span>
          <span>Rooms</span>
        </aside>
        <main>
          <h2>Morning, Rahul</h2>
          <small>TODAY</small>
          {FEED.map((f, i) => (
            <div key={i} className="x-feed" {...anim('item', 0.4 + i * 0.12)}>
              <em>{f.time}</em>
              <Mascot size={34} shape={f.who.shape} color={f.who.color} mood="happy" />
              <p>
                <b>{f.by}</b> {f.text} <i>#{f.room}</i>
              </p>
            </div>
          ))}
        </main>
      </div>
      {[
        { at: 1.3, top: 70, who: MAYANK, title: 'Mayank’s agent · mayank-desk', body: 'Marked the Avneesh email done in Mayank’s tasks. Letting Rahul’s agent know.' },
        { at: 2.8, top: 270, who: RAHUL, title: 'Rahul’s agent · rahul-desk', body: 'Mayank has finished the Avneesh project email you asked for.' },
      ].map((n) => (
        <div key={n.at} className="x-notif" {...anim('slide', n.at, { top: n.top })}>
          <span className="x-notif__icon">
            <Mascot size={44} shape={n.who.shape} color={n.who.color} mood="happy" />
          </span>
          <span>
            <small>Kian · now</small>
            <b>{n.title}</b>
            <p>{n.body}</p>
          </span>
        </div>
      ))}
      <div className="x-notify-flower">
        <Face who={RAHUL} size={96} b={0.5} />
      </div>
    </div>
  )
}

const CALLOUTS: Record<string, { at: number; side: 'l' | 'r'; top: number; text: string }[]> = {
  settings: [
    { at: 0.5, side: 'l', top: 140, text: 'One shortcut, talk from anywhere' },
    { at: 3.2, side: 'l', top: 420, text: 'Signs in to your own Switch server' },
    { at: 5.8, side: 'r', top: 300, text: 'Wispr Flow is the default voice' },
    { at: 6.6, side: 'r', top: 520, text: 'Gmail, Calendar and Tasks, per person' },
  ],
}

export function XStage() {
  const q = new URLSearchParams(location.search)
  const [x, y, w, h] = (q.get('r') ?? '196,90,1528,900').split(',').map(Number)
  const calls = CALLOUTS[q.get('c') ?? ''] ?? []
  const gutter = x
  const size = Math.min(130, gutter - 40)
  return (
    <div id="art" className="x x--plain" style={{ width: 1920, height: 1080 }}>
      <div className="x-slot" style={{ left: x, top: y, width: w, height: h }} />
      {size > 60 && (
        <>
          <span className="x-stage-face" style={{ left: (gutter - size) / 2, top: y + h - size - 10 }}>
            <Face who={RAHUL} size={size} b={0.2} />
          </span>
          <span className="x-stage-face" style={{ left: x + w + (gutter - size) / 2, top: y + 10 }}>
            <Face who={MAYANK} size={size} b={1.1} />
          </span>
          <span className="x-stage-face" style={{ left: x + w + (gutter - size) / 2, top: y + h - size - 10 }}>
            <Face who={YUKTI} size={size} b={1.8} />
          </span>
        </>
      )}
      {calls.map((c) => (
        <div
          key={c.text}
          className={`x-callout x-callout--${c.side}`}
          {...anim('pop', c.at, { top: c.top, ...(c.side === 'l' ? { right: 1920 - x + 24 } : { left: x + w + 24 }) })}
        >
          {c.text}
        </div>
      ))}
    </div>
  )
}
