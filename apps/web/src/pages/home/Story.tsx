/*
 * The day in three stops (11:15, 2:30, 5:00) on a timeline. A face rides the
 * line, the stop's scene plays, and it advances on its own unless held.
 */
import { CAST, Mascot, type Mood } from '@kian/ui'
import { useEffect, useState, type ReactNode } from 'react'
import { ContentScene, MeetingScene, RoomScene } from '../../scenes/Scenes'
import { useReveal } from '../../scenes/useScene'

const STEPS3: { key: string; time: string; who: keyof typeof CAST; mood: Mood; says: string; title: string; body: string; scene: ReactNode }[] = [
  {
    key: 'meeting',
    time: '11:15 AM',
    who: 'kian-scribe',
    mood: 'done',
    says: 'Notes from the Kestrel call are in. Two tasks, one Sheet change for you.',
    title: 'Calls turn into tasks.',
    body: 'Record a call from the widget. kian-scribe writes the notes and next steps, and asks before it touches the lead list.',
    scene: <MeetingScene />,
  },
  {
    key: 'room',
    time: '2:30 PM',
    who: 'kian',
    mood: 'surprised',
    says: 'Someone new emailed. I opened a room for Harbor Foods.',
    title: 'Every new deal gets its own room.',
    body: 'A new name in the inbox becomes a room with the right people in it. Its history is the deal’s memory.',
    scene: <RoomScene />,
  },
  {
    key: 'content',
    time: '5:00 PM',
    who: 'kian-studio',
    mood: 'excited',
    says: 'Four quick questions, then this week’s post is ready.',
    title: 'End the day with a post.',
    body: 'Answer four questions out loud. kian-studio turns them into a LinkedIn post and an X thread, ready for you to publish.',
    scene: <ContentScene />,
  },
]

// three moments on the ruler; where each sits is set in CSS so phones can pull them inward
const STOPS = [0, 1, 2]
const TICKS = 48

/** A morning as a day timeline (after Grok Bot): a ruler, a time pill, and the agent talking. */
export function Story() {
  const [i, setI] = useState(0)
  const [held, setHeld] = useState(false)
  const ref = useReveal<HTMLElement>()

  // move to the next moment after one loop of its scene, until someone takes the wheel
  useEffect(() => {
    if (held || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = setTimeout(() => setI((n) => (n + 1) % STEPS3.length), 4500)
    return () => clearTimeout(t)
  }, [i, held])

  const go = (n: number) => {
    setI((n + STEPS3.length) % STEPS3.length)
    setHeld(true)
  }
  const step = STEPS3[i]
  const c = CAST[step.who]

  return (
    <section className="story reveal" id="story" ref={ref}>
      <div className="tl">
        <div className="tl__mover" data-stop={i}>
          <div className="tl__actor">
            <div className="tl__says" key={step.key}>
              {step.says}
            </div>
            <Mascot size={88} shape={c.shape} color={c.color} mood={step.mood} />
          </div>
          <div className="tl__pill">
            <button aria-label="Earlier" onClick={() => go(i - 1)}>
              ‹
            </button>
            <span key={step.time}>{step.time}</span>
            <button aria-label="Later" onClick={() => go(i + 1)}>
              ›
            </button>
            {!held && <i className="tl__timer" key={`t-${i}`} aria-hidden />}
          </div>
        </div>
        <div className="tl__ruler" role="tablist" aria-label="The rest of the day">
          {Array.from({ length: TICKS }, (_, t) => (
            <i key={t} className="tl__tick" />
          ))}
          {STOPS.map((x, n) => (
            <button
              key={x}
              role="tab"
              aria-selected={n === i}
              aria-label={`${STEPS3[n].time}: ${STEPS3[n].title}`}
              className="tl__stop"
              data-stop={n}
              onClick={() => go(n)}
            />
          ))}
        </div>
      </div>

      <div className="story__copy" key={step.key}>
        <p className="eyebrow">The rest of the day</p>
        <h2 className="feature__title">{step.title}</h2>
        <p className="feature__body">{step.body}</p>
      </div>
      <div className="story__scene" key={`s-${step.key}`} role="tabpanel">
        {step.scene}
      </div>
    </section>
  )
}
