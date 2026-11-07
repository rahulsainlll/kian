/*
 * The Switch slides of the product video: why Switch (the chat apps flowing
 * into one Switch hub where the agents talk), the rooms notebook opening page
 * by page, and the architecture drawn as panels with the real logos and a
 * request hopping along the lines. Laid out in fixed pixels so the hop paths
 * (CSS offset-path) land exactly on the boxes.
 */
import { Mascot, type Shape } from '@kian/ui'
import { anim, AppIcon, Brand, Face, MAYANK, RAHUL, Slide, TEAM, wave, YUKTI } from './Explainer'

const APPS = [
  { logo: 'mattermost', color: '#0058cc', name: 'Mattermost' },
  { logo: 'slack', color: '#4a154b', name: 'Slack' },
  { logo: 'microsoftteams', color: '#6264a7', name: 'Microsoft Teams' },
  { logo: 'telegram', color: '#26a5e4', name: 'Telegram' },
  { logo: 'discord', color: '#5865f2', name: 'Discord' },
]

const TAGS = [
  { title: 'Shared rooms', line: 'people and agents, with the whole history', tone: 'pink' },
  { title: 'One template', line: 'one import creates every agent and room', tone: 'yellow' },
  { title: 'Your own server', line: 'your machines, your accounts', tone: 'mint' },
  { title: 'Rules on the room', line: 'like: ask before you send', tone: 'purple' },
]

/** A line between two boxes that draws itself in, plus the dots that hop along it. */
function Line({ d, at, faint = false }: { d: string; at: number; faint?: boolean }) {
  return <path d={d} pathLength={1} className={`x-line${faint ? ' x-line--faint' : ''}`} {...anim('draw', at)} />
}
function Hop({ d, h, period, color = '#3d7bf2' }: { d: string; h: number; period: number; color?: string }) {
  return (
    <i
      className="x-hop"
      style={{ offsetPath: `path('${d}')`, ['--h' as string]: `${h}s`, ['--period' as string]: `${period}s`, ['--c' as string]: color }}
    />
  )
}

export function XWhySwitch() {
  const path = (i: number) => `M320 ${74 + i * 120} C410 ${74 + i * 120} 410 314 500 314`
  return (
    <Slide kicker="Why Switch" title="Agents need a place to meet. Switch is that place.">
      <div className="x-box" style={{ height: 620 }}>
        <svg className="x-lines" width="1728" height="620">
          {APPS.map((_, i) => (
            <Line key={i} d={path(i)} at={1 + i * 0.1} />
          ))}
        </svg>
        {APPS.map((a, i) => (
          <div key={a.name} className="x-app" {...anim('slide', wave(i, 0.4), { top: 30 + i * 120 })}>
            <Brand name={a.logo} color={a.color} size={44} />
            <b>{a.name}</b>
          </div>
        ))}
        {APPS.map((a, i) => (
          <Hop key={a.name} d={path(i)} h={1.6 + i} period={5} color={a.color} />
        ))}

        <div className="x-hub" {...anim('pop', 0.6)}>
          <div className="x-hub__head">
            <AppIcon name="switch-console" size={72} />
            <span>
              <b>Switch</b>
              <small>where people and agents meet</small>
            </span>
          </div>
          <div className="x-hub__rooms">
            {['#rahul-desk', '#mayank-desk', '#yukti-desk', '#kian-team'].map((r, i) => (
              <span key={r} {...anim('pop', 1.1 + i * 0.1)}>
                {r}
              </span>
            ))}
          </div>
          <div className="x-hub__talk">
            <div className="x-say x-say--left" {...anim('pop', 3)}>
              <b>@Mayank</b> Rahul wants an update on Avenish
            </div>
            <div className="x-say x-say--right" {...anim('pop', 4.4)}>
              Done. Telling Rahul now.
            </div>
            <div className="x-hub__agents">
              {TEAM.map((w, i) => (
                <span key={w.name} {...anim('pop', 1.5 + i * 0.12)}>
                  <Face who={w} size={84} b={0.5 + i * 0.4} />
                  <small>{w.name}</small>
                </span>
              ))}
            </div>
          </div>
        </div>

        {TAGS.map((t, i) => (
          <div key={t.title} className={`x-tag x-tag--${t.tone}`} {...anim('slide', 2 + i * 0.5, { top: 40 + i * 140 })}>
            <b>{t.title}</b>
            <small>{t.line}</small>
          </div>
        ))}
      </div>
    </Slide>
  )
}

export function XNotebook() {
  const rooms: { name: string; note: string; shape: Shape; color: string }[] = [
    { name: 'rahul-desk', note: 'Rahul and his agent', shape: 'flower', color: '#3d7bf2' },
    { name: 'mayank-desk', note: 'Mayank and his agent', shape: 'sun', color: '#ff8a1f' },
    { name: 'kian-team', note: 'Where the agents meet', shape: 'bubble', color: '#19b86b' },
  ]
  const checks = ['Brief posted', 'Discount approved', 'Deck reviewed', 'Reply to Harbor Foods', 'Pilot on every list']
  const rings = (
    <span className="nb__rings" aria-hidden>
      {Array.from({ length: 7 }, (_, i) => (
        <i key={i} />
      ))}
    </span>
  )
  return (
    <div id="art" className="x x--center" style={{ width: 1920, height: 1080 }}>
      <div className="notebook x-nb">
        <article className="nb nb--rooms" {...anim('open', 0.2)}>
          <h3 className="nb__title">
            Rooms,
            <br />
            one per person
          </h3>
          <ul className="nb__rooms">
            {rooms.map((r, i) => (
              <li key={r.name} {...anim('item', 0.8 + i * 0.15)}>
                <Mascot size={32} shape={r.shape} color={r.color} mood="happy" />
                <span>
                  <b>#{r.name}</b>
                  <small>{r.note}</small>
                </span>
              </li>
            ))}
          </ul>
          <div className="nb__tags" {...anim('fade', 1.4)}>
            <span>History is memory</span>
            <span>Decisions on record</span>
          </div>
        </article>

        <article className="nb nb--work" {...anim('open', 1.8)}>
          {rings}
          <h3 className="nb__title">
            Today’s
            <br />
            work
          </h3>
          <ul className="nb__checks">
            {checks.map((label, i) => (
              <li key={label}>
                <i>
                  <b className="x-tick" {...anim('pop', 2.6 + i * 0.45)} />
                </i>
                {label}
              </li>
            ))}
          </ul>
        </article>

        <article className="nb nb--live" {...anim('open', 3.4)}>
          {rings}
          <h3 className="nb__title">
            Agents talk
            <br />
            by name
          </h3>
          <div className="nb__chat">
            <div className="nb__msg" {...anim('pop', 4.2)}>
              <Mascot size={28} shape={RAHUL.shape} color={RAHUL.color} mood="look" />
              <span>
                <b>@Mayank</b> Rahul wants an update on Avenish.
              </span>
            </div>
            <div className="nb__msg nb__msg--right" {...anim('pop', 5.2)}>
              <span>Done. Telling Rahul now.</span>
              <Mascot size={28} shape={MAYANK.shape} color={MAYANK.color} mood="wink" />
            </div>
            <div className="nb__msg" {...anim('pop', 6.2)}>
              <i className="nb__me">R</i>
              <span>thanks</span>
            </div>
          </div>
        </article>
      </div>
    </div>
  )
}

// architecture paths, in the 1728×680 box
const P = {
  voice: 'M200 300 L200 420',
  toDesk: 'M370 505 C465 505 465 208 560 208',
  deskToRahul: 'M1040 208 C1135 208 1135 160 1230 160',
  deskToMayank: 'M1040 308 C1135 308 1135 260 1230 260',
  deskToYukti: 'M1040 408 C1135 408 1135 360 1230 360',
  rahulToTeam: 'M1230 160 C1135 160 1135 538 1040 538',
  teamToMayank: 'M1040 538 C1135 538 1135 260 1230 260',
  teamToYukti: 'M1040 538 C1135 538 1135 360 1230 360',
  toGoogle: 'M1464 400 L1464 470',
  back: 'M560 208 C465 208 465 505 370 505',
}

export function XArchitecture() {
  const rooms = ['#rahul-desk', '#mayank-desk', '#yukti-desk']
  const hops: [string, string][] = [
    [P.voice, '#3d7bf2'], [P.toDesk, '#3d7bf2'], [P.deskToRahul, '#3d7bf2'], [P.rahulToTeam, '#3d7bf2'],
    [P.teamToMayank, '#ff8a1f'], [P.toGoogle, '#ff8a1f'], [P.back, '#19b86b'],
  ]
  return (
    <Slide kicker="Architecture" title="Talk, and the right agent does the work">
      <div className="x-box" style={{ height: 680 }}>
        <div className="x-panel x-panel--desk" {...anim('pop', 0.4)}>
          <b>Your desktop</b>
          <small>Mac and Windows</small>
        </div>
        <div className="x-node2" {...anim('pop', 0.7, { top: 150 })}>
          <AppIcon name="wispr-flow" size={60} />
          <span>
            <b>Wispr Flow</b>
            <small>hold fn and talk</small>
          </span>
        </div>
        <div className="x-node2" {...anim('pop', 0.85, { top: 420 })}>
          <Face who={RAHUL} size={60} b={0.4} />
          <span>
            <b>Kian widget</b>
            <small>answers pop up as cards</small>
          </span>
        </div>

        <div className="x-panel x-panel--switch" {...anim('pop', 0.55)}>
          <div className="x-panel__head">
            <AppIcon name="switch-console" size={52} />
            <b>Switch</b>
            <span className="x-panel__mm">
              <Brand name="mattermost" color="#0058cc" size={26} /> rooms on Mattermost
            </span>
          </div>
        </div>
        {[...rooms, '#kian-team'].map((r, i) => (
          <div key={r} className={`x-room2${i === 3 ? ' x-room2--team' : ''}`} {...anim('item', 1 + i * 0.1, { top: i === 3 ? 500 : 170 + i * 100 })}>
            {r}
          </div>
        ))}

        <div className="x-panel x-panel--agents" {...anim('pop', 0.7)}>
          <div className="x-panel__head">
            <Brand name="claude" color="#d97757" size={44} />
            <b>Claude Code agents</b>
          </div>
        </div>
        {[RAHUL, MAYANK, YUKTI].map((w, i) => (
          <div key={w.name} className="x-agent2" {...anim('item', 1.1 + i * 0.1, { top: 120 + i * 100 })}>
            <Face who={w} size={52} b={0.3 + i * 0.5} />
            <b>{w.name}’s agent</b>
          </div>
        ))}

        <div className="x-panel x-panel--google" {...anim('pop', 0.85)}>
          <div className="x-google">
            <span>
              <Brand name="gmail" color="#ea4335" size={46} /> Gmail
            </span>
            <span>
              <Brand name="googlecalendar" color="#4285f4" size={46} /> Calendar
            </span>
            <span>
              <Brand name="googletasks" color="#2684fc" size={46} /> Tasks
            </span>
          </div>
          <small>each person’s own account · sends only with a yes</small>
        </div>

        <svg className="x-lines" width="1728" height="680">
          {Object.entries(P)
            .filter(([k]) => k !== 'back' && k !== 'rahulToTeam')
            .map(([k, d], i) => (
              <Line key={k} d={d} at={1.4 + i * 0.08} faint={k.startsWith('team') || k === 'deskToYukti'} />
            ))}
        </svg>
        {hops.map(([d, c], i) => (
          <Hop key={i} d={d} h={2.2 + i} period={7} color={c} />
        ))}
      </div>
    </Slide>
  )
}
