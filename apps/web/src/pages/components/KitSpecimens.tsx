/*
 * Specimens for the kit buttons (variants, hold to approve, action states)
 * and the dashboard parts (panels, rows, approvals).
 */
import { useState } from 'react'
import { ActionButton, Button, RowList, type ActionStatus } from '@kian/designs'
import {
  ActivityRow,
  ApprovalCard,
  BoltIcon,
  ChatIcon,
  ConnectionRow,
  HoldButton,
  MicIcon,
  Panel,
  PendingRow,
  RoomRow,
} from '@kian/ui'
import { Stage } from '../../Chrome'
import { ACTIVITY, APPROVAL, PENDING, ROOMS } from '../../demo/dashboardData'
import { Specimen } from './Specimen'

export function ButtonsSpecimen() {
  const [status, setStatus] = useState<ActionStatus>('idle')
  const [held, setHeld] = useState(0)
  return (
    <Specimen
      id="Buttons"
      title="Buttons"
      blurb="A lit face, a glow under it, a rim, and a 1px sink when pressed. Primary is the one thing to do on a screen. Hold to approve is Kian’s own, for the one action that must never happen by accident."
      code={`<Button variant="primary" icon={<MicIcon />}>Talk to Kian</Button>
<ActionButton status={status} doneLabel="Connected">Connect</ActionButton>
<HoldButton doneLabel="Approved" onConfirm={approve}>Hold to approve</HoldButton>`}
    >
      <Stage wallpaper="grid" align="center" height={300}>
        <div className="button-board">
          <div className="button-board__row">
            <span className="button-board__label">variants</span>
            <Button variant="primary" icon={<MicIcon />}>
              Talk to Kian
            </Button>
            <Button variant="secondary">Open draft</Button>
            <Button variant="ghost">Later</Button>
            <Button variant="danger">Refuse</Button>
          </div>
          <div className="button-board__row">
            <span className="button-board__label">small</span>
            <Button size="sm" variant="primary">
              draft
            </Button>
            <Button size="sm" variant="secondary">
              done
            </Button>
            <Button size="sm" variant="secondary" icon={<BoltIcon />} aria-label="Agents" />
            <Button size="sm" variant="secondary" disabled>
              Sent
            </Button>
          </div>
          <div className="button-board__row">
            <span className="button-board__label">async</span>
            <ActionButton
              status={status}
              doneLabel="Connected"
              onClick={() => {
                setStatus('pending')
                setTimeout(() => setStatus('done'), 1400)
                setTimeout(() => setStatus('idle'), 4000)
              }}
            >
              Connect Gmail
            </ActionButton>
            <HoldButton key={held} doneLabel="Approved" onConfirm={() => setTimeout(() => setHeld((h) => h + 1), 1600)}>
              Hold to approve
            </HoldButton>
          </div>
        </div>
      </Stage>
    </Specimen>
  )
}

export function DashboardSpecimen() {
  return (
    <Specimen
      id="Dashboard"
      title="Dashboard parts"
      blurb="Rows, panels and cards for the dashboard, composed from the kit’s Row, Badge, Avatar and BrandMark. The dashboard only shows what the rooms already hold; acting on anything posts to the room."
      code={`<Panel title="Needs you">
  <ApprovalCard approval={approval} onApprove={…} />
  <RowList>{pending.map((p) => <PendingRow {...p} />)}</RowList>
</Panel>
<ConnectionRow connection={{ name: 'Gmail', brand: 'gmail', connected: false, … }} onConnect={…} />`}
    >
      <div className="specimen-grid">
        <Stage wallpaper="graphite" align="center">
          <div className="panel-demo">
            <Panel title="Needs you">
              <ApprovalCard approval={APPROVAL} />
              <RowList aria-label="Waiting on you">
                <PendingRow {...PENDING[0]} />
              </RowList>
            </Panel>
          </div>
        </Stage>
        <Stage wallpaper="graphite" align="center">
          <div className="panel-demo">
            <Panel title="Connections">
              <RowList aria-label="Connections">
                <ConnectionRow connection={{ id: 'mm', name: 'Mattermost', role: 'Where the rooms live', glyph: <ChatIcon />, connected: true, note: '6 rooms · signed in' }} />
                <ConnectionRow connection={{ id: 'gmail', name: 'Gmail', role: 'Drafts only, never sends', brand: 'gmail', connected: false }} onConnect={() => new Promise((r) => setTimeout(r, 1400))} />
                <ConnectionRow connection={{ id: 'sheets', name: 'Google Sheets', role: 'The lead list', brand: 'google-sheets', connected: false }} onConnect={() => new Promise((r) => setTimeout(r, 1400))} />
              </RowList>
            </Panel>
          </div>
        </Stage>
        <Stage wallpaper="graphite" align="center">
          <div className="panel-demo">
            <Panel title="Activity">
              <RowList aria-label="Activity">{ACTIVITY.slice(0, 3).map((a) => <ActivityRow key={a.id} item={a} />)}</RowList>
            </Panel>
          </div>
        </Stage>
        <Stage wallpaper="graphite" align="center">
          <div className="panel-demo">
            <Panel title="Rooms">
              <RowList aria-label="Rooms">{ROOMS.slice(0, 3).map((r) => <RoomRow key={r.name} room={r} />)}</RowList>
            </Panel>
          </div>
        </Stage>
      </div>
    </Specimen>
  )
}
