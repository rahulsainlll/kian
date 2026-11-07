/*
 * Questions people ask, in a HeroUI Accordion.
 */
import { Accordion } from '@heroui/react'
import { Block } from './Block'

const FAQ = [
  ['Does Kian ever email a customer?', 'No. The toolkit can read mail, create drafts and update the lead list after a yes. There is no send command for an agent to call.'],
  ['Why a widget if everything lives in chat?', 'Chat is where the work is recorded. The widget is the fast way in: talk instead of typing, and get tapped when a room needs you.'],
  ['Isn’t the dashboard a second UI?', 'It only reads the rooms. Every button on it posts the same message you would have typed, so the rooms stay the source of truth.'],
  ['What does it run on?', 'Switch runs the agents and rooms, the agents are Claude, and the site runs on free tiers. Your data stays in your own Google account.'],
  ['Can my team use it today?', 'Yes, with a Switch server, a Google account and the template. Each person signs in once, and their agent works with their own accounts.'],
]

export function Faq() {
  return (
    <Block id="faq" eyebrow="Questions" title="Things people ask">
      <Accordion className="faq" defaultExpandedKeys={['0']}>
        {FAQ.map(([q, a], i) => (
          <Accordion.Item key={q} id={String(i)}>
            <Accordion.Heading>
              <Accordion.Trigger className="faq__q">
                {q}
                <Accordion.Indicator />
              </Accordion.Trigger>
            </Accordion.Heading>
            <Accordion.Panel>
              <Accordion.Body className="faq__a">{a}</Accordion.Body>
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
    </Block>
  )
}
