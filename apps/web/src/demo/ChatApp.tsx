import { Badge, BrandMark, Window } from '@kian/designs'
import { ChipButton, Mascot, MicIcon, PersonAvatar, type Chip, type Mood, type RoomMessage, type Shape } from '@kian/ui'
import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import type { LogLine } from './useDemoDesk'

/*
 * The rooms, the way a person sees them: Mattermost, simplified to what the
 * story needs (after Grok Bot's demo). Rooms are rows with a face and a
 * preview; agent messages that need you are action cards whose buttons work.
 */

const ROOMS: { id: string; title: string; shape: Shape; color: string; mood: Mood; topic: string; members: string[] }[] = [
  { id: 'kian-desk', title: 'Desk', shape: 'flower', color: '#3d7bf2', mood: 'happy', topic: 'Your morning, one item at a time', members: ['Yukti', 'kian'] },
  { id: 'deal-lumen', title: 'Lumen Health', shape: 'bubble', color: '#19b86b', mood: 'wink', topic: 'Annual plan', members: ['Yukti', 'kian', 'kian-scribe'] },
  { id: 'deal-kestrel', title: 'Kestrel Logistics', shape: 'bubble', color: '#14a3a3', mood: 'look', topic: '40 seats', members: ['Yukti', 'kian', 'kian-scribe'] },
  { id: 'approvals', title: 'Approvals', shape: 'blob', color: '#ee3f4f', mood: 'excited', topic: 'Only the sales lead approves', members: ['Yukti', 'Ravi Kapoor', 'kian'] },
  { id: 'content', title: 'Content', shape: 'sun', color: '#ff8a1f', mood: 'happy', topic: 'Posts for this week', members: ['Yukti', 'kian-studio'] },
]

const AGENTS = new Set(['kian', 'kian-scribe', 'kian-studio'])
const who = (a: string) => (a === 'yukti' ? 'Yukti' : a)

export function ChatApp({ log, onAnswer }: { log: LogLine[]; onAnswer: (m: RoomMessage, c: Chip) => void }) {
  const latest = log[log.length - 1]?.room ?? 'kian-desk'
  const [open, setOpen] = useState(latest)
  const [seen, setSeen] = useState<Record<string, number>>({})

  // follow the conversation: the open room is the one that just moved
  useEffect(() => setOpen(latest), [latest, log.length])

  const today = useMemo(() => {
    const c: Record<string, number> = {}
    for (const l of log) if (!l.day) c[l.room] = (c[l.room] ?? 0) + 1
    return c
  }, [log])
  useEffect(() => setSeen((s) => ({ ...s, [open]: today[open] ?? 0 })), [open, today])

  // a message is answered once a reply in its thread exists
  const answered = useMemo(() => new Set(log.map((l) => l.replyTo).filter(Boolean) as string[]), [log])

  const room = ROOMS.find((r) => r.id === open) ?? ROOMS[0]
  const lines = log.filter((l) => l.room === open)
  const list = useRef<HTMLDivElement>(null)
  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight, behavior: 'smooth' })
  }, [lines.length, open])

  return (
    <Window chrome="native" lights="color" className="chat" bodyClassName="chat__body">
      <aside className="chat__rail" aria-label="Rooms">
        <div className="chat__search">Search</div>
        <div className="chat__rooms">
          {ROOMS.map((r) => {
            const last = [...log].reverse().find((l) => l.room === r.id)
            const unread = (today[r.id] ?? 0) > (seen[r.id] ?? 0) && r.id !== open
            return (
              <button key={r.id} className="chat__row" aria-current={r.id === open || undefined} onClick={() => setOpen(r.id)}>
                <span className="chat__face">
                  <Mascot size={34} shape={r.shape} color={r.color} mood={r.mood} />
                  {unread && <i className="chat__unread" aria-label="unread" />}
                </span>
                <span className="chat__row-text">
                  <span className="chat__row-top">
                    <b>{r.title}</b>
                    <span>{last?.day ? 'Yesterday' : last ? '9:0' + Math.min(9, today[r.id] ?? 0) + ' AM' : ''}</span>
                  </span>
                  <span className="chat__preview">{last ? `${last.author === 'yukti' ? 'You: ' : ''}${last.text}` : room.topic}</span>
                </span>
              </button>
            )
          })}
        </div>
        <div className="chat__me">
          <PersonAvatar name="Yukti" size={26} />
          Yukti
        </div>
      </aside>

      <div className="chat__main">
        <header className="chat__head">
          <Mascot size={24} shape={room.shape} color={room.color} mood={room.mood} />
          <b>{room.title}</b>
          <span className="chat__topic">{room.topic}</span>
          <span className="chat__faces">
            {room.members.map((m) => (
              <PersonAvatar key={m} name={m} size={22} />
            ))}
          </span>
        </header>

        <div className="chat__list" ref={list}>
          {lines.map((l, i) => {
            const prev = lines[i - 1]
            const divider = i === 0 ? (l.day ? 'Yesterday' : null) : prev.day && !l.day ? 'Today' : null
            const me = l.author === 'yukti'
            const m = l.message
            const card = m && (m.chips?.length || m.link)
            return (
              <Fragment key={l.id}>
                {divider && <div className="chat__day">{divider}</div>}
                {me ? (
                  <div className="bubble bubble--me" data-old={l.day || undefined}>
                    {l.replyTo && <span className="bubble__reply">replied</span>}
                    {l.text}
                  </div>
                ) : card ? (
                  <ActionCard message={m} done={answered.has(m.id)} onAnswer={onAnswer} />
                ) : (
                  <div className="bubble" data-old={l.day || undefined}>
                    <span className="bubble__who">
                      <PersonAvatar name={who(l.author)} size={18} />
                      {who(l.author)}
                      {AGENTS.has(l.author) && <span className="bubble__tag">agent</span>}
                    </span>
                    {l.text}
                  </div>
                )}
              </Fragment>
            )
          })}
        </div>

        <div className="chat__composer">
          <span className="chat__plus" aria-hidden>
            +
          </span>
          <span className="chat__placeholder">Message {room.title}</span>
          <span className="chat__mic" aria-hidden>
            <MicIcon size={14} />
          </span>
        </div>
      </div>
    </Window>
  )
}

/** An agent message that needs you, as a card. Its buttons post the same reply the widget would. */
function ActionCard({ message: m, done, onAnswer }: { message: RoomMessage; done: boolean; onAnswer: (m: RoomMessage, c: Chip) => void }) {
  const isDraft = !!m.link
  const isApproval = m.room === 'approvals'
  const title = isApproval ? 'Approval' : isDraft ? 'Gmail draft' : m.author === 'kian-scribe' ? 'Meeting notes' : 'Brief'
  return (
    <div className="action" data-done={done || undefined}>
      <div className="action__head">
        <PersonAvatar name={m.author} size={22} />
        <b>{title}</b>
        <span className="action__spacer" />
        {done ? (
          <Badge tone="success" dot>
            Done
          </Badge>
        ) : isDraft ? (
          <Badge tone="warning" dot>
            Not sent
          </Badge>
        ) : (
          <Badge tone="accent" dot>
            Needs you
          </Badge>
        )}
      </div>
      <p className="action__text">{m.text}</p>
      {isDraft && (
        <div className="action__draft">
          <BrandMark brand="gmail" size={26} tile />
          <span>
            <b>Re: Moving our call to Tuesday</b>
            <small>To Priya Shah · saved as a draft</small>
          </span>
        </div>
      )}
      {!done && m.chips && (
        <div className="action__chips">
          {m.chips.map((c) => (
            <ChipButton key={c.label} chip={c} onPress={(chip) => onAnswer(m, chip)} />
          ))}
        </div>
      )}
    </div>
  )
}

/** Telegram on Yukti's phone: the desk room, bridged by Switch, history included. */
export function Phone({ log }: { log: LogLine[] }) {
  const lines = log.filter((l) => l.room === 'kian-desk').slice(-5)
  return (
    <div className="phone" aria-label="The desk room on Telegram">
      <div className="phone__notch" />
      <div className="phone__head">
        <Mascot size={26} mood="happy" />
        <div>
          <b>Desk</b>
          <span>Telegram, via Switch</span>
        </div>
      </div>
      <div className="phone__list">
        {lines.map((l) => (
          <div className="phone__msg" data-me={l.author === 'yukti' || undefined} data-old={l.day || undefined} key={l.id}>
            {l.text}
          </div>
        ))}
      </div>
    </div>
  )
}
