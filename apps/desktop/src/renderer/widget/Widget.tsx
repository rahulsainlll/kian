/*
 * The desktop widget: the shared KianWidget, fed by the desk in the main
 * process. The hotkey or the mic starts listening; stopping transcribes and
 * posts to the desk room. With no transcription set up, the type bar opens,
 * so Wispr Flow or the system's dictation can type instead. The window only
 * takes clicks while the pointer is over the pill or its card.
 */
import { KianWidget, useSpeak, type Chip, type RoomMessage } from '@kian/ui'
import { useEffect, useRef, useState } from 'react'
import type { DeskState } from '../../shared/types'
import { useVoice } from './useVoice'

const EMPTY: DeskState = { message: null, queued: 0, pending: null, connection: 'connecting', deskRoom: 'kian-desk' }

export function Widget() {
  const [desk, setDesk] = useState<DeskState>(EMPTY)
  const [speakOn, setSpeakOn] = useState(false)
  const voice = useVoice()
  const { speak, speaking, stop: stopSpeaking } = useSpeak(speakOn)
  const spoken = useRef<string | null>(null)
  const replyTo = useRef<RoomMessage | null>(null)
  const { voiceState, setVoiceState } = voice

  useEffect(() => {
    void window.kian.desk.state().then((s) => s && setDesk(s))
    void window.kian.hub.settings().then((s) => setSpeakOn(s.speak))
    return window.kian.desk.onState(setDesk)
  }, [])

  // Read each new card aloud once, when voice-out is on.
  useEffect(() => {
    const m = desk.message
    if (m && spoken.current !== m.id) {
      spoken.current = m.id
      speak(m.text)
    }
  }, [desk.message, speak])

  // Take clicks while typing, so the type bar can be focused.
  useEffect(() => {
    if (voiceState === 'typing') window.kian.desk.setInteractive(true)
  }, [voiceState])

  const flash = (text: string) => {
    setVoiceState('sent')
    setTimeout(() => setVoiceState('idle'), 900)
    return text
  }

  const send = async (text: string) => {
    const target = replyTo.current
    replyTo.current = null
    setVoiceState('sending')
    if (target) await window.kian.desk.answer(target.id, text)
    else await window.kian.desk.say(text)
    flash(text)
  }

  const finish = async () => {
    const meeting = voiceState === 'recording'
    const rec = await voice.stop()
    if (!rec) return setVoiceState('idle')
    setVoiceState('sending')
    const text = await window.kian.desk.transcribe(rec.audio, rec.mime).catch(() => null)
    if (!text) return setVoiceState('typing') // no transcription set up: type or dictate instead
    if (meeting) return send(`Transcript of a ${Math.round(rec.seconds / 60) || 1} minute call, for @kian-scribe:\n\n${text}`)
    return send(text)
  }

  const talk = () => {
    if (voiceState === 'typing') return setVoiceState('idle')
    if (voiceState === 'listening' || voiceState === 'recording') return void finish()
    stopSpeaking()
    setVoiceState('listening')
  }

  useEffect(() => window.kian.desk.onHotkey(talk))

  const chip = (m: RoomMessage, c: Chip) => void window.kian.desk.answer(m.id, c.reply ?? c.label)

  return (
    <div
      className="widget-stage"
      data-connection={desk.connection}
      onPointerEnter={() => window.kian.desk.setInteractive(true)}
      onPointerLeave={() => voiceState !== 'typing' && window.kian.desk.setInteractive(false)}
    >
      <KianWidget
        voiceState={voiceState}
        getLevel={voice.getLevel}
        room={desk.deskRoom}
        message={desk.message}
        pending={desk.pending}
        queued={desk.queued}
        speaking={speaking}
        onTalk={talk}
        onRecord={() => setVoiceState('recording')}
        onStop={() => void finish()}
        onCancel={voice.cancel}
        onTypeSubmit={(t) => void send(t)}
        onTypeClose={() => setVoiceState('idle')}
        onChip={chip}
        onVoiceReply={(m) => {
          replyTo.current = m
          setVoiceState('listening')
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
