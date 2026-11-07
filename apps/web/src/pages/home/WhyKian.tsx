/*
 * Why Kian: a bento of five reasons, each with one small visual.
 */
import { Mascot, type Shape } from '@kian/ui'
import { useReveal } from '../../scenes/useScene'

export function WhyKian() {
  const ref = useReveal<HTMLElement>()
  return (
    <section className="why reveal" id="why" ref={ref}>
      <h2 className="why__title">
        Why{' '}
        <br />
        Kian
      </h2>

      <article className="why__tile why__tile--chat">
        <h3>Easy as chat</h3>
        <div className="why__app" aria-hidden>
          <div className="why__search">Search</div>
          {[
            { name: 'Desk', note: 'Morning! 3 replies need you.', time: '9:00', shape: 'flower', color: '#3d7bf2', dot: true },
            { name: 'Lumen Health', note: 'Draft is ready. Not sent.', time: '9:02', shape: 'bubble', color: '#19b86b' },
            { name: 'Approvals', note: '15% off annual. Approve?', time: '9:04', shape: 'blob', color: '#ff8a1f' },
          ].map((r) => (
            <div className="why__row" key={r.name}>
              <Mascot size={30} shape={r.shape as Shape} color={r.color} mood="happy" />
              <span>
                <b>{r.name}</b>
                <small>{r.note}</small>
              </span>
              <em>{r.time}</em>
              {r.dot && <i className="why__dot" />}
            </div>
          ))}
        </div>
      </article>

      <article className="why__tile why__tile--always">
        <h3>On at 9:00, quiet after</h3>
        <div className="why__ring" aria-hidden>
          <span className="why__pill">
            <b>9:00</b>
            <small>your brief</small>
            <Mascot size={44} mood="look" />
          </span>
        </div>
      </article>

      <article className="why__tile why__tile--draft">
        <h3>Drafts, never sends</h3>
        <div className="why__card" aria-hidden>
          <div className="why__card-top">
            <b>Gmail draft</b>
            <span>Not sent</span>
          </div>
          <p>Re: Moving our call to Tuesday</p>
          <div className="why__card-art">
            <Mascot size={70} shape="bubble" color="#ff4f8b" mood="wink" />
          </div>
          <div className="why__card-btns">
            <span className="why__btn why__btn--dark">Say yes</span>
            <span className="why__btn">Open draft</span>
          </div>
        </div>
      </article>

      <article className="why__tile why__tile--work">
        <h3>Finishes the busywork</h3>
        <ul>
          <li>Ranks your morning across inbox and calendar</li>
          <li>Writes follow-ups in your voice</li>
          <li>Keeps the lead list current, after a yes</li>
        </ul>
        <div className="why__peek" aria-hidden>
          <Mascot size={260} shape="sun" color="#ff8a1f" mood="look" />
        </div>
      </article>

      <article className="why__tile why__tile--share">
        <h3>One file, the whole team</h3>
        <div className="why__invite" aria-hidden>
          <div className="why__invite-art">
            <Mascot size={96} shape="flower" color="#b07cff" mood="happy" />
          </div>
          <b>Yukti shared the Kian desk with Ravi</b>
          <small>Three agents, their rooms and the rules, from one template.</small>
        </div>
      </article>
    </section>
  )
}
