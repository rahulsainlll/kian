/*
 * The /dashboard page: the shared hub from @kian/hub on the demo morning's
 * sample data. It says so plainly, in the Today banner and a strip that
 * stays on screen, and points to the desktop app, which renders the same
 * hub on your team's live Switch rooms.
 */
import { Hub } from '@kian/hub'
import '@kian/hub/hub.css'
import { Logo } from '../Chrome'
import { HUB_DEMO } from '../demo/dashboardData'
import { useSeo } from '../seo'

export function Dashboard() {
  useSeo({
    title: 'Demo dashboard | Kian',
    description: 'Try the Kian dashboard with sample data. Download the desktop app for Mac or Windows to run it on your own team’s Switch rooms.',
    path: '/dashboard',
  })
  return (
    <>
      <Hub
        logo={
          <a href="/" aria-label="kian home">
            <Logo size={30} />
          </a>
        }
        badge="Demo"
        data={HUB_DEMO}
        insights
        banner={{
          title: (
            <>
              This is a <em>demo</em>
            </>
          ),
          text: 'Everything here is sample data, so you can click around. To work with your own team, download the Kian app for Mac or Windows and sign in to your Switch rooms.',
          action: 'Download the app',
          onAction: () => location.assign('/#download'),
        }}
      />
      <div className="demo-strip" role="note">
        <span>
          <b>This is a demo</b> with sample data.
        </span>
        <a href="/#download">Download for Mac or Windows</a>
        <a href="/guide">Install guide</a>
      </div>
    </>
  )
}
