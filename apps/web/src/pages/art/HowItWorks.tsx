/*
 * "How Kian works" as one picture, in the OG card's style: five steps from
 * asking your own agent to saying yes, told with the cast instead of
 * screenshots. Rendered by scripts/render-art.sh from /art/how-it-works.
 */
import { Logo, Mascot, type Mood, type Shape } from '@kian/ui'
import type { ReactNode } from 'react'
import './how.css'

const RAHUL = { shape: 'flower' as Shape, color: '#3d7bf2' }
const MAYANK = { shape: 'sun' as Shape, color: '#ff8a1f' }
const YUKTI = { shape: 'bubble' as Shape, color: '#19b86b' }

function Agent({ who, label, mood = 'happy', size = 54 }: { who: { shape: Shape; color: string }; label: string; mood?: Mood; size?: number }) {
  return (
    <div className="how-agent">
      <Mascot size={size} shape={who.shape} color={who.color} mood={mood} />
      <span>{label}</span>
    </div>
  )
}

function Say({ children, tone = 'white' }: { children: ReactNode; tone?: 'white' | 'dark' | 'blue' }) {
  return <div className={`how-say how-say--${tone}`}>{children}</div>
}

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section className="how-step">
      <div className="how-step__head">
        <span className="how-step__n">{n}</span>
        <b>{title}</b>
      </div>
      <div className="how-step__body">{children}</div>
    </section>
  )
}

export function HowItWorks() {
  return (
    <div id="art" className="how" style={{ width: 1280, height: 900 }}>
      <header className="how__head">
        <Logo size={48} />
        <h1>Everyone gets an agent. The agents work it out together.</h1>
      </header>

      <div className="how__steps">
        <Step n={1} title="You ask your agent">
          <Say>Ask Mayank what discount we can give Lumen</Say>
          <Agent who={RAHUL} label="Rahul's agent" mood="look" />
        </Step>

        <Step n={2} title="Your agent asks theirs">
          <div className="how-pair">
            <Agent who={RAHUL} label="Rahul's" size={44} />
            <span className="how-arrow">→</span>
            <Agent who={MAYANK} label="Mayank's" size={44} />
          </div>
          <Say tone="dark">What discount can we offer Lumen?</Say>
          <small className="how-note">In a shared Switch room, where the team can see</small>
        </Step>

        <Step n={3} title="Their agent checks with them">
          <Agent who={MAYANK} label="Mayank's agent" mood="look" />
          <Say tone="dark">Rahul is asking about the Lumen discount</Say>
          <Say tone="blue">12% off, until Friday</Say>
        </Step>

        <Step n={4} title="The answer pops up for you">
          <div className="how-card">
            <Mascot size={22} shape={RAHUL.shape} color={RAHUL.color} mood="happy" />
            <p>Mayank says 12% off the annual plan, until Friday.</p>
          </div>
          <Mascot size={46} shape={RAHUL.shape} color={RAHUL.color} mood="excited" />
        </Step>

        <Step n={5} title="A teammate reviews, you say yes">
          <div className="how-pair">
            <Agent who={YUKTI} label="Yukti reviews" size={44} mood="wink" />
            <span className="how-arrow">→</span>
            <div className="how-send">
              <span>edit</span>
              <span className="is-on">send</span>
            </div>
          </div>
          <small className="how-note">Nothing goes out until its owner says send</small>
        </Step>
      </div>

      <footer className="how__foot">
        Each agent only touches its own person’s tasks, calendar and email. For anyone else, it asks their agent.
      </footer>
    </div>
  )
}
