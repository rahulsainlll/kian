export type AgentName = 'kian' | 'kian-scribe' | 'kian-studio' | (string & {})

/** One message from a Switch room, already normalised by the rooms adapter. */
export interface RoomMessage {
  id: string
  room: string
  author: AgentName
  text: string
  /** Words the person can answer with. Each one is posted back to the room as-is. */
  chips?: Chip[]
  /** Show a mic button that lets the person answer by voice. */
  voiceReply?: boolean
  /** Link to the message (or a Gmail draft) in the real chat app. */
  link?: { label: string; href: string }
}

export interface Chip {
  label: string
  /** Text posted to the room. Defaults to the label. */
  reply?: string
  tone?: 'default' | 'primary' | 'danger'
  /** Press and hold to send. For approvals, so a stray click can't approve a price. */
  hold?: boolean
  /** The hold button's label, e.g. "Hold to approve". */
  holdLabel?: string
}

export interface Nudge {
  text: string
  action: string
  dismiss?: string
}

/**
 * What the pill itself is doing. Cards and nudges sit above it independently.
 * listening is talking to Kian; recording is capturing a meeting for kian-scribe (the ◉ button).
 */
export type VoiceState = 'idle' | 'listening' | 'recording' | 'sending' | 'sent' | 'typing'

export type Orientation = 'horizontal' | 'vertical'

export const AGENT_COLORS: Record<string, string> = {
  kian: 'var(--k-agent-kian)',
  'kian-scribe': 'var(--k-agent-scribe)',
  'kian-studio': 'var(--k-agent-studio)',
}
