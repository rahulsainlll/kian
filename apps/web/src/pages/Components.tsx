/*
 * The /components gallery: every Kian component in every state, from the
 * same packages the desktop app imports. Specimens live in components/.
 */
import { ChipButton, NudgeCard } from '@kian/ui'
import { Nav, Stage } from '../Chrome'
import { Specimen } from './components/Specimen'
import { CardSpecimen, PillSpecimen, TypeBarDemo, WaveformSpecimen, WidgetSpecimen } from './components/WidgetSpecimens'
import { ButtonsSpecimen, DashboardSpecimen } from './components/KitSpecimens'

export function Components() {
  return (
    <div className="page">
      <Nav active="components" />
      <header className="hero hero--small">
        <p className="eyebrow">@kian/ui</p>
        <h1 className="hero__title">Components</h1>
        <p className="hero__lede">
          Kian is built from these. The website and the desktop app import the same packages,{' '}
          <code>@kian/ui</code> for the widget and <code>@kian/designs</code> for the kit, so what you see here is what runs
          on Mac and Windows. Every action a component offers ends up as a message in a Switch room.
        </p>
        <ul className="toc">
          {['Buttons', 'KianWidget', 'Pill', 'Waveform', 'MessageCard', 'NudgeCard', 'TypeBar', 'Chip', 'Dashboard'].map((n) => (
            <li key={n}>
              <a href={`#${n}`}>{n}</a>
            </li>
          ))}
        </ul>
      </header>

      <ButtonsSpecimen />
      <WidgetSpecimen />
      <PillSpecimen />
      <WaveformSpecimen />
      <CardSpecimen />

      <Specimen
        id="NudgeCard"
        title="NudgeCard"
        blurb="The widget’s one unprompted opener. At the morning time the pill glows and asks once; tapping it posts the action to #kian-desk."
        code={`<NudgeCard nudge={{ text: 'Morning, Yukti. Want your brief?', action: 'morning, Kian' }} onAction={…} />`}
      >
        <Stage wallpaper="graphite" height={220} align="center">
          <div className="kian">
            <NudgeCard nudge={{ text: 'Morning, Yukti. Want your brief?', action: 'morning, Kian', dismiss: 'Later' }} />
          </div>
        </Stage>
      </Specimen>

      <Specimen
        id="TypeBar"
        title="TypeBar"
        blurb="Type into a room. It is also how you dictate into Kian with Wispr Flow: focus it and talk. Enter sends, Esc closes."
        code={`<TypeBar room="kian-desk" onSubmit={(text) => rooms.post('kian-desk', text)} />`}
      >
        <TypeBarDemo />
      </Specimen>

      <Specimen
        id="Chip"
        title="Chip"
        blurb="A word you can answer with. The label is posted to the room as a reply, so the chat history reads exactly as if you had typed it. Number keys press them in order."
        code={`<ChipButton chip={{ label: 'approved', tone: 'primary' }} index={0} onPress={…} />`}
      >
        <Stage wallpaper="grid" height={180} align="center">
          <div className="kian row">
            <ChipButton chip={{ label: 'done' }} index={0} />
            <ChipButton chip={{ label: 'skip' }} index={1} />
            <ChipButton chip={{ label: 'draft', tone: 'primary' }} index={2} />
            <ChipButton chip={{ label: 'refused', tone: 'danger' }} />
            <ChipButton chip={{ label: 'approved', tone: 'primary', hold: true, holdLabel: 'Hold to approve' }} />
          </div>
        </Stage>
      </Specimen>

      <DashboardSpecimen />

      <footer className="foot">
        <span>The same components run on the website and the desktop app.</span>
        <a href="/">Back to the demo</a>
      </footer>
    </div>
  )
}
