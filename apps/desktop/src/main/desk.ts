/*
 * The desk decides what reaches the widget. A room message becomes a card
 * when an agent wrote it in the person's own desk room, or anywhere with an
 * answer line or a mention of the person. Switch's progress notes never do. Approval cards (a hold answer in the approvals room) are only
 * for the sales lead. One card shows at a time; the rest wait in a queue.
 *
 * Answers are posted back as replies in the message's thread, exactly what
 * typing them in Mattermost would do. The desk keeps nothing else.
 */
import type { RoomMessage } from '@kian/ui'
import { parseAnswers } from '../shared/answers'
import type { Connection, DeskState, RoomEvent, Settings } from '../shared/types'
import type { Rooms } from './rooms/types'
import { Walkthrough } from './walkthrough'

const PENDING_TIMEOUT_MS = 25_000
/** Switch's own progress notes ("Working… 20s", "Queued…"), never cards. */
const STATUS = /^(\*\*)?(working|worked for|queued|starting a session|connecting here|joining here|note: (i took|joining))/i
const DRAFT_LINK = /https:\/\/mail\.google\.com\/\S+/

export class Desk {
  private queue: { event: RoomEvent; message: RoomMessage }[] = []
  private pending: DeskState['pending'] = null
  private pendingTimer: NodeJS.Timeout | null = null
  private connection: Connection = 'connecting'
  private snoozedUntil = 0
  private feed: RoomEvent[] = []
  private me = ''
  /** Called for every new card, e.g. to raise a system notification. */
  onCard?: (message: RoomMessage) => void
  /** The scripted morning for recording demos; its cards never post to rooms. */
  readonly walkthrough = new Walkthrough((e) => this.consider(e), () => this.settings().deskRoom)

  constructor(
    private rooms: Rooms,
    private settings: () => Settings,
    private onChange: (state: DeskState) => void,
    private onEvent: (event: RoomEvent) => void,
  ) {
    rooms.onMessage((e) => this.consider(e))
    rooms.onStatus((online) => this.setConnection(online ? (rooms.kind === 'mock' ? 'demo' : 'online') : 'offline'))
  }

  state(): DeskState {
    const head = Date.now() < this.snoozedUntil ? null : this.queue[0]
    const s = this.settings()
    return {
      message: head?.message ?? null,
      queued: Math.max(0, this.queue.length - 1),
      pending: head ? null : this.pending,
      connection: this.connection,
      deskRoom: s.deskRoom,
      me: this.me,
      position: s.position,
      sounds: s.sounds,
      speak: s.speak,
      hotkey: s.hotkey,
    }
  }

  setMe(username: string) {
    this.me = username
    this.emit()
  }

  /** Settings changed: the widget re-reads position, sounds and the hotkey. */
  refresh() {
    this.emit()
  }

  history(): RoomEvent[] {
    return this.feed
  }

  setConnection(c: Connection) {
    this.connection = c
    this.emit()
  }

  /** The person said something to the desk (by voice or typing). */
  async say(text: string) {
    const room = this.settings().deskRoom
    const agent = this.settings().agents[0] ?? 'kian'
    await this.rooms.post(room, this.addressed(text, agent))
    this.setPending({ author: agent, room })
  }

  /**
   * Switch agents act on messages that @-mention them. In real rooms, address
   * the agent unless the person already named one; the demo rooms don't need it.
   */
  private addressed(text: string, agent: string) {
    if (this.rooms.kind !== 'mattermost' || /(^|\s)@[\w.-]+/.test(text)) return text
    return `@${agent} ${text}`
  }

  async answer(messageId: string, reply: string) {
    if (this.walkthrough.owns(messageId)) {
      this.drop(messageId)
      return this.walkthrough.answer(messageId, reply)
    }
    // A card in the queue, or any message in the feed (the hub answers approvals too).
    const event = this.queue.find((q) => q.message.id === messageId)?.event ?? this.feed.find((e) => e.id === messageId)
    if (!event) return
    this.drop(messageId)
    const to = event.authorIsAgent ? event.author : (this.settings().agents[0] ?? 'kian')
    await this.rooms.post(event.room, this.addressed(reply, to), { rootId: event.rootId ?? event.id })
  }

  dismiss(messageId: string) {
    this.drop(messageId)
  }

  snooze(minutes: number) {
    this.snoozedUntil = Date.now() + minutes * 60_000
    setTimeout(() => this.emit(), minutes * 60_000 + 50)
    this.emit()
  }

  private consider(event: RoomEvent) {
    this.feed = [...this.feed.slice(-199), event]
    this.onEvent(event)
    if (!event.authorIsAgent || STATUS.test(event.text.trim())) return
    if (this.pending && event.room === this.pending.room) this.setPending(null)

    const { body, chips } = parseAnswers(event.text)
    const isApproval = event.room === this.settings().approvalsRoom && chips.some((c) => c.hold)
    // In the demo you play both the rep and the sales lead.
    if (isApproval && !this.settings().approver && this.rooms.kind !== 'mock') return
    // Your own desk is your agent talking to you: every message there is a card.
    const inDesk = event.room === this.settings().deskRoom
    if (!chips.length && !event.mentionsMe && !inDesk) return

    const draft = DRAFT_LINK.exec(body)?.[0]
    const message: RoomMessage = {
      id: event.id,
      room: event.room,
      author: event.author,
      text: body.replace(DRAFT_LINK, '').replace(/\s+:\s*$/, '').trim(),
      chips,
      voiceReply: chips.length > 0,
      link: draft
        ? { label: 'Open draft in Gmail', href: draft }
        : event.permalink
          ? { label: 'Open in Mattermost', href: event.permalink }
          : undefined,
    }
    this.queue.push({ event, message })
    console.log(`[kian] card from ${event.author} in #${event.room}: ${message.text.slice(0, 80)}`)
    this.onCard?.(message)
    this.emit()
  }

  private drop(id: string) {
    this.queue = this.queue.filter((q) => q.message.id !== id)
    this.emit()
  }

  private setPending(p: DeskState['pending']) {
    this.pending = p
    if (this.pendingTimer) clearTimeout(this.pendingTimer)
    this.pendingTimer = p ? setTimeout(() => this.setPending(null), PENDING_TIMEOUT_MS) : null
    this.emit()
  }

  private emit() {
    this.onChange(this.state())
  }
}
