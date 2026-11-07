/*
 * How Kian uses Switch. SwitchNotebook is three ring-bound cards (rooms,
 * today's work, a live hand-off) and is reused by the blog and README art;
 * SwitchUse frames it on the home page with the other Switch features.
 */
import { Mascot, type Shape } from '@kian/ui'
import { Block } from './Block'

/** Three cards bound with rings: the rooms, today's work, and a live hand-off. */
export function SwitchNotebook() {
  return (
    <div className="notebook" aria-label="How Kian uses Switch">
      <article className="nb nb--rooms">
        <h3 className="nb__title">
          Rooms,
          <br />
          one per deal
        </h3>
        <ul className="nb__rooms">
          {[
            { name: 'Desk', note: 'Your morning', shape: 'flower', color: '#3d7bf2' },
            { name: 'Lumen Health', note: 'Annual plan', shape: 'bubble', color: '#19b86b' },
            { name: 'Approvals', note: 'Sales lead only', shape: 'blob', color: '#ffcf1f' },
          ].map((r) => (
            <li key={r.name}>
              <Mascot size={32} shape={r.shape as Shape} color={r.color} mood="happy" />
              <span>
                <b>{r.name}</b>
                <small>{r.note}</small>
              </span>
            </li>
          ))}
        </ul>
        <div className="nb__tags">
          <span>History is memory</span>
          <span>Decisions on record</span>
        </div>
      </article>

      <article className="nb nb--work">
        <span className="nb__rings" aria-hidden>
          {Array.from({ length: 7 }, (_, i) => (
            <i key={i} />
          ))}
        </span>
        <h3 className="nb__title">
          Today’s
          <br />
          work
        </h3>
        <ul className="nb__checks">
          {[
            ['Brief posted', true],
            ['Draft for Priya', true],
            ['Kestrel notes', true],
            ['Room for Harbor', false],
            ['Weekly post', false],
          ].map(([label, done]) => (
            <li key={label as string} data-done={done || undefined}>
              <i />
              {label}
            </li>
          ))}
        </ul>
      </article>

      <article className="nb nb--live">
        <span className="nb__rings" aria-hidden>
          {Array.from({ length: 7 }, (_, i) => (
            <i key={i} />
          ))}
        </span>
        <h3 className="nb__title">
          Agents talk
          <br />
          by name
        </h3>
        <div className="nb__chat">
          <div className="nb__msg">
            <Mascot size={28} mood="look" />
            <span>
              <b>@kian-scribe</b> Priya wants Tuesday. Draft it.
            </span>
          </div>
          <div className="nb__msg nb__msg--right">
            <span>Draft saved in Gmail. Not sent.</span>
            <Mascot size={28} shape="bubble" color="#19b86b" mood="wink" />
          </div>
          <div className="nb__msg">
            <i className="nb__me" aria-label="Yukti">
              Y
            </i>
            <span>yes</span>
          </div>
        </div>
      </article>
    </div>
  )
}

const MORE: { name: string; use: string; color: string }[] = [
  { name: 'Rules', use: 'Every room says it: agents draft, people send.', color: '#ff7eb0' },
  { name: 'Who can talk to whom', use: 'Only the sales lead can approve a price.', color: '#ffcf1f' },
  { name: 'Bridges', use: 'kian answers on Telegram as well as Mattermost.', color: '#7c5cff' },
  { name: 'One template', use: 'One YAML creates every agent and room.', color: '#19b86b' },
]

export function SwitchUse() {
  return (
    <Block id="switch" eyebrow="How Kian uses Switch" title="Take Switch away and there is no product left">
      <SwitchNotebook />
      <ul className="nb-more">
        {MORE.map((m) => (
          <li key={m.name} style={{ ['--c' as string]: m.color }}>
            <b>{m.name}</b>
            <span>{m.use}</span>
          </li>
        ))}
      </ul>
    </Block>
  )
}
