/*
 * Specimens for the widget's parts: the whole KianWidget, the pill in each
 * voice state, the live waveform, message cards and the type bar.
 */
import { useState } from 'react'
import { Segmented } from '@kian/designs'
import {
  KianWidget,
  MessageCard,
  Pill,
  TypeBar,
  Waveform,
  useMicLevel,
  type Orientation,
  type VoiceState,
} from '@kian/ui'
import { Stage } from '../../Chrome'
import { LabeledToggle } from '../Home'
import { useDemoDesk } from '../../demo/useDemoDesk'
import { CARD_KINDS, PILL_STATES, SAMPLES, opts } from './samples'
import { Specimen } from './Specimen'

export function WidgetSpecimen() {
  const [orientation, setOrientation] = useState<Orientation>('horizontal')
  const desk = useDemoDesk({ voiceOut: false, simulateMic: true })
  return (
    <Specimen
      id="KianWidget"
      title="KianWidget"
      blurb="The pill plus whatever floats beside it: one card, nudge or type bar at a time. It holds no state of its own. Here a morning plays through it; in the desktop app the same props come from Switch."
      controls={
        <>
          <Segmented aria-label="Orientation" value={orientation} options={opts(['horizontal', 'vertical'] as const)} onValueChange={setOrientation} />
          <button className="btn btn--quiet" onClick={desk.reset}>
            Reset
          </button>
        </>
      }
      code={`<KianWidget
  orientation="${orientation}"
  voiceState={voiceState}       // idle | listening | recording | sending | sent | typing
  message={queue[0]}            // the one card on screen
  pending={working}             // skeleton while an agent writes
  queued={queue.length - 1}
  onTalk={…} onStop={…} onChip={(msg, chip) => rooms.post(msg.room, chip.label, { rootId: msg.id })}
/>`}
    >
      <Stage wallpaper="sky" height={440} align={orientation === 'horizontal' ? 'bottom' : 'right'}>
        <KianWidget {...desk.widget} orientation={orientation} keyboard={false} />
      </Stage>
    </Specimen>
  )
}

export function PillSpecimen() {
  const [state, setState] = useState<VoiceState>('idle')
  const [orientation, setOrientation] = useState<Orientation>('horizontal')
  const mic = useMicLevel(state === 'listening', { simulate: true })
  return (
    <Specimen
      id="Pill"
      title="Pill"
      blurb="Quiet at rest. The mic talks to Kian; ◉ records a meeting for kian-scribe. While listening it shows a live waveform with cancel and stop, and status words roll instead of crossfading."
      controls={
        <>
          <Segmented aria-label="State" value={state as (typeof PILL_STATES)[number]} options={opts(PILL_STATES)} onValueChange={setState} />
          <Segmented aria-label="Orientation" value={orientation} options={opts(['horizontal', 'vertical'] as const)} onValueChange={setOrientation} />
        </>
      }
      code={`<Pill state="${state}" orientation="${orientation}" getLevel={mic.getLevel} onTalk={…} onRecord={…} onStop={…} onCancel={…} />`}
    >
      <Stage wallpaper="sky" height={240} align="center">
        <div className="kian">
          <Pill
            state={state}
            orientation={orientation}
            getLevel={mic.getLevel}
            onTalk={() => setState('listening')}
            onRecord={() => setState('recording')}
            onStop={() => {
              setState('sending')
              setTimeout(() => setState('sent'), 900)
              setTimeout(() => setState('idle'), 1900)
            }}
            onCancel={() => setState('idle')}
          />
        </div>
      </Stage>
    </Specimen>
  )
}

export function WaveformSpecimen() {
  const [real, setReal] = useState(false)
  const mic = useMicLevel(true, { simulate: !real })
  return (
    <Specimen
      id="Waveform"
      title="Waveform"
      blurb="A scrolling history of how loud the mic is. Bars are written straight to style.transform each frame, with no React state per frame, and it falls back to a simulated voice if the mic is blocked."
      controls={
        <LabeledToggle on={real} onChange={setReal}>
          Use my mic {real && mic.source === 'simulated' ? '(blocked, simulating)' : ''}
        </LabeledToggle>
      }
      code={`const mic = useMicLevel(listening)\n<Waveform getLevel={mic.getLevel} bars={24} />`}
    >
      <Stage wallpaper="graphite" height={160} align="center">
        <div className="kian">
          <div className="k-glass wave-demo">
            <Waveform getLevel={mic.getLevel} bars={32} />
          </div>
        </div>
      </Stage>
    </Specimen>
  )
}

export function CardSpecimen() {
  const [kind, setKind] = useState<(typeof CARD_KINDS)[number]>('brief')
  const [speaking, setSpeaking] = useState(false)
  const loading = kind === 'loading'
  const message = loading ? SAMPLES.brief : SAMPLES[kind]
  return (
    <Specimen
      id="MessageCard"
      title="MessageCard"
      blurb="One message from one room, never a list. The buttons depend on the room: done, skip and draft on the desk, yes in a deal room, and hold to approve in #approvals. Loading shows a skeleton shaped like real text, and the reply reveals into it."
      controls={
        <>
          <Segmented aria-label="Kind" value={kind} options={opts(CARD_KINDS)} onValueChange={setKind} />
          <LabeledToggle on={speaking} onChange={setSpeaking}>
            Speaking
          </LabeledToggle>
        </>
      }
      code={`<MessageCard message={msg} queued={2} ${loading ? 'loading ' : ''}${speaking ? 'speaking ' : ''}onChip={…} onVoiceReply={…} onDismiss={…} />`}
    >
      <Stage wallpaper="grid" height={kind === 'long' ? 340 : 280} align="center">
        <div className="kian">
          <MessageCard message={message} queued={kind === 'brief' ? 2 : 0} loading={loading} speaking={speaking} />
        </div>
      </Stage>
    </Specimen>
  )
}

export function TypeBarDemo() {
  const [sent, setSent] = useState<string[]>([])
  return (
    <Stage wallpaper="graphite" height={200} align="center">
      <div className="kian col">
        <TypeBar room="kian-desk" autoFocus={false} onSubmit={(t) => setSent((s) => [...s.slice(-2), t])} />
        {sent.map((t, i) => (
          <div className="sent-line" key={i + t}>
            → #kian-desk: {t}
          </div>
        ))}
      </div>
    </Stage>
  )
}
