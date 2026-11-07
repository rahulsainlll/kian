/*
 * The Approvals view (what waits for the sales lead) and the Rooms view
 * (one row per deal room, with who is in it).
 */
import { ApprovalCard, PersonAvatar } from '@kian/ui'
import { APPROVAL, ROOMS } from '../../demo/dashboardData'

// ── Approvals and rooms ─────────────────────────────────────────────────────

export function Approvals() {
  return (
    <>
      <h1 className="hub__title">Approvals</h1>
      <p className="hub__sub">Only the sales lead can approve. Holding the button records a decision in #approvals.</p>
      <div className="approvals">
        <ApprovalCard approval={APPROVAL} />
      </div>
    </>
  )
}

export function Rooms() {
  return (
    <>
      <h1 className="hub__title">Rooms</h1>
      <p className="hub__sub">One room per deal. Add a teammate to a room and the handover is done.</p>
      <ul className="rooms">
        {ROOMS.map((r) => (
          <li key={r.name} className="rooms__row">
            <span className="rooms__hash">#</span>
            <span className="rooms__text">
              <b>{r.name}</b>
              <span>{r.topic}</span>
            </span>
            <span className="rooms__faces">
              {r.members.map((m) => (
                <PersonAvatar key={m} name={m} size={22} />
              ))}
            </span>
            <span className="rooms__time">{r.updated}</span>
          </li>
        ))}
      </ul>
    </>
  )
}
