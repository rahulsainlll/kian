/*
 * The contact page: a short form that opens the visitor's own mail app with
 * the message filled in. Nothing is sent from the page itself.
 */
import { Button } from '@kian/designs'
import { Mascot } from '@kian/ui'
import { useState } from 'react'
import { Nav, SiteFooter } from '../Chrome'

// Placeholder until the team inbox exists. The form opens the visitor's own mail
// app with the message filled in; nothing is sent from this page.
const CONTACT_EMAIL = 'team@kian.example'

const REASONS = ['Try Kian with my team', 'Judging the hackathon', 'Press or partnership', 'Just saying hi'] as const

export function Contact() {
  const [reason, setReason] = useState<(typeof REASONS)[number]>(REASONS[0])

  return (
    <div className="home">
      <div className="page">
        <Nav active="contact" />
      </div>
      <main className="page contact">
        <div className="contact__intro">
          <Mascot size={110} shape="bubble" color="#19b86b" mood="happy" />
          <p className="eyebrow">Contact</p>
          <h1 className="block__title">Say hi to the team</h1>
          <p className="contact__lede">Want Kian on your team’s rooms, or have a question about how it works? Write to us.</p>
        </div>

        <form
          className="contact__form"
          onSubmit={(e) => {
            e.preventDefault()
            const f = new FormData(e.currentTarget)
            const body = `${f.get('message')}\n\n${f.get('name')} · ${f.get('team') || 'no team given'}`
            location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(reason)}&body=${encodeURIComponent(body)}`
          }}
        >
          <fieldset className="contact__reasons">
            <legend>What brings you here?</legend>
            {REASONS.map((r) => (
              <label key={r} className="contact__reason" data-on={r === reason || undefined}>
                <input type="radio" name="reason" value={r} checked={r === reason} onChange={() => setReason(r)} />
                {r}
              </label>
            ))}
          </fieldset>
          <label className="contact__field">
            Your name
            <input name="name" required autoComplete="name" />
          </label>
          <label className="contact__field">
            Team or company
            <input name="team" autoComplete="organization" />
          </label>
          <label className="contact__field">
            Message
            <textarea name="message" rows={5} required />
          </label>
          <Button type="submit" variant="primary">
            Open in my mail app
          </Button>
          <p className="contact__note">This opens your own email app with the message ready. Nothing is sent from this page.</p>
        </form>
      </main>
      <SiteFooter />
    </div>
  )
}
