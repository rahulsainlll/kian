/*
 * The morning walkthrough: a scripted sequence of cards for recording a demo.
 * It only plays when asked (KIAN_WALKTHROUGH=1 at launch, or the tray's "Play
 * the morning walkthrough"), and its answers never post to the real rooms.
 *
 * The story: a good-morning brief, Mayank's discount to approve, Yukti's deck
 * to review, then Mayank's new client, a draft for it with Yukti's
 * attachments, and Rahul's send.
 */
import type { RoomEvent } from '../shared/types'

type Push = (event: RoomEvent) => void

interface Beat {
  author: string
  text: string
  /** What happens after this card's answer: the next beat, after a pause. */
  next?: (reply: string) => { beat: string; after: number } | null
}

const BEATS: Record<string, Beat> = {
  hello: {
    author: 'rahul-kian',
    text: 'Good morning, Rahul. While you were away: Mayank priced the Avenish renewal, Yukti finished the pitch deck, and Mayank found a new client. Three things need you.\n→ show me',
    next: () => ({ beat: 'discount', after: 900 }),
  },
  discount: {
    author: 'mayank-kian',
    text: 'From Mayank: offer Avenish Health 12% off the annual plan, valid until Friday. Margin stays above our floor.\n→ approve (hold) · refuse',
    next: () => ({ beat: 'deck', after: 1200 }),
  },
  deck: {
    author: 'yukti-kian',
    text: 'From Yukti: the Avenish pitch deck is ready, 12 slides with the new pricing. Review before she shares it?\n→ looks good · edit',
    next: () => ({ beat: 'client', after: 1400 }),
  },
  client: {
    author: 'mayank-kian',
    text: 'From Mayank: Harbor Foods wants a pilot for 40 delivery trucks across 3 regions, starting next month. Budget around $18k. Dana Lee is the contact.\n→ later · draft a reply',
    next: (reply) => (reply === 'later' ? null : { beat: 'working', after: 700 }),
  },
  working: {
    author: 'rahul-kian',
    text: "On it. Asking Mayank's agent to draft the reply to Dana, and Yukti's agent for the pitch deck and the Atlas case study to attach.",
    next: () => ({ beat: 'draft', after: 4500 }),
  },
  draft: {
    author: 'rahul-kian',
    text: 'Draft ready. Mayank wrote it, Yukti attached the pitch deck and the case study. To dana@harborfoods.example: "Pilot for Harbor Foods, starting next month".\n→ edit · send',
    next: (reply) => (reply === 'send' ? { beat: 'sent', after: 600 } : null),
  },
  sent: {
    author: 'rahul-kian',
    text: 'Sent. Mayank and Yukti are in the loop, and the pilot is on all three of your task lists.',
  },
}

export class Walkthrough {
  private timers: NodeJS.Timeout[] = []
  private seq = 0

  constructor(
    private push: Push,
    private room: () => string,
  ) {}

  /** Starts from the greeting after `delay` ms, clearing any run in progress. */
  play(delay = 5000) {
    this.stop()
    this.later(delay, 'hello')
  }

  stop() {
    this.timers.forEach(clearTimeout)
    this.timers = []
  }

  /** True when this card belongs to the walkthrough (its answers stay local). */
  owns(messageId: string) {
    return messageId.startsWith('walk-')
  }

  answer(messageId: string, reply: string) {
    const beat = BEATS[messageId.split(':')[1]]
    const step = beat?.next?.(reply.toLowerCase())
    if (step) this.later(step.after, step.beat)
  }

  private later(ms: number, name: string) {
    this.timers.push(setTimeout(() => this.show(name), ms))
  }

  private show(name: string) {
    const beat = BEATS[name]
    this.push({
      id: `walk-${++this.seq}:${name}`,
      room: this.room(),
      author: beat.author,
      authorIsAgent: true,
      text: beat.text,
      at: Date.now(),
      mentionsMe: true,
    })
  }
}
