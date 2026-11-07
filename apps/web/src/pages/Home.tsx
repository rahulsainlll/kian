/*
 * The home page: the hero with the self-playing demo (autoplay until the
 * visitor touches it), then the sections from pages/home/ in story order.
 */
import { useState, type ReactNode } from 'react'
import { Button, Toggle } from '@kian/designs'
import { KianWidget, Mascot } from '@kian/ui'
import { Nav, SiteFooter } from '../Chrome'
import { ChatApp, Phone } from '../demo/ChatApp'
import { useAutoplay } from '../demo/useAutoplay'
import { useDemoDesk } from '../demo/useDemoDesk'
import { useOnScreen } from '../scenes/useScene'
import { Cast } from './home/Cast'
import { Everywhere } from './home/Everywhere'
import { Faq } from './home/Faq'
import { Story } from './home/Story'
import { SwitchUse } from './home/SwitchUse'
import { WhyKian } from './home/WhyKian'

export function Home() {
  return (
    <div className="home">
      <div className="sunrise">
        <div className="page">
          <Nav active="home" />
          <Hero />
        </div>
      </div>

      <main className="page">
        <WhyKian />
        <Cast />
        <Story />
        <SwitchUse />
        <Everywhere />
        <Faq />
      </main>

      <SiteFooter />
    </div>
  )
}

function Hero() {
  const [voiceOut, setVoiceOut] = useState(false)
  const [auto, setAuto] = useState(true)
  const desk = useDemoDesk({ voiceOut, simulateMic: false })
  const { ref: deskRef, inView } = useOnScreen<HTMLDivElement>(0.3)
  // plays the morning by itself while on screen; any click inside hands over to the visitor
  useAutoplay(desk, auto && inView)

  return (
    <header className="hero">
      <div className="hero__copy">
        <span className="hero__badge">
          <span className="hero__badge-dot" aria-hidden />
          Built on Switch · Flip the Switch hackathon
        </span>
        <h1 className="hero__title">
          Meet <Mascot /> Kian
        </h1>
        <p className="hero__lede">
          A sales desk run by agents in your team’s Switch rooms. They read the inbox, draft follow-ups and keep the
          lead list current. You just say yes.
        </p>
        <div className="hero__cta">
          <a className="dl-btn" href="#download">
            <AppleGlyph />
            Download for macOS
          </a>
          <a className="dl-btn dl-btn--soft" href="#download">
            <WindowsGlyph />
            Windows
          </a>
        </div>
        <a className="hero__try" href="#demo" onClick={(e) => { e.preventDefault(); document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth', block: 'center' }) }}>
          or try it right here
        </a>
      </div>

      <section className="demo" id="demo" aria-label="Live demo">
        <div className="desk" ref={deskRef} onPointerDown={() => setAuto(false)}>
          <MenuBar />
          <div className="demo__stage">
            <ChatApp log={desk.log} onAnswer={desk.answer} />
            <Phone log={desk.log} />
            <div className="demo__widget">
              <KianWidget {...desk.widget} />
            </div>
          </div>
        </div>
        <div className="demo__controls">
          <p className="demo__hint">
            {auto ? (
              <>
                Playing a morning on its own. <b>Click anything</b> to take over.
              </>
            ) : (
              <>
                Tap <b>morning, Kian</b>, then answer with the buttons or <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd>.
              </>
            )}
          </p>
          <div className="demo__toggles">
            <LabeledToggle on={auto} onChange={setAuto}>
              Autoplay
            </LabeledToggle>
            <LabeledToggle on={voiceOut} onChange={setVoiceOut}>
              Read aloud
            </LabeledToggle>
            <Button size="sm" variant="secondary" onClick={desk.openTyping}>
              Type instead
            </Button>
            <Button size="sm" variant="ghost" onClick={desk.reset}>
              Reset
            </Button>
          </div>
        </div>
      </section>
    </header>
  )
}

function AppleGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M11.18 8.5c-.02-1.6 1.31-2.37 1.37-2.41-.75-1.09-1.91-1.24-2.32-1.26-.99-.1-1.93.58-2.43.58-.5 0-1.27-.57-2.09-.55A3.1 3.1 0 0 0 3.1 6.45c-1.12 1.94-.29 4.81.8 6.39.53.77 1.17 1.64 2 1.61.8-.03 1.11-.52 2.08-.52.97 0 1.24.52 2.09.5.86-.01 1.41-.78 1.94-1.55.61-.89.86-1.76.88-1.8-.02-.01-1.69-.65-1.71-2.58ZM9.6 3.8c.44-.54.74-1.28.66-2.03-.64.03-1.41.43-1.87.96-.41.47-.77 1.23-.67 1.96.71.05 1.44-.36 1.88-.89Z" />
    </svg>
  )
}

function WindowsGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M1 2.6 6.7 1.8v5.6H1V2.6Zm6.4-.9L15 .6v6.8H7.4V1.7ZM1 8.1h5.7v5.6L1 12.9V8.1Zm6.4 0H15v6.8l-7.6-1.1V8.1Z" />
    </svg>
  )
}

/** A macOS menu bar, simplified: Kian's flower sits among the status icons. */
function MenuBar() {
  return (
    <div className="menubar" aria-hidden>
      <span className="menubar__app">Kian</span>
      <span className="menubar__item">File</span>
      <span className="menubar__item">Edit</span>
      <span className="menubar__item">View</span>
      <span className="menubar__spacer" />
      <Mascot size={16} mood="happy" />
      <span className="menubar__item">Fri 7 Nov</span>
      <span className="menubar__item">9:00</span>
    </div>
  )
}

export function LabeledToggle({ on, onChange, children }: { on: boolean; onChange: (v: boolean) => void; children: ReactNode }) {
  return (
    <label className="labeled-toggle">
      <Toggle checked={on} onCheckedChange={onChange} />
      <span>{children}</span>
    </label>
  )
}
