/*
 * Types shared by the main process, the preload bridge and the renderer.
 * The main process turns room events into these shapes; the renderer only
 * ever sees these, never a token or a raw Mattermost payload.
 */
import type { RoomMessage } from '@kian/ui'

/** One message from a room, normalised by a rooms adapter. */
export interface RoomEvent {
  id: string
  /** The thread it belongs to, when it is a reply. */
  rootId?: string
  /** The room's name, e.g. kian-desk or deal-lumen-health. */
  room: string
  author: string
  authorIsAgent: boolean
  text: string
  at: number
  /** The message @-mentions the signed-in person. */
  mentionsMe: boolean
  permalink?: string
}

export interface RoomSummary {
  name: string
  title: string
  members: string[]
  last?: { author: string; text: string; at: number }
}

export type Connection = 'connecting' | 'online' | 'offline' | 'demo' | 'setup'

/** What the widget shows. Voice state belongs to the renderer, not here. */
export interface DeskState {
  message: RoomMessage | null
  queued: number
  pending: { author: string; room: string } | null
  connection: Connection
  deskRoom: string
}

/** Settings the hub edits. Secrets are write-only: the renderer sees only whether one is set. */
export interface Settings {
  backend: 'mock' | 'mattermost'
  url: string
  team: string
  /** Sign in with a password when set; otherwise the secret is a personal access token. */
  username: string
  /** Agent usernames whose messages can surface as cards. */
  agents: string[]
  deskRoom: string
  approvalsRoom: string
  /** This person is the sales lead: approval cards are for them. */
  approver: boolean
  hotkey: string
  speak: boolean
  sttUrl: string
  sttModel: string
  hasToken: boolean
  hasSttKey: boolean
}

export type SettingsUpdate = Partial<Omit<Settings, 'hasToken' | 'hasSttKey'>> & { token?: string; sttKey?: string }

/** The API the preload script puts on window.kian. */
export interface KianBridge {
  platform: NodeJS.Platform
  desk: {
    state(): Promise<DeskState>
    onState(fn: (s: DeskState) => void): () => void
    onHotkey(fn: () => void): () => void
    say(text: string): Promise<void>
    answer(messageId: string, reply: string): Promise<void>
    dismiss(messageId: string): Promise<void>
    transcribe(audio: ArrayBuffer, mime: string): Promise<string | null>
    setInteractive(on: boolean): void
    openHub(): void
  }
  hub: {
    settings(): Promise<Settings>
    save(update: SettingsUpdate): Promise<Settings>
    test(): Promise<{ ok: boolean; message: string }>
    rooms(): Promise<RoomSummary[]>
    feed(): Promise<RoomEvent[]>
    onFeed(fn: (e: RoomEvent) => void): () => void
  }
}
