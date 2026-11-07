/*
 * Sample room messages for the specimens, one per card kind, plus the
 * option lists the specimen controls switch between.
 */
import { type RoomMessage } from '@kian/ui'

export const SAMPLES: Record<string, RoomMessage> = {
  brief: {
    id: 's1',
    author: 'kian',
    room: 'kian-desk',
    text: 'Priya Shah, Lumen Health, replied: can the call move to Tuesday? She also asks about 15% off annual.',
    chips: [{ label: 'done' }, { label: 'skip' }, { label: 'draft', tone: 'primary' }],
    voiceReply: true,
  },
  draft: {
    id: 's2',
    author: 'kian-scribe',
    room: 'deal-lumen',
    text: 'Draft is in Gmail: moves the call to Tue 3 PM and holds the price until #approvals decides. Not sent.',
    chips: [{ label: 'yes', tone: 'primary' }],
    voiceReply: true,
    link: { label: 'Open draft', href: '#draft' },
  },
  approval: {
    id: 's3',
    author: 'kian',
    room: 'approvals',
    text: 'Lumen Health wants 15% off annual. Margin stays above floor. Approve?',
    chips: [
      { label: 'approved', tone: 'primary', hold: true, holdLabel: 'Hold to approve' },
      { label: 'refused', tone: 'danger' },
    ],
  },
  content: {
    id: 's4',
    author: 'kian-studio',
    room: 'content',
    text: 'Question 2 of 4: what did a customer say this week that surprised you?',
    voiceReply: true,
  },
  long: {
    id: 's5',
    author: 'kian-scribe',
    room: 'deal-kestrel-logistics-international-holdings',
    text:
      'Notes from the 47 min call. Summary: Kestrel wants a pilot across two depots before committing to 40 seats, and procurement joins next week. Decided: a 6 week pilot for 2 depots starting 1 December. Concerns: onboarding for night shift drivers, SSO through their own identity provider, and keeping data in region. Next: SOC 2 report by Friday, pricing for 40 seats by Monday, intro to their IT lead on Tuesday. Move the Sheet from Discovery to Pilot?',
    chips: [{ label: 'yes', tone: 'primary' }, { label: 'skip' }],
    voiceReply: true,
  },
}

/** The kit's Segmented takes {value, label} options. */
export const opts = <T extends string>(values: readonly T[]) => values.map((v) => ({ value: v, label: v }))

export const PILL_STATES = ['idle', 'listening', 'recording', 'sending', 'sent'] as const
export const CARD_KINDS = ['brief', 'draft', 'approval', 'content', 'long', 'loading'] as const
