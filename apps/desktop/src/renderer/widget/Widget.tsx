/*
 * The desktop widget: the shared KianWidget, fed by the desk in the main
 * process. At rest it is just the Kian flower, whose face changes; clicking
 * it opens the chat bar (type, or hold fn for Wispr Flow), and agent messages
 * pop up from it as cards. The hotkey or the mic starts listening; stopping
 * transcribes and posts to the desk room. With no voice engine set, the type
 * bar opens so Wispr Flow or the system's dictation can type instead. The
 * window only takes clicks while the pointer is over the widget.
 */
import { KianWidget, Mascot, useSpeak, type Chip, type RoomMessage } from '@kian/ui'
import { useEffect, useRef, useState } from 'react'
import type { DeskState } from '../../shared/types'
import { prettyHotkey } from '../hotkey'
import { play } from './sounds'
import { useVoice } from './useVoice'
import { toWav } from './wav'

const EMPTY: DeskState = {
  message: null,
  queued: 0,
  pending: null,
  connection: 'connecting',
  deskRoom: 'kian-desk',
  me: '',
  position: 'bottom',
  sounds: true,
  speak: false,
  hotkey: '',
}

export function Widget() {
  const [desk, setDesk] = useState<DeskState>(EMPTY)
  const [hovered, setHovered] = useState(false)
  // With no voice engine, the mic goes straight to the type bar (for Wispr Flow or typing).
  const [voiceOff, setVoiceOff] = useState(true)
  const voice = useVoice()
  const { speak, speaking, stop: stopSpeaking } = useSpeak(desk.speak)
  const seen = useRef<string | null>(null)
  const replyTo = useRef<RoomMessage | null>(null)
  // Dragging the flower moves the window; a drag never counts as a click.
  const drag = useRef<{ x: number; y: number; moved: boolean } | null>(null)
  const dragged = useRef(false)
  const { voiceState, setVoiceState } = voice
  const cue = (c: Parameters<typeof play>[0]) => desk.sounds && play(c)

  useEffect(() => {
    void window.kian.desk.state().then((s) => s && setDesk(s))
    void window.kian.hub.settings().then((s) => setVoiceOff(s.sttProvider === 'off'))
    const offSettings = window.kian.hub.onSettings((s) => setVoiceOff(s.sttProvider === 'off'))
    const offState = window.kian.desk.onState(setDesk)
    return () => {
      offSettings()
      offState()
    }
  }, [])

  // Each new card: a chime, and read aloud when voice-out is on.
  useEffect(() => {
    const m = desk.message
    if (m && seen.current !== m.id) {
      seen.current = m.id
      // A new card wins over an open chat bubble, so answers are never hidden behind it.
      setVoiceState((v) => (v === 'typing' ? 'idle' : v))
      cue('card')
      speak(m.text)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [desk.message, speak])

  // Take clicks while typing, so the type bar can be focused.
  useEffect(() => {
    if (voiceState === 'typing') window.kian.desk.setInteractive(true)
  }, [voiceState])

  const send = async (text: string) => {
    const target = replyTo.current
    replyTo.current = null
    setVoiceState('sending')
    if (target) await window.kian.desk.answer(target.id, text)
    else await window.kian.desk.say(text)
    cue('sent')
    setVoiceState('sent')
    setTimeout(() => setVoiceState('idle'), 900)
  }

  const finish = async () => {
    const meeting = voiceState === 'recording'
    cue('stop')
    const rec = await voice.stop()
    if (!rec) return setVoiceState('idle')
    setVoiceState('sending')
    const wav = await toWav(rec.audio).catch(() => null)
    const text = await window.kian.desk
      .transcribe(wav ?? rec.audio, wav ? 'audio/wav' : rec.mime)
      .catch(() => null)
    if (!text) return setVoiceState('typing') // no voice engine: type or dictate instead
    if (meeting) return send(`Transcript of a ${Math.round(rec.seconds / 60) || 1} minute call, for @kian-scribe:\n\n${text}`)
    return send(text)
  }

  const listen = () => {
    stopSpeaking()
    cue('listen')
    setVoiceState(voiceOff ? 'typing' : 'listening')
  }

  const talk = () => {
    if (voiceState === 'typing') return setVoiceState('idle')
    if (voiceState === 'listening' || voiceState === 'recording') return void finish()
    listen()
  }

  useEffect(() => window.kian.desk.onHotkey(talk))

  const chip = (m: RoomMessage, c: Chip) => {
    if (c.hold) cue('approve')
    void window.kian.desk.answer(m.id, c.reply ?? c.label)
  }

  const side = desk.position === 'left' || desk.position === 'right'
  // At rest it's only the flower; clicking it (or the hotkey) opens the chat bar.
  // With Wispr Flow there's no in-app recording, so the flower stays instead of the mic pill.
  const resting = voiceOff ? voiceState === 'idle' || voiceState === 'typing' : voiceState === 'idle' && !desk.message && !desk.pending

  return (
    <div
      className="widget-stage"
      data-position={desk.position}
      data-wispr={voiceOff || undefined}
      data-connection={desk.connection}
      onPointerEnter={() => {
        setHovered(true)
        window.kian.desk.setInteractive(true)
      }}
      onPointerDown={(e) => {
        if (!(e.target as HTMLElement).closest('.k-line--icon')) return
        drag.current = { x: e.screenX, y: e.screenY, moved: false }
        e.currentTarget.setPointerCapture(e.pointerId)
      }}
      onPointerMove={(e) => {
        const d = drag.current
        if (!d) return
        const dx = e.screenX - d.x
        const dy = e.screenY - d.y
        if (!d.moved && Math.hypot(dx, dy) < 4) return
        if (!d.moved) window.kian.desk.dragStart()
        d.moved = true
        window.kian.desk.dragMove()
      }}
      onPointerUp={() => {
        if (drag.current?.moved) {
          dragged.current = true
          window.kian.desk.moveEnd()
        }
        drag.current = null
      }}
      onPointerLeave={() => {
        setHovered(false)
        if (voiceState !== 'typing') window.kian.desk.setInteractive(false)
      }}
    >
      <KianWidget
        orientation={side ? 'vertical' : 'horizontal'}
        collapsed={resting}
        restWhileOpen={voiceOff}
        restIcon={
          <Mascot
            size={40}
            mood={voiceState === 'typing' ? 'look' : hovered ? 'excited' : desk.connection === 'offline' ? 'sleepy' : 'happy'}
          />
        }
        onRestClick={() => {
          if (dragged.current) return void (dragged.current = false)
          cue('listen')
          setVoiceState(voiceState === 'typing' ? 'idle' : 'typing')
        }}
        hint={
          desk.hotkey ? (
            <>
              Talk <b>{prettyHotkey(desk.hotkey, window.kian.platform)}</b>
            </>
          ) : undefined
        }
        voiceState={voiceState}
        getLevel={voice.getLevel}
        room={desk.deskRoom}
        message={desk.message}
        pending={desk.pending}
        queued={desk.queued}
        speaking={speaking}
        onTalk={talk}
        onRecord={() => {
          cue('listen')
          setVoiceState('recording')
        }}
        onStop={() => void finish()}
        onCancel={voice.cancel}
        onTypeSubmit={(t) => void send(t)}
        onTypeClose={() => setVoiceState('idle')}
        onChip={chip}
        onVoiceReply={(m) => {
          replyTo.current = m
          listen()
        }}
        onDismiss={(m) => void window.kian.desk.dismiss(m.id)}
      />
      {desk.connection === 'offline' && (
        <button className="widget-offline" onClick={() => window.kian.desk.openHub()}>
          Not connected to Switch · open Kian
        </button>
      )}
    </div>
  )
}
