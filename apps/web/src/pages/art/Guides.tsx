/*
 * Install guides as shareable images, one per platform, in the OG card's
 * style: the logo, a short title, then numbered steps that each show the
 * exact screen people will see (drawn here, not screenshotted), ending with
 * the real widget. Rendered by scripts/render-art.sh from /art/guide-mac and
 * /art/guide-windows, and shown fluid (responsive) on the site's /guide page.
 */
import { KianWidget, Logo, Mascot } from '@kian/ui'
import type { ReactNode } from 'react'
import './guides.css'
import './guide-screens.css'

function Step({ n, title, line, children }: { n: number; title: string; line: ReactNode; children: ReactNode }) {
  return (
    <section className="g-step">
      <div className="g-step__head">
        <span className="g-step__n">{n}</span>
        <div>
          <b>{title}</b>
          <p>{line}</p>
        </div>
      </div>
      <div className="g-step__shot">{children}</div>
    </section>
  )
}

interface GuideProps {
  platform: string
  title: string
  sub: string
  children: ReactNode
  foot: ReactNode
  /** On the /guide page: no fixed size, one column on phones. */
  fluid?: boolean
}

function Guide({ platform, title, sub, children, foot, fluid }: GuideProps) {
  return (
    <div
      id={fluid ? undefined : 'art'}
      className={`guide${fluid ? ' guide--fluid' : ''}`}
      style={fluid ? undefined : { width: 1200, height: 1560 }}
    >
      <header className="guide__head">
        <Logo size={64} />
        <span className="guide__chip">{platform}</span>
      </header>
      <h1 className="guide__title">{title}</h1>
      <p className="guide__sub">{sub}</p>
      <div className="guide__steps">{children}</div>
      <footer className="guide__foot">
        <Mascot size={44} mood="happy" />
        <div>{foot}</div>
      </footer>
    </div>
  )
}

const Talk = ({ keys }: { keys: string }) => (
  <div className="g-widget">
    <KianWidget
      keyboard={false}
      voiceState="idle"
      hint={
        <>
          Talk <b>{keys}</b>
        </>
      }
    />
  </div>
)

export function GuideMac({ fluid }: { fluid?: boolean }) {
  return (
    <Guide
      fluid={fluid}
      platform="macOS"
      title="Install Kian on your Mac"
      sub="About a minute. Step 4 happens only once, because Kian isn’t from the App Store yet."
      foot={
        <>
          <b>Saw “Kian is damaged”?</b> That was the first build. Download again, or run{' '}
          <code>xattr -cr /Applications/Kian.app</code> in Terminal.
        </>
      }
    >
      <Step n={1} title="Download" line="kiandesk.vercel.app/guide, or the Download button, then your Mac’s file.">
        <div className="g-buttons">
          <span className="g-pill g-pill--on">Mac, Apple silicon</span>
          <span className="g-pill">Mac, Intel</span>
        </div>
        <p className="g-hint">Not sure? Apple menu → About This Mac. “Apple M…” means Apple silicon.</p>
      </Step>

      <Step n={2} title="Drag Kian to Applications" line="Open the downloaded dmg and drop the flower on the folder.">
        <div className="g-window g-dmg">
          <div className="g-window__bar">
            <i /> <i /> <i />
          </div>
          <div className="g-dmg__body">
            <div className="g-dmg__app">
              <span className="g-appicon">
                <Mascot size={52} mood="happy" />
              </span>
              Kian
            </div>
            <span className="g-arrow">→</span>
            <div className="g-dmg__app">
              <span className="g-folder" />
              Applications
            </div>
          </div>
        </div>
      </Step>

      <Step n={3} title="Open Kian, then click Done" line="macOS can’t check apps from outside the App Store yet.">
        <div className="g-alert">
          <span className="g-appicon g-appicon--small">
            <Mascot size={30} mood="surprised" />
          </span>
          <b>“Kian” Not Opened</b>
          <p>Apple could not verify “Kian” is free of malware that may harm your Mac.</p>
          <span className="g-btn g-btn--on">Done</span>
          <span className="g-btn">Move to Bin</span>
        </div>
      </Step>

      <Step n={4} title="Open Anyway" line="Right after step 3: System Settings → Privacy & Security, scroll to Security at the bottom.">
        <div className="g-window g-settings">
          <div className="g-settings__side">
            <span>Notifications</span>
            <span>Focus</span>
            <span className="is-on">Privacy & Security</span>
            <span>Desktop & Dock</span>
          </div>
          <div className="g-settings__main">
            <small>Security</small>
            <div className="g-settings__row">
              <p>“Kian” was blocked to protect your Mac.</p>
              <span className="g-btn g-btn--on">Open Anyway</span>
            </div>
          </div>
        </div>
        <p className="g-hint">No button? Open Kian once more, then look again. On macOS 14 or older: right-click Kian, choose Open.</p>
      </Step>

      <Step n={5} title="Say “morning, Kian”" line="The flower is in your menu bar. Hover the line at the bottom of the screen, or press ⌘⇧K.">
        <Talk keys="⌘⇧K" />
      </Step>
    </Guide>
  )
}

export function GuideWindows({ fluid }: { fluid?: boolean }) {
  return (
    <Guide
      fluid={fluid}
      platform="Windows"
      title="Install Kian on Windows"
      sub="About a minute. Step 3 happens only once, because Kian isn’t signed yet."
      foot={
        <>
          <b>On an Arm laptop</b> (Surface Pro X, Snapdragon)? Get <code>Kian-Setup-arm64.exe</code> from
          github.com/rahulsainlll/kian/releases.
        </>
      }
    >
      <Step n={1} title="Download" line="kiandesk.vercel.app/guide, or the Download button, then Windows.">
        <div className="g-buttons">
          <span className="g-pill g-pill--on">Windows</span>
        </div>
        <p className="g-hint">You get Kian-Setup-x64.exe.</p>
      </Step>

      <Step n={2} title="Keep the file" line="If the browser warns you: ⋯ → Keep → Show more → Keep anyway.">
        <div className="g-edge">
          <b>Downloads</b>
          <div className="g-edge__row">
            <span className="g-file">exe</span>
            <p>Kian-Setup-x64.exe isn’t commonly downloaded. Make sure you trust it before you open it.</p>
          </div>
          <div className="g-edge__actions">
            <span className="g-btn g-btn--on">Keep</span>
            <span className="g-btn">Delete</span>
          </div>
        </div>
      </Step>

      <Step n={3} title="More info, then Run anyway" line="SmartScreen hasn’t seen Kian before. It installs by itself after this.">
        <div className="g-smart">
          <b>Windows protected your PC</b>
          <p>Microsoft Defender SmartScreen prevented an unrecognised app from starting.</p>
          <u>More info</u>
          <div className="g-smart__actions">
            <span className="g-btn g-btn--win">Run anyway</span>
            <span className="g-btn g-btn--win-ghost">Don’t run</span>
          </div>
        </div>
      </Step>

      <Step n={4} title="Find the flower" line="By the clock. If it’s hidden, click ^ to see more icons.">
        <div className="g-tray">
          <span className="g-tray__up">^</span>
          <span className="g-tray__icon g-tray__icon--on">
            <Mascot size={22} mood="happy" />
          </span>
          <span className="g-tray__icon">◔</span>
          <span className="g-tray__icon">◖</span>
          <span className="g-tray__clock">9:00</span>
        </div>
      </Step>

      <Step n={5} title="Say “morning, Kian”" line="Hover the line at the bottom of the screen, or press Ctrl+Shift+K.">
        <Talk keys="Ctrl+Shift+K" />
      </Step>
    </Guide>
  )
}
