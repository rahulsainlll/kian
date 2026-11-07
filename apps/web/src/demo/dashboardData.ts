/*
 * Synthetic data for the dashboard prototype. Same people and deals as the demo morning.
 */
import type { HubData } from '@kian/hub'
import type { Activity, Approval, Room } from '@kian/ui'

export const STATS = [
  { label: 'Replies waiting', value: 3, hint: 'Oldest is 14 hours' },
  { label: 'Meetings today', value: 2, hint: 'First at 10:30' },
  { label: 'Drafts unsent', value: 4, hint: 'In Gmail, waiting on you' },
  { label: 'Approvals', value: 1, hint: 'Lumen Health, 15% off', tone: 'attention' as const },
]

export const APPROVAL: Approval = {
  id: 'a1',
  deal: 'Lumen Health · annual plan',
  ask: 'Priya asked for 15% off if they sign for a year.',
  detail: 'Margin stays above floor at 15%',
  requestedBy: 'kian',
}

export const PENDING = [
  { id: 'p1', who: 'kian-scribe', title: 'Draft to Priya: move the call to Tuesday', room: 'deal-lumen', time: '8:12', action: 'Review draft' },
  { id: 'p2', who: 'kian-scribe', title: 'Sheet: Kestrel from Discovery to Pilot', room: 'deal-kestrel', time: '8:05', action: 'Say yes' },
  { id: 'p3', who: 'kian', title: 'New sender: dana@harborfoods.example', room: 'kian-desk', time: '7:58', action: 'Add to leads' },
]

export const ACTIVITY: Activity[] = [
  { id: 'e1', actor: 'kian', text: 'asked the sales lead about a 15% discount', room: 'approvals', time: '8:14', kind: 'message' },
  { id: 'e2', actor: 'kian-scribe', text: 'drafted a reply to Priya Shah', room: 'deal-lumen', time: '8:12', kind: 'draft' },
  { id: 'e3', actor: 'kian-scribe', text: 'turned the Kestrel call into notes and next steps', room: 'deal-kestrel', time: '8:05', kind: 'task' },
  { id: 'e4', actor: 'kian', text: 'opened a room for Harbor Foods', room: 'deal-harbor', time: '7:58', kind: 'message' },
  { id: 'e5', actor: 'Ravi Kapoor', text: 'approved list price for Northwind', room: 'approvals', time: 'Yesterday', kind: 'decision' },
  { id: 'e6', actor: 'kian-studio', text: 'wrote this week’s LinkedIn post', room: 'content', time: 'Yesterday', kind: 'draft' },
]

export const ROOMS: Room[] = [
  { name: 'kian-desk', topic: 'Your morning brief', members: ['Yukti', 'kian'], unread: true, updated: '8:14' },
  { name: 'deal-lumen', topic: 'Lumen Health · annual plan', members: ['Yukti', 'kian', 'kian-scribe'], unread: true, updated: '8:12' },
  { name: 'deal-kestrel', topic: 'Kestrel Logistics · 40 seats', members: ['Yukti', 'kian', 'kian-scribe'], updated: '8:05' },
  { name: 'deal-harbor', topic: 'Harbor Foods · new', members: ['Yukti', 'kian', 'kian-scribe'], updated: '7:58' },
  { name: 'approvals', topic: 'Only the sales lead approves', members: ['Yukti', 'Ravi Kapoor', 'kian'], unread: true, updated: '8:14' },
  { name: 'content', topic: 'Posts for this week', members: ['Yukti', 'kian-studio'], updated: 'Mon' },
]

/** Everything the /dashboard page shows. */
export const HUB_DEMO: HubData = {
  greeting: 'Morning, Yukti',
  stats: [
    { n: '12', label: 'drafts written' },
    { n: '3', label: 'replies waiting' },
    { n: '11', label: 'day streak' },
  ],
  approvals: [APPROVAL],
  timeline: [
    { id: 't1', time: '9:14am', who: 'kian', text: 'Asked Ravi about 15% off for Lumen Health in #approvals.' },
    { id: 't2', time: '9:12am', who: 'kian-scribe', text: 'Drafted a reply to Priya Shah moving the call to Tuesday. Waiting in Gmail, not sent.' },
    { id: 't3', time: '9:05am', who: 'kian-scribe', text: 'Turned the Kestrel call into notes, next steps and a Sheet change for you to approve.' },
    { id: 't4', time: '8:58am', who: 'kian', text: 'Opened #deal-harbor for a new sender, dana@harborfoods.example, and asked whether to add a lead row.' },
    { id: 't5', time: '8:30am', who: 'kian', text: 'Ranked your morning: 3 replies, Rahul at 10:30 first, Northwind quiet for 6 days.' },
    { id: 't6', time: 'Yesterday', who: 'kian-studio', text: 'Wrote this week’s LinkedIn post and an X thread from your four answers.' },
  ],
  rooms: ROOMS,
  setup: [
    { label: 'Start a Switch server', done: true },
    { label: 'Connect Gmail and Calendar', done: true },
    { label: 'Import your lead sheet', done: false },
    { label: 'Bridge Telegram', done: false },
  ],
}
