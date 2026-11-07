/*
 * The mock rooms: the demo morning with no Switch server. Say "morning" in
 * the desk and kian posts the same brief the toolkit's demo data gives, one
 * item at a time, each with its answer line. Answers move it along the way
 * the real agents would: "draft" hands over to kian-scribe, a price goes to
 * approvals, and an approval is recorded.
 */
import type { RoomEvent, RoomSummary } from '../../shared/types'
import type { Rooms } from './types'

const ME = 'yukti'

const BRIEF = [
  'Priya Shah at Lumen Health: “Can we move Thursday to Tuesday?”\nShe also asks about 15% off if they go annual.\n→ done · skip · draft',
  '10:30, discovery call with Rahul Mehta at Kestrel Logistics. He asked for the SOC 2 report beforehand.\n→ done · skip · draft',
  'New sender: Dana Lee at Harbor Foods. “Do you work with food distributors?”\n→ open room · skip',
  'Northwind Supply has been quiet for 6 days since your proposal.\n→ done · skip · draft',
]

const ROOMS: RoomSummary[] = [
  { name: 'kian-desk', title: 'Desk', members: ['yukti', 'kian'] },
  { name: 'kian-approvals', title: 'Approvals', members: ['yukti', 'ravi', 'kian'] },
  { name: 'kian-content', title: 'Content', members: ['yukti', 'kian-studio'] },
  { name: 'deal-lumen-health', title: 'Lumen Health', members: ['yukti', 'kian', 'kian-scribe'] },
  { name: 'deal-kestrel-logistics', title: 'Kestrel Logistics', members: ['yukti', 'kian', 'kian-scribe'] },
]

export class MockRooms implements Rooms {
  readonly kind = 'mock' as const
  private listeners = new Set<(e: RoomEvent) => void>()
  private log: RoomEvent[] = []
  private timers = new Set<NodeJS.Timeout>()
  private next = 0
  private seq = 0

  async connect() {
    this.later(1200, () => this.agent('kian', 'kian-desk', 'Morning. Say “morning, Kian” whenever you are ready.'))
    return { username: ME }
  }

  onMessage(fn: (e: RoomEvent) => void) {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }

  onStatus(fn: (online: boolean) => void) {
    fn(true)
    return () => {}
  }

  async post(room: string, text: string, opts: { rootId?: string } = {}) {
    this.emit({ room, author: ME, authorIsAgent: false, text, rootId: opts.rootId })
    const said = text.toLowerCase().trim()
    const about = this.log.find((e) => e.id === opts.rootId)

    if (/morning|brief/.test(said) && !opts.rootId) {
      this.next = 0
      this.later(900, () => this.agent('kian', 'kian-desk', 'Morning Yukti. 3 people wrote in and your first meeting is at 10:30.'))
      this.later(2200, () => this.briefItem())
      return
    }
    if (!about) return
    if (said === 'draft' && about.text.includes('Lumen')) {
      this.later(700, () => this.agent('kian', 'deal-lumen-health', '@kian-scribe Priya wants Tuesday afternoon instead of Thursday. Draft the reply; hold the price.'))
      this.later(3200, () => this.agent('kian-scribe', 'deal-lumen-health', 'Draft is in Gmail: moves the call to Tuesday at 3 PM and holds the price until approvals decides. Not sent.\n→ looks good · edit'))
      this.later(5200, () => this.agent('kian', 'kian-approvals', '@ravi Lumen Health asks for 15% off annual. List 18,000; margin stays above floor at 15%.\n→ approve (hold) · refuse'))
    } else if (said === 'approve' || said === 'refuse') {
      const outcome = said === 'approve' ? 'approved' : 'refused'
      this.later(800, () => this.agent('kian', 'kian-approvals', `Recorded in Decisions: Lumen Health · 15% off annual · ${outcome} by ravi.`))
    } else if (said === 'open room') {
      this.later(900, () => this.agent('kian', 'kian-desk', 'Opened #deal-harbor-foods with you and kian-scribe. The thread is posted there.'))
    }
    if (about.room === 'kian-desk' && BRIEF.some((b) => about.text === b)) this.later(1500, () => this.briefItem())
  }

  async rooms() {
    return ROOMS.map((r) => {
      const last = [...this.log].reverse().find((e) => e.room === r.name)
      return last ? { ...r, last: { author: last.author, text: last.text, at: last.at } } : r
    })
  }

  async recent(limit = 50) {
    return this.log.slice(-limit)
  }

  close() {
    this.timers.forEach(clearTimeout)
    this.listeners.clear()
  }

  private briefItem() {
    if (this.next < BRIEF.length) this.agent('kian', 'kian-desk', BRIEF[this.next++])
  }

  private agent(author: string, room: string, text: string) {
    this.emit({ room, author, authorIsAgent: true, text, mentionsMe: room === 'kian-approvals' })
  }

  private emit(e: Omit<RoomEvent, 'id' | 'at' | 'mentionsMe'> & { mentionsMe?: boolean }) {
    const event: RoomEvent = { mentionsMe: false, ...e, id: `mock-${++this.seq}`, at: Date.now() }
    this.log.push(event)
    this.listeners.forEach((fn) => fn(event))
  }

  private later(ms: number, fn: () => void) {
    const t = setTimeout(() => {
      this.timers.delete(t)
      fn()
    }, ms)
    this.timers.add(t)
  }
}
