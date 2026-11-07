/*
 * What the hub shows, passed in by its host. The website fills it with the
 * demo morning; the desktop app fills it from the rooms it is signed in to.
 * The hub itself holds no data and makes no network calls.
 */
import type { Approval, Room } from '@kian/ui'
import type { ReactNode } from 'react'

export type SettingsTab = 'general' | 'agents' | 'connectors' | 'team' | 'privacy'

export interface HubTimelineItem {
  id: string
  time: string
  /** An agent name gets its character; anyone else an initial. */
  who: string
  text: string
}

export interface HubStat {
  n: string
  label: string
}

export interface HubSetupStep {
  label: string
  done: boolean
  /** The settings tab that finishes this step. */
  tab?: SettingsTab
}

export interface HubData {
  /** The big serif heading on Today, e.g. "Morning, Yukti". */
  greeting: string
  stats: HubStat[]
  approvals: Approval[]
  timeline: HubTimelineItem[]
  rooms: Room[]
  setup: HubSetupStep[]
}

export interface HubBanner {
  title: ReactNode
  text: string
  action: string
  onAction?: () => void
}

export interface HubProps {
  /** The brand mark at the top of the sidebar. */
  logo: ReactNode
  /** A small chip beside the logo: "Team", "Demo", "Switch". */
  badge?: string
  data: HubData
  /** The Today banner. Defaults to the "sound like you" prompt, which opens the Agents tab. */
  banner?: HubBanner
  /** Show the Insights view (charts over the demo data). */
  insights?: boolean
  /** The host's own rows for a settings tab, replacing the built-in ones. */
  settings?: Partial<Record<SettingsTab, ReactNode>>
  /** Open with the settings modal on this tab. */
  openSettings?: SettingsTab | null
  onApprove?: (a: Approval) => void
  onRefuse?: (a: Approval) => void
  /** Extra classes on the root, e.g. for a desktop title bar inset. */
  className?: string
}
