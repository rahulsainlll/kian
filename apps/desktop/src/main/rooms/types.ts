/*
 * The rooms interface. The desk talks to Switch rooms only through this, so
 * the same app runs on the real Mattermost (mattermost.ts) or on a scripted
 * morning with no server at all (mock.ts).
 */
import type { RoomEvent, RoomSummary } from '../../shared/types'

export interface Rooms {
  readonly kind: 'mock' | 'mattermost'
  /** Sign in and start listening. Resolves with who we are. */
  connect(): Promise<{ username: string }>
  /** Every new message in a room the person is in. Returns an unsubscribe. */
  onMessage(fn: (event: RoomEvent) => void): () => void
  /** Fires when the live connection drops or comes back. */
  onStatus(fn: (online: boolean) => void): () => void
  /** Post as the person. A rootId makes it a reply in that thread. */
  post(room: string, text: string, opts?: { rootId?: string }): Promise<void>
  rooms(): Promise<RoomSummary[]>
  /** Recent messages across the person's rooms, newest last. */
  recent(limit?: number): Promise<RoomEvent[]>
  close(): void
}
