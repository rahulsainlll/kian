/*
 * The demo morning from the hackathon plan, played without Switch running.
 * Synthetic people and companies only. Each step is something an agent posts.
 */
import type { Chip, RoomMessage } from '@kian/ui'

export interface Step {
  delay: number
  message: RoomMessage
}

const done: Chip = { label: 'done' }
const skip: Chip = { label: 'skip' }
const draft: Chip = { label: 'draft', tone: 'primary' }

let seq = 0
const msg = (m: Omit<RoomMessage, 'id'>): RoomMessage => ({ id: `m${++seq}`, ...m })

/** What the rooms already hold before the demo starts: yesterday, then the kickoff. */
export const HISTORY: { room: string; author: string; text: string; day?: 'yesterday' }[] = [
  { room: 'kian-desk', author: 'kian', text: 'Wrapped up for today: 4 follow-ups drafted, 3 approved by you and sent from Gmail.', day: 'yesterday' },
  { room: 'kian-desk', author: 'yukti', text: 'Thanks. Keep Northwind Supply on the list for tomorrow.', day: 'yesterday' },
  { room: 'deal-lumen', author: 'kian-scribe', text: 'Notes from the Lumen call are in. Next step: proposal by Friday.', day: 'yesterday' },
  { room: 'deal-kestrel', author: 'kian-scribe', text: 'Kestrel asked for a SOC 2 report. Added to the deal summary as a next step.', day: 'yesterday' },
  { room: 'approvals', author: 'Ravi Kapoor', text: 'approved', day: 'yesterday' },
  { room: 'content', author: 'kian-studio', text: 'This week’s LinkedIn post is drafted. Want to record answers for the next one?', day: 'yesterday' },
  { room: 'kian-desk', author: 'kian', text: 'Morning. Desk is ready. Say “morning, Kian” whenever you are.' },
]

export const briefSteps = (): Step[] => [
  {
    delay: 1400,
    message: msg({
      author: 'kian',
      room: 'kian-desk',
      text: 'Hey Yukti. 3 people replied overnight, and Rahul at 10:30 is your first meeting.',
      chips: [{ label: 'go', tone: 'primary' }],
    }),
  },
]

export const briefItems = (): Step[] => [
  {
    delay: 700,
    message: msg({
      author: 'kian',
      room: 'kian-desk',
      text: 'Priya Shah at Lumen Health wants to move the call to Tuesday, and asks about 15% off annual.',
      chips: [done, skip, draft],
      voiceReply: true,
    }),
  },
  {
    delay: 300,
    message: msg({
      author: 'kian',
      room: 'kian-desk',
      text: '10:30, Rahul Mehta at Kestrel Logistics. Discovery call. Notes from last time are in #deal-kestrel.',
      chips: [done, skip],
    }),
  },
  {
    delay: 300,
    message: msg({
      author: 'kian',
      room: 'kian-desk',
      text: 'Northwind Supply has been quiet for 6 days since your proposal. Want a nudge drafted?',
      chips: [done, skip, draft],
    }),
  },
]

export const draftSteps = (): Step[] => [
  {
    delay: 600,
    message: msg({
      author: 'kian',
      room: 'kian-desk',
      text: '@kian-scribe Priya wants Tuesday. Draft it in #deal-lumen.',
    }),
  },
  {
    delay: 1800,
    message: msg({
      author: 'kian-scribe',
      room: 'deal-lumen',
      text: 'Draft is in Gmail. It moves the call to Tuesday at 3 PM and holds the price until #approvals decides. Not sent.',
      chips: [{ label: 'yes', tone: 'primary' }],
      voiceReply: true,
      link: { label: 'Open draft', href: '#draft' },
    }),
  },
  {
    delay: 1200,
    message: msg({
      author: 'kian',
      room: 'approvals',
      text: 'Lumen Health wants 15% off annual. Margin stays above floor. Approve?',
      chips: [
        { label: 'approved', tone: 'primary', hold: true, holdLabel: 'Hold to approve' },
        { label: 'refused', tone: 'danger' },
      ],
    }),
  },
]

export const approvedSteps = (decision: string): Step[] => [
  {
    delay: 1500,
    message: msg({
      author: 'kian-scribe',
      room: 'deal-lumen',
      text:
        decision === 'approved'
          ? 'Decision recorded: 15% off annual, approved by the sales lead. The price is in the draft. Still unsent, your call.'
          : 'Decision recorded: no discount. The draft keeps list price. Still unsent, your call.',
      chips: [done],
      link: { label: 'Open draft', href: '#draft' },
    }),
  },
]

export const meetingSteps = (seconds: number): Step[] => [
  {
    delay: 2200,
    message: msg({
      author: 'kian-scribe',
      room: 'deal-kestrel',
      text: `Notes from the ${Math.max(1, Math.round(seconds / 60))} min call. Decided: a pilot across 2 depots. Concern: onboarding time. Next: SOC 2 report by Friday, pricing for 40 seats by Monday. Move the Sheet from Discovery to Pilot?`,
      chips: [{ label: 'yes', tone: 'primary' }, skip],
      voiceReply: true,
    }),
  },
]

export const genericReply = (text: string): Step[] => [
  {
    delay: 1400,
    message: msg({
      author: 'kian',
      room: 'kian-desk',
      text: `Got it: “${text}”. I’ll take it from here and check with you before anything goes out.`,
      chips: [done],
    }),
  },
]
