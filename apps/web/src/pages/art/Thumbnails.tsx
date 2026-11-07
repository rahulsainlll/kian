/*
 * Two YouTube thumbnails for the product video, 1280×720, at /art/yt-1 and
 * /art/yt-2. Big words, the three agents large enough to read on a phone,
 * and the Switch, Wispr Flow and Claude marks as proof.
 */
import { Logo, Mascot } from '@kian/ui'
import { AppIcon, Brand } from './Explainer'
import './thumbnails.css'

function Proof() {
  return (
    <div className="yt__proof">
      <span>
        <AppIcon name="switch-console" size={40} /> Switch
      </span>
      <span>
        <AppIcon name="wispr-flow" size={40} /> Wispr Flow
      </span>
      <span>
        <Brand name="claude" color="#d97757" size={34} /> Claude
      </span>
    </div>
  )
}

/** Bright: the promise in big type, the three agents talking. */
export function Yt1() {
  return (
    <div id="art" className="yt yt--one" style={{ width: 1280, height: 720 }}>
      <div className="yt__words">
        <Logo size={56} />
        <h1>
          An AI agent
          <br />
          for <em>everyone</em>
          <br />
          on your team
        </h1>
        <Proof />
      </div>
      <div className="yt__cast">
        <div className="yt__say yt__say--a">@Mayank, update?</div>
        <div className="yt__say yt__say--b">Done ✓</div>
        <span className="yt__m yt__m--1">
          <Mascot size={200} mood="look" />
        </span>
        <span className="yt__m yt__m--2">
          <Mascot size={210} shape="sun" color="#ff8a1f" mood="happy" />
        </span>
        <span className="yt__m yt__m--3">
          <Mascot size={180} shape="bubble" color="#19b86b" mood="wink" />
        </span>
      </div>
    </div>
  )
}

/** Dark: the hook as a question, the agents in a row passing the work. */
export function Yt2() {
  return (
    <div id="art" className="yt yt--two" style={{ width: 1280, height: 720 }}>
      <h1>
        My AI agents
        <br />
        work as a <mark>team</mark>
      </h1>
      <div className="yt__row">
        <Mascot size={200} mood="look" />
        <i>→</i>
        <Mascot size={210} shape="sun" color="#ff8a1f" mood="happy" />
        <i>→</i>
        <Mascot size={190} shape="bubble" color="#19b86b" mood="wink" />
      </div>
      <div className="yt__notif">
        <Mascot size={44} shape="sun" color="#ff8a1f" mood="happy" />
        <span>
          <b>Mayank’s agent</b> Done. Telling Rahul now.
        </span>
      </div>
      <div className="yt__corner">
        <Logo size={44} />
        <span>built on Switch</span>
      </div>
    </div>
  )
}
