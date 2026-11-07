/*
 * Today: the voice banner, three serif numbers, the waiting approval and the
 * TODAY list of what agents did, newest first.
 */
import { Mascot, PersonAvatar } from '@kian/ui'

// ── Today ───────────────────────────────────────────────────────────────────

const TIMELINE = [
  { time: '9:14am', who: 'kian', text: 'Asked Ravi about 15% off for Lumen Health in #approvals.' },
  { time: '9:12am', who: 'kian-scribe', text: 'Drafted a reply to Priya Shah moving the call to Tuesday. Waiting in Gmail, not sent.' },
  { time: '9:05am', who: 'kian-scribe', text: 'Turned the Kestrel call into notes, next steps and a Sheet change for you to approve.' },
  { time: '8:58am', who: 'kian', text: 'Opened #deal-harbor for a new sender, dana@harborfoods.example, and asked whether to add a lead row.' },
  { time: '8:30am', who: 'kian', text: 'Ranked your morning: 3 replies, Rahul at 10:30 first, Northwind quiet for 6 days.' },
  { time: 'Yesterday', who: 'kian-studio', text: 'Wrote this week’s LinkedIn post and an X thread from your four answers.' },
]

export function Today({ onApprovals, onVoice }: { onApprovals: () => void; onVoice: () => void }) {
  return (
    <>
      <h1 className="hub__title">Morning, Yukti</h1>
      <div className="today">
        <div className="banner">
          <div className="banner__text">
            <h2 className="banner__title">
              Make Kian sound like <em>you</em>
            </h2>
            <p>Give kian-scribe five emails you sent, and every draft starts in your voice.</p>
            <button className="cream-btn" onClick={onVoice}>
              Start now
            </button>
          </div>
          <div className="banner__art" aria-hidden>
            <span style={{ ['--x' as string]: '0px', ['--y' as string]: '18px', ['--r' as string]: '-8deg' }}>
              <Mascot size={110} shape="bubble" color="#19b86b" mood="wink" />
            </span>
            <span style={{ ['--x' as string]: '-34px', ['--y' as string]: '-8px', ['--r' as string]: '6deg' }}>
              <Mascot size={130} mood="look" />
            </span>
            <span style={{ ['--x' as string]: '-60px', ['--y' as string]: '26px', ['--r' as string]: '10deg' }}>
              <Mascot size={96} shape="sun" color="#ff8a1f" mood="happy" />
            </span>
          </div>
        </div>

        <div className="stats">
          <div className="stats__nums">
            <Num n="12" label="drafts written" />
            <Num n="3" label="replies waiting" />
            <Num n="11" label="day streak" />
          </div>
          <div className="stats__call">
            <b>1 approval waiting</b>
            <p>Lumen Health wants 15% off annual.</p>
            <button className="orange-btn" onClick={onApprovals}>
              Review approval
            </button>
          </div>
        </div>
      </div>

      <div className="hub__label">Today</div>
      <ol className="timeline">
        {TIMELINE.map((t) => (
          <li key={t.time + t.text}>
            <span className="timeline__time">{t.time}</span>
            <PersonAvatar name={t.who} size={22} />
            <span className="timeline__text">{t.text}</span>
          </li>
        ))}
      </ol>
    </>
  )
}

function Num({ n, label }: { n: string; label: string }) {
  return (
    <div className="num">
      <span className="num__n">{n}</span>
      <span className="num__label">{label}</span>
    </div>
  )
}
