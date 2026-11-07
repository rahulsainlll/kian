/*
 * Today: the banner, a row of serif numbers, the approval waiting for the
 * sales lead, and the TODAY list of what agents did, newest first.
 */
import { Mascot, PersonAvatar } from '@kian/ui'
import type { HubBanner, HubData } from './types'

export function Today({ data, banner, onApprovals, onVoice }: { data: HubData; banner?: HubBanner; onApprovals: () => void; onVoice: () => void }) {
  const waiting = data.approvals[0]
  const b: HubBanner = banner ?? {
    title: (
      <>
        Make Kian sound like <em>you</em>
      </>
    ),
    text: 'Give kian-scribe five emails you sent, and every draft starts in your voice.',
    action: 'Start now',
  }
  return (
    <>
      <h1 className="hub__title">{data.greeting}</h1>
      <div className="today">
        <div className="banner">
          <div className="banner__text">
            <h2 className="banner__title">{b.title}</h2>
            <p>{b.text}</p>
            <button className="cream-btn" onClick={b.onAction ?? onVoice}>
              {b.action}
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
            {data.stats.map((s) => (
              <Num key={s.label} n={s.n} label={s.label} />
            ))}
          </div>
          <div className="stats__call">
            {waiting ? (
              <>
                <b>
                  {data.approvals.length} approval{data.approvals.length === 1 ? '' : 's'} waiting
                </b>
                <p>{waiting.ask}</p>
                <button className="orange-btn" onClick={onApprovals}>
                  Review approval
                </button>
              </>
            ) : (
              <>
                <b>Nothing waiting on you</b>
                <p>Approvals for the sales lead show up here.</p>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="hub__label">Today</div>
      {data.timeline.length ? (
        <ol className="timeline">
          {data.timeline.map((t) => (
            <li key={t.id}>
              <span className="timeline__time">{t.time}</span>
              <PersonAvatar name={t.who} size={22} />
              <span className="timeline__text">{t.text}</span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="hub__sub">Nothing yet today. Say “morning” to kian and the brief starts here.</p>
      )}
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
