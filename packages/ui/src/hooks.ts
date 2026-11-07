/*
 * Hooks the widget shares: useMicLevel (live loudness for the waveform),
 * useSpeak (read a card aloud) and usePrefersReducedMotion.
 */
import { useCallback, useEffect, useRef, useState } from 'react'

export type LevelSource = 'mic' | 'simulated' | 'off'

/**
 * Live mic loudness (0..1) for the waveform. Falls back to a simulated voice
 * when the mic is unavailable or `simulate` is set, so the prototype always moves.
 * The level is read through `getLevel()` every frame — no React state per frame.
 */
export function useMicLevel(active: boolean, { simulate = false } = {}) {
  const level = useRef(0)
  const streamRef = useRef<MediaStream | null>(null)
  const [source, setSource] = useState<LevelSource>('off')

  useEffect(() => {
    if (!active) {
      setSource('off')
      return
    }
    let raf = 0
    let cancelled = false
    let ctx: AudioContext | null = null

    const runSimulated = () => {
      setSource('simulated')
      let t = 0
      const tick = () => {
        t += 1
        // syllable-ish bursts: slow envelope × fast jitter
        const envelope = Math.max(0, Math.sin(t / 9) * 0.6 + Math.sin(t / 23) * 0.4)
        level.current = Math.min(1, envelope * (0.55 + Math.random() * 0.45))
        raf = requestAnimationFrame(tick)
      }
      tick()
    }

    if (simulate || !navigator.mediaDevices?.getUserMedia) {
      runSimulated()
    } else {
      navigator.mediaDevices
        .getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } })
        .then((stream) => {
          if (cancelled) return stream.getTracks().forEach((t) => t.stop())
          streamRef.current = stream
          ctx = new AudioContext()
          const analyser = ctx.createAnalyser()
          analyser.fftSize = 512
          ctx.createMediaStreamSource(stream).connect(analyser)
          const buf = new Float32Array(analyser.fftSize)
          setSource('mic')
          const tick = () => {
            analyser.getFloatTimeDomainData(buf)
            let sum = 0
            for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i]
            const rms = Math.sqrt(sum / buf.length)
            // speech RMS sits around 0.01–0.2; map to 0..1 with a soft knee
            level.current = Math.min(1, Math.pow(rms * 6, 0.7))
            raf = requestAnimationFrame(tick)
          }
          tick()
        })
        .catch(() => !cancelled && runSimulated())
    }

    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
      level.current = 0
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
      ctx?.close()
    }
  }, [active, simulate])

  const getLevel = useCallback(() => level.current, [])
  return { getLevel, source, stream: streamRef }
}

/** Reads text aloud with the system voice. Offline, works in Chrome and Electron. */
export function useSpeak(enabled: boolean) {
  const [speaking, setSpeaking] = useState(false)

  const speak = useCallback(
    (text: string) => {
      if (!enabled || typeof speechSynthesis === 'undefined') return
      speechSynthesis.cancel()
      const u = new SpeechSynthesisUtterance(text)
      u.rate = 1.05
      u.onstart = () => setSpeaking(true)
      u.onend = u.onerror = () => setSpeaking(false)
      speechSynthesis.speak(u)
    },
    [enabled],
  )

  const stop = useCallback(() => {
    if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel()
    setSpeaking(false)
  }, [])

  useEffect(() => {
    if (!enabled) stop()
  }, [enabled, stop])

  return { speak, stop, speaking }
}

export function usePrefersReducedMotion() {
  const [reduce, setReduce] = useState(false)
  useEffect(() => {
    const mq = matchMedia('(prefers-reduced-motion: reduce)')
    setReduce(mq.matches)
    const on = () => setReduce(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return reduce
}
