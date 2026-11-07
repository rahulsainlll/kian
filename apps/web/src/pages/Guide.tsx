/*
 * The /guide page: how to install the desktop app, with every screen people
 * will meet. Opens on the visitor's platform (/guide/mac or /guide/windows
 * pick one), with the download buttons above the steps.
 */
import { Nav, SiteFooter } from '../Chrome'
import { DOWNLOADS } from '../downloads'
import { GuideMac, GuideWindows } from './art/Guides'

type Platform = 'mac' | 'windows'

const guess = (): Platform => (/Win/i.test(navigator.userAgent) ? 'windows' : 'mac')

export function Guide({ platform }: { platform?: string }) {
  const current: Platform = platform === 'windows' || platform === 'mac' ? platform : guess()
  return (
    <div className="home">
      <div className="page">
        <Nav active="guide" />
      </div>
      <main className="page guide-page">
        <header className="guide-page__head">
          <p className="eyebrow">Install guide</p>
          <h1 className="block__title">Get Kian on your desk</h1>
          <div className="guide-page__tabs" role="tablist">
            <a role="tab" aria-selected={current === 'mac'} href="/guide/mac">
              macOS
            </a>
            <a role="tab" aria-selected={current === 'windows'} href="/guide/windows">
              Windows
            </a>
          </div>
          <div className="guide-page__dl">
            {current === 'mac' ? (
              <>
                <a className="dl-btn" href={DOWNLOADS.macArm}>
                  Mac, Apple silicon
                </a>
                <a className="dl-btn dl-btn--soft" href={DOWNLOADS.macIntel}>
                  Mac, Intel
                </a>
              </>
            ) : (
              <>
                <a className="dl-btn" href={DOWNLOADS.windows}>
                  Windows
                </a>
                <a className="dl-btn dl-btn--soft" href={DOWNLOADS.all}>
                  Arm and other versions
                </a>
              </>
            )}
          </div>
        </header>
        {current === 'mac' ? <GuideMac fluid /> : <GuideWindows fluid />}
      </main>
      <SiteFooter />
    </div>
  )
}
