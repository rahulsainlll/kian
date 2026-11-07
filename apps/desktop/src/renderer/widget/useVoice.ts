/*
 * useVoice: the pill's microphone. While listening (talking to Kian) or
 * recording (a call for kian-scribe) it records with MediaRecorder on the
 * same stream the waveform reads, and stop() hands back the audio. The level
 * for the waveform comes from @kian/ui's useMicLevel.
 */
import { useMicLevel, type VoiceState } from '@kian/ui'
import { useCallback, useEffect, useRef, useState } from 'react'

export interface Recording {
  audio: ArrayBuffer
  mime: string
  seconds: number
}

export function useVoice() {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle')
  const active = voiceState === 'listening' || voiceState === 'recording'
  const mic = useMicLevel(active)
  const recorder = useRef<MediaRecorder | null>(null)
  const chunks = useRef<Blob[]>([])
  const startedAt = useRef(0)

  // The mic stream arrives asynchronously; start recording as soon as it does.
  useEffect(() => {
    if (!active) return
    const wait = setInterval(() => {
      const stream = mic.stream.current
      if (!stream || recorder.current) return
      clearInterval(wait)
      chunks.current = []
      const rec = new MediaRecorder(stream)
      rec.ondataavailable = (e) => e.data.size && chunks.current.push(e.data)
      rec.start(250)
      recorder.current = rec
      startedAt.current = Date.now()
    }, 60)
    return () => clearInterval(wait)
  }, [active, mic.stream])

  /** Stop and return what was said, or null when nothing was captured. */
  const stop = useCallback(async (): Promise<Recording | null> => {
    const rec = recorder.current
    recorder.current = null
    if (!rec || rec.state === 'inactive') return null
    const done = new Promise<void>((resolve) => (rec.onstop = () => resolve()))
    rec.stop()
    await done
    const blob = new Blob(chunks.current, { type: rec.mimeType })
    if (!blob.size) return null
    return { audio: await blob.arrayBuffer(), mime: rec.mimeType, seconds: (Date.now() - startedAt.current) / 1000 }
  }, [])

  const cancel = useCallback(() => {
    const rec = recorder.current
    recorder.current = null
    if (rec && rec.state !== 'inactive') rec.stop()
    setVoiceState('idle')
  }, [])

  return { voiceState, setVoiceState, getLevel: mic.getLevel, stop, cancel }
}
