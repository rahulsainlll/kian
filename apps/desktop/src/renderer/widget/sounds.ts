/*
 * Small sounds for the widget, made with Web Audio so there are no files to
 * ship: a soft rise when Kian starts listening, a fall when it stops, a tick
 * when something is sent, and a quiet two-note chime when a card arrives.
 * Each is under 200ms and quiet, and all of them are off with the setting.
 */
type Cue = 'listen' | 'stop' | 'sent' | 'card' | 'approve'

const NOTES: Record<Cue, [number, number][]> = {
  // [frequency in Hz, start offset in s]
  listen: [[660, 0], [880, 0.07]],
  stop: [[740, 0], [554, 0.07]],
  sent: [[1320, 0]],
  card: [[988, 0], [1319, 0.09]],
  approve: [[523, 0], [659, 0.06], [784, 0.12]],
}

let ctx: AudioContext | null = null

export function play(cue: Cue, volume = 0.05) {
  try {
    ctx ??= new AudioContext()
    const now = ctx.currentTime
    for (const [freq, at] of NOTES[cue]) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0, now + at)
      gain.gain.linearRampToValueAtTime(volume, now + at + 0.012)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + at + 0.16)
      osc.connect(gain).connect(ctx.destination)
      osc.start(now + at)
      osc.stop(now + at + 0.18)
    }
  } catch {
    // No audio device: sounds are a nicety, never an error.
  }
}
