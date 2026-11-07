/*
 * The /dashboard page: the shared hub from @kian/hub on the demo morning's
 * data. The desktop app renders the same hub on live rooms.
 */
import { Hub } from '@kian/hub'
import '@kian/hub/hub.css'
import { Logo } from '../Chrome'
import { HUB_DEMO } from '../demo/dashboardData'

export function Dashboard() {
  return (
    <Hub
      logo={
        <a href="/" aria-label="kian home">
          <Logo size={30} />
        </a>
      }
      badge="Team"
      data={HUB_DEMO}
      insights
    />
  )
}
