/*
 * Everywhere you are: illustrated cards for the desktop widget and the chat
 * apps Switch bridges to. Also the #download anchor for the nav button.
 */
import { Mascot } from '@kian/ui'
import { Block } from './Block'

export function Everywhere() {
  return (
    <Block id="download" eyebrow="Everywhere you are" title="On your desk and in your pocket">
      <div className="where">
        <article className="where__card where__card--desk">
          <div className="where__words">
            <b>Mac and Windows</b>
            <span>A small widget that listens when you talk and taps you when a room needs you.</span>
            <div className="where__dl">
              <span className="where__btn">macOS</span>
              <span className="where__btn">Windows</span>
              <span className="where__soon">Builds land with v0.1</span>
            </div>
          </div>
          <svg className="where__art" viewBox="0 0 400 230" aria-hidden>
            <path d="M50 190 A150 150 0 0 1 350 190 Z" fill="#ff8a1f" />
            <path d="M184 112 Q196 124 208 112 M226 112 Q238 124 250 112" fill="none" stroke="#111" strokeWidth="5" strokeLinecap="round" />
            <circle cx="104" cy="66" r="42" fill="#fbf7f0" />
            <path d="M94 100 L88 120 L108 104 Z" fill="#fbf7f0" />
            <path d="M78 56 q8 -6 16 0 t16 0 t16 0 M78 72 q8 -6 16 0 t16 0 t16 0" fill="none" stroke="#cfc8bb" strokeWidth="4" strokeLinecap="round" />
            <rect y="186" width="400" height="44" fill="#4aa3f5" />
            <rect x="96" y="112" width="104" height="72" rx="8" fill="#e9e4da" />
            <rect x="104" y="120" width="88" height="56" rx="4" fill="#20232c" />
            <rect x="126" y="158" width="44" height="12" rx="6" fill="#3a3d47" />
            <circle cx="140" cy="164" r="3" fill="#fff" />
            <circle cx="156" cy="164" r="3.4" fill="none" stroke="#fff" strokeWidth="1.6" />
            <rect x="80" y="182" width="136" height="8" rx="4" fill="#d9d3c7" />
            <rect x="264" y="164" width="76" height="14" rx="7" fill="#e6e2da" />
            <rect x="254" y="176" width="98" height="14" rx="7" fill="#fbf7f0" />
          </svg>
        </article>

        <article className="where__card where__card--phone">
          <div className="where__words">
            <b>Your phone</b>
            <span>Check in from Telegram, Slack, Teams or Discord. Switch bridges the same rooms there.</span>
          </div>
          <div className="where__phone-art" aria-hidden>
            <span className="where__spark where__spark--a" />
            <span className="where__spark where__spark--b" />
            <span className="where__star" />
            <Mascot size={150} shape="blob" color="#ffcf1f" mood="look" />
            <svg className="where__check" viewBox="0 0 100 100">
              <path d="M18 52 L42 76 L86 20" fill="none" stroke="#ff8a1f" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="where__note">
            <span className="where__app" aria-hidden>
              <i />
              <i />
              <i />
            </span>
            <span>
              <b>kian</b> Priya replied. Your draft is ready for a yes.
            </span>
          </div>
        </article>
      </div>

      <ul className="a11y" aria-label="Accessibility">
        <li style={{ ['--c' as string]: '#3d7bf2' }}>Keyboard first</li>
        <li style={{ ['--c' as string]: '#19b86b' }}>Screen reader labels</li>
        <li style={{ ['--c' as string]: '#ff8a1f' }}>Reduced motion respected</li>
        <li style={{ ['--c' as string]: '#ff5a8a' }}>Voice on or off</li>
      </ul>
    </Block>
  )
}
