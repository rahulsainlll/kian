/*
 * Kian's dashboard parts, composed from the designs kit. The dashboard shows
 * what the rooms already hold; every action here is still a message in a room.
 */
import { ActionButton, Avatar, Badge, BrandMark, Button, Row, type ActionStatus } from '@kian/designs'
import type { BrandName } from '@kian/designs'
import { useState, type ReactNode } from 'react'
import { CAST, Mascot } from './Character'
import { HoldButton } from './HoldButton'

export function Panel({ title, action, children, className = '' }: { title?: ReactNode; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`k-panel ${className}`}>
      {(title || action) && (
        <header className="k-panel__head">
          <div className="k-panel__title">{title}</div>
          {action}
        </header>
      )}
      {children}
    </section>
  )
}

/** An agent's avatar in its own colour; people get the kit's person tones. */
export function PersonAvatar({ name, size = 28 }: { name: string; size?: number }) {
  const c = CAST[name]
  if (!c) return <Avatar name={name} size={size} />
  return (
    <span className="k-agent-avatar" aria-label={name}>
      <Mascot size={size} shape={c.shape} color={c.color} mood="happy" />
    </span>
  )
}

export interface Activity {
  id: string
  actor: string
  /** What happened, without the actor: "drafted a reply to Priya". */
  text: string
  room: string
  time: string
  kind?: 'draft' | 'decision' | 'task' | 'message' | 'sheet'
}

const KIND: Record<NonNullable<Activity['kind']>, { label: string; tone: 'neutral' | 'accent' | 'success' | 'warning' }> = {
  draft: { label: 'Draft', tone: 'accent' },
  decision: { label: 'Decision', tone: 'success' },
  task: { label: 'Task', tone: 'neutral' },
  message: { label: 'Message', tone: 'neutral' },
  sheet: { label: 'Sheet', tone: 'warning' },
}

export function ActivityRow({ item }: { item: Activity }) {
  return (
    <Row
      lead={<PersonAvatar name={item.actor} />}
      title={
        <>
          <b className="k-strong">{item.actor}</b> {item.text}
        </>
      }
      subtitle={`#${item.room}`}
      meta={item.time}
    >
      {item.kind && <Badge tone={KIND[item.kind].tone}>{KIND[item.kind].label}</Badge>}
    </Row>
  )
}

/** Small overlapping faces for a room's members: agents in their colour, people in the kit's tones. */
export function MemberStack({ names, max = 3 }: { names: string[]; max?: number }) {
  const shown = names.slice(0, max)
  const rest = names.length - shown.length
  return (
    <span className="k-stack" aria-label={names.join(', ')}>
      {shown.map((n) => (
        <PersonAvatar key={n} name={n} size={20} />
      ))}
      {rest > 0 && <span className="k-stack__more">+{rest}</span>}
    </span>
  )
}

export interface Room {
  name: string
  topic: string
  members: string[]
  unread?: boolean
  updated: string
}

export function RoomRow({ room, selected, onSelect }: { room: Room; selected?: boolean; onSelect?: () => void }) {
  return (
    <Row
      lead={<span className="k-room-hash">#</span>}
      title={room.name}
      subtitle={room.topic}
      meta={room.updated}
      unread={room.unread}
      selected={selected}
      onClick={onSelect}
    >
      <MemberStack names={room.members} />
    </Row>
  )
}

export interface Connection {
  id: string
  name: string
  /** What Kian does with it, in a few words. */
  role: string
  brand?: BrandName
  /** A glyph tile for services the kit has no brand mark for. */
  glyph?: ReactNode
  connected: boolean
  note?: string
}

/** One service. Connect runs on the kit's ActionButton: idle, pending, done, in place. */
export function ConnectionRow({ connection, onConnect }: { connection: Connection; onConnect?: () => Promise<void> }) {
  const c = connection
  const [status, setStatus] = useState<ActionStatus>(c.connected ? 'done' : 'idle')

  const connect = async () => {
    setStatus('pending')
    await onConnect?.()
    setStatus('done')
  }

  return (
    <Row
      lead={c.brand ? <BrandMark brand={c.brand} size={32} tile /> : <span className="k-glyph-tile">{c.glyph}</span>}
      title={c.name}
      subtitle={status === 'done' ? (c.note ?? c.role) : c.role}
    >
      {status === 'done' ? (
        <Badge tone="success" dot>
          Connected
        </Badge>
      ) : (
        <ActionButton status={status} doneLabel="Connected" onClick={connect}>
          Connect
        </ActionButton>
      )}
    </Row>
  )
}

export interface Approval {
  id: string
  deal: string
  ask: string
  detail: string
  requestedBy: string
}

export function ApprovalCard({ approval, onApprove, onRefuse }: { approval: Approval; onApprove?: () => void; onRefuse?: () => void }) {
  const [refused, setRefused] = useState(false)
  return (
    <div className="k-approval" data-refused={refused || undefined}>
      <div className="k-approval__top">
        <Badge tone="warning" dot>
          #approvals
        </Badge>
        <span className="k-approval__by">asked by {approval.requestedBy}</span>
      </div>
      <div className="k-approval__deal">{approval.deal}</div>
      <p className="k-approval__ask">{approval.ask}</p>
      <p className="k-approval__detail">{approval.detail}</p>
      <div className="k-approval__actions">
        {refused ? (
          <Badge tone="danger">Refused</Badge>
        ) : (
          <>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setRefused(true)
                onRefuse?.()
              }}
            >
              Refuse
            </Button>
            <HoldButton size="sm" holdingLabel="Keep holding" doneLabel="Approved" onConfirm={() => onApprove?.()}>
              Hold to approve
            </HoldButton>
          </>
        )}
      </div>
    </div>
  )
}

/** "Needs you" item: a draft or Sheet change waiting for a yes. */
export function PendingRow({ who, title, room, time, action, onAction }: { who: string; title: string; room: string; time: string; action: string; onAction?: () => void }) {
  const [done, setDone] = useState(false)
  return (
    <Row lead={<PersonAvatar name={who} />} title={title} subtitle={`#${room}`} meta={time}>
      {done ? (
        <Badge tone="success">Sent to room</Badge>
      ) : (
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            setDone(true)
            onAction?.()
          }}
        >
          {action}
        </Button>
      )}
    </Row>
  )
}
