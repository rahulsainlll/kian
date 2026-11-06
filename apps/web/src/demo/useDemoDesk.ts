import { useCallback, useEffect, useRef, useState } from 'react'
import { useMicLevel, useSpeak, type Chip, type Nudge, type RoomMessage, type VoiceState } from '@kian/ui'
import { HISTORY, approvedSteps, briefItems, briefSteps, draftSteps, genericReply, meetingSteps, type Step } from './script'

/** A line in the mirrored chat log: what Mattermost / Telegram would show. */
export interface LogLine {
  id: string
  room: string
  author: string
  text: string
  replyTo?: string
  day?: 'yesterday'
  /** The agent message behind this line, so the chat can show it as an action card. */
  message?: RoomMessage
}

const ME = 'yukti'
const SEED: LogLine[] = HISTORY.map((h, i) => ({ id: `h${i}`, ...h }))
const MORNING: Nudge = { text: 'Morning, Yukti. Want your brief?', action: 'morning, Kian', dismiss: 'Later' }

/**
 * Drives <KianWidget> on the website with the scripted morning. The desktop app
 * replaces this hook with one that talks to Switch's Mattermost over IPC.
 */
export function useDemoDesk({ voiceOut, simulateMic }: { voiceOut: boolean; simulateMic: boolean }) {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle')
  const [queue, setQueue] = useState<RoomMessage[]>([])
  const [pending, setPending] = useState<{ author: string; room: string } | null>(null)
  const [nudge, setNudge] = useState<Nudge | null>(MORNING)
  const [log, setLog] = useState<LogLine[]>(SEED)
  const [replyRoom, setReplyRoom] = useState('kian-desk')
  // agent messages scheduled but not landed yet; autoplay waits for zero
  const [inFlight, setInFlight] = useState(0)

  const listening = voiceState === 'listening' || voiceState === 'recording'
  const mic = useMicLevel(listening, { simulate: simulateMic })
  const { speak, speaking, stop: stopSpeaking } = useSpeak(voiceOut)

  const timers = useRef<number[]>([])
  const recordStart = useRef(0)
  const replyTo = useRef<RoomMessage | null>(null)
  const recognition = useRef<ReturnType<typeof startRecognition>>(null)

  const later = (ms: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, ms))
  }

  const addLog = useCallback((line: Omit<LogLine, 'id'>) => {
    setLog((l) => [...l, { id: `l${l.length}-${Date.now()}`, ...line }])
  }, [])

  /** Agents "work": a skeleton card, then the message lands in the queue and the log. */
  const play = useCallback(
    (steps: Step[]) => {
      let at = 0
      setInFlight((n) => n + steps.length)
      steps.forEach((s) => {
        at += s.delay
        const showPending = s.delay >= 1000
        if (showPending) later(at - s.delay + 200, () => setPending({ author: s.message.author, room: s.message.room }))
        later(at, () => {
          setInFlight((n) => Math.max(0, n - 1))
          setPending(null)
          addLog({ room: s.message.room, author: s.message.author, text: s.message.text, message: s.message })
          // agent-to-agent hand-offs show in the log only; the widget surfaces what needs Yukti
          // the desk brief waits its turn; deal rooms and #approvals go next
          if (s.message.chips || s.message.voiceReply)
            setQueue((q) => (s.message.room === 'kian-desk' ? [...q, s.message] : [...q.slice(0, 1), s.message, ...q.slice(1)]))
        })
      })
    },
    [addLog],
  )

  const send = useCallback(
    (text: string, room = replyRoom) => {
      const parent = replyTo.current
      replyTo.current = null
      setReplyRoom('kian-desk')
      setVoiceState('sending')
      later(500, () => {
        addLog({ room, author: ME, text, replyTo: parent?.id })
        setVoiceState('sent')
        later(900, () => setVoiceState('idle'))
        if (parent) setQueue((q) => q.filter((m) => m.id !== parent.id))
        if (/morning/i.test(text)) {
          setNudge(null)
          play(briefSteps())
        } else play(genericReply(text))
      })
    },
    [addLog, play, replyRoom],
  )

  // ── pill ────────────────────────────────────────────────────────────────
  const talk = () => {
    if (voiceState === 'typing') return setVoiceState('idle')
    stopSpeaking()
    recognition.current = startRecognition()
    setVoiceState('listening')
  }

  const record = () => {
    recordStart.current = Date.now()
    setVoiceState('recording')
  }

  const stop = async () => {
    if (voiceState === 'recording') {
      const seconds = (Date.now() - recordStart.current) / 1000
      setVoiceState('sending')
      later(600, () => {
        addLog({ room: 'deal-kestrel', author: ME, text: `Meeting transcript · ${Math.round(seconds)}s recorded` })
        setVoiceState('sent')
        later(900, () => setVoiceState('idle'))
        play(meetingSteps(seconds))
      })
      return
    }
    const heard = (await recognition.current?.finish()) || 'Morning, Kian.'
    recognition.current = null
    send(heard)
  }

  const cancel = () => {
    recognition.current?.abort()
    recognition.current = null
    replyTo.current = null
    setVoiceState('idle')
  }

  // ── card ────────────────────────────────────────────────────────────────
  const chip = (m: RoomMessage, c: Chip) => {
    const reply = c.reply ?? c.label
    addLog({ room: m.room, author: ME, text: reply, replyTo: m.id })
    setQueue((q) => q.filter((x) => x.id !== m.id))
    stopSpeaking()
    if (c.label === 'go') play(briefItems())
    if (c.label === 'draft' && /Lumen/.test(m.text)) play(draftSteps())
    if (m.room === 'approvals') play(approvedSteps(c.label))
  }

  const voiceReply = (m: RoomMessage) => {
    replyTo.current = m
    setReplyRoom(m.room)
    talk()
  }

  const dismiss = (m: RoomMessage) => {
    stopSpeaking()
    setQueue((q) => q.filter((x) => x.id !== m.id))
  }

  const current = queue[0] ?? null

  // read each new card aloud once
  const spoken = useRef<string | null>(null)
  useEffect(() => {
    if (current && spoken.current !== current.id) {
      spoken.current = current.id
      speak(current.text)
    }
  }, [current, speak])

  const reset = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    stopSpeaking()
    setQueue([])
    setPending(null)
    setLog(SEED)
    setVoiceState('idle')
    setNudge(MORNING)
    setInFlight(0)
  }

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  return {
    /** Answer a message from anywhere (widget or chat): same reply, same room. */
    answer: chip,
    widget: {
      voiceState,
      getLevel: mic.getLevel,
      room: replyRoom,
      message: current,
      pending: current ? null : pending,
      queued: Math.max(0, queue.length - 1),
      speaking,
      nudge: current || pending ? null : nudge,
      onTalk: talk,
      onRecord: record,
      onStop: stop,
      onCancel: cancel,
      onTypeSubmit: (t: string) => send(t),
      onTypeClose: () => setVoiceState('idle'),
      onChip: chip,
      onVoiceReply: voiceReply,
      onDismiss: dismiss,
      onNudgeAction: () => send(MORNING.action),
      onNudgeDismiss: () => setNudge(null),
    },
    log,
    /** True while agents still have messages on the way or the pill is mid-send. */
    busy: inFlight > 0 || pending !== null || (voiceState !== 'idle' && voiceState !== 'typing'),
    micSource: mic.source,
    openTyping: () => setVoiceState('typing'),
    reset,
  }
}

/**
 * Browser speech-to-text for the website demo (Chrome/Safari). Electron has no
 * Web Speech backend, so the desktop app transcribes recorded audio instead.
 */
function startRecognition() {
  const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition
  if (!SR) return null
  const r = new SR()
  r.lang = 'en-US'
  r.interimResults = false
  r.continuous = true
  let text = ''
  let resolve: ((t: string) => void) | null = null
  r.onresult = (e: any) => {
    text = Array.from(e.results as ArrayLike<any>)
      .map((x) => x[0].transcript)
      .join(' ')
      .trim()
  }
  r.onend = () => resolve?.(text)
  r.onerror = () => resolve?.(text)
  try {
    r.start()
  } catch {
    return null
  }
  return {
    finish: () =>
      new Promise<string>((res) => {
        resolve = res
        r.stop()
        setTimeout(() => res(text), 1500) // never hang the pill
      }),
    abort: () => r.abort(),
  }
}
