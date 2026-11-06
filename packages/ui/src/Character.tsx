import { useEffect, useRef, useState } from 'react'

/**
 * Kian's characters: a blue four-petal flower (and friends) with a face. Its eyes carry the
 * mood of the moment, from the eye set in the brand board. In `look` the
 * pupils follow the pointer (written to CSS variables, no re-render).
 */
export type Mood = 'look' | 'happy' | 'done' | 'excited' | 'surprised' | 'sleepy' | 'oops' | 'wink'

/** The cast. Each agent is a shape: kian the flower, kian-scribe the speech bubble, kian-studio the sun. */
export type Shape = 'flower' | 'bubble' | 'sun' | 'blob'

export const CAST: Record<string, { shape: Shape; color: string }> = {
  kian: { shape: 'flower', color: '#3d7bf2' },
  'kian-scribe': { shape: 'bubble', color: '#19b86b' },
  'kian-studio': { shape: 'sun', color: '#ff8a1f' },
}

const LINES: { text: string; mood: Mood }[] = [
  { text: 'Morning!', mood: 'happy' },
  { text: 'Agents draft. People send.', mood: 'wink' },
  { text: 'Hold to approve.', mood: 'excited' },
  { text: 'I never hit send.', mood: 'done' },
  { text: 'Say “morning, Kian”.', mood: 'look' },
]

export function Mascot({
  size,
  mood = 'look',
  shape = 'flower',
  color = '#3d7bf2',
  talk = false,
}: {
  /** px. Without it, Kian is 1em and scales with the text around it. */
  size?: number
  mood?: Mood
  shape?: Shape
  color?: string
  talk?: boolean
}) {
  const [line, setLine] = useState<number | null>(null)
  const shown = line !== null ? LINES[line].mood : mood

  const face = <Character size={size} mood={shown} shape={shape} color={color} />
  if (!talk) return face

  return (
    <button className="mascot-btn" aria-label="Say hi to Kian" onClick={() => setLine((l) => ((l ?? -1) + 1) % LINES.length)}>
      {face}
      <Bubble text={line !== null ? LINES[line].text : null} onDone={() => setLine(null)} />
    </button>
  )
}

function Bubble({ text, onDone }: { text: string | null; onDone: () => void }) {
  useEffect(() => {
    if (text === null) return
    const t = setTimeout(onDone, 2200)
    return () => clearTimeout(t)
  }, [text, onDone])
  return (
    <span className="mascot__bubble" data-show={text !== null || undefined}>
      {text ?? LINES[0].text}
    </span>
  )
}

function Character({ size, mood, shape, color }: { size?: number; mood: Mood; shape: Shape; color: string }) {
  const ref = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || mood !== 'look' || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect()
        const dx = e.clientX - (r.left + r.width / 2)
        const dy = e.clientY - (r.top + r.height / 2)
        const d = Math.hypot(dx, dy) || 1
        const reach = Math.min(1, d / 300) * 3.2 // viewBox units
        el.style.setProperty('--px', `${(dx / d) * reach}px`)
        el.style.setProperty('--py', `${(dy / d) * reach}px`)
      })
    }
    addEventListener('pointermove', onMove)
    return () => {
      removeEventListener('pointermove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [mood])

  return (
    <svg
      ref={ref}
      className="mascot"
      data-mood={mood}
      viewBox="0 0 100 100"
      width={size}
      height={size}
      aria-hidden
      style={{ ...(size ? null : { width: '1em', height: '1em' }), ['--blink-delay' as string]: blinkDelay(shape + color) }}
    >
      <Body shape={shape} color={color} />
      <g className="mascot__face" fill="none" stroke="#111" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round">
        <Eyes mood={mood} />
        <Mouth mood={mood} />
      </g>
    </svg>
  )
}

/** A stable offset per character, so a page of faces never blinks in unison. */
function blinkDelay(seed: string) {
  let h = 0
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) | 0
  return `${-(Math.abs(h) % 5200)}ms`
}

function Body({ shape, color }: { shape: Shape; color: string }) {
  switch (shape) {
    case 'flower':
      return (
        <g fill={color}>
          <circle cx="31" cy="31" r="25" />
          <circle cx="69" cy="31" r="25" />
          <circle cx="31" cy="69" r="25" />
          <circle cx="69" cy="69" r="25" />
          <circle cx="50" cy="50" r="30" />
        </g>
      )
    case 'bubble':
      return <path fill={color} d="M22 10 H78 A18 18 0 0 1 96 28 V64 A18 18 0 0 1 78 82 H44 L26 96 L30 82 H22 A18 18 0 0 1 4 64 V28 A18 18 0 0 1 22 10 Z" />
    case 'sun':
      return <polygon fill={color} points={sunPoints()} />
    case 'blob':
      return <path fill={color} d="M50 6 C74 4 96 22 94 48 C92 74 74 96 48 94 C22 92 4 74 6 48 C8 24 26 8 50 6 Z" />
  }
}

/** A 14-ray sun with soft, chunky rays. */
function sunPoints() {
  const pts: string[] = []
  const n = 14
  for (let i = 0; i < n * 2; i++) {
    const a = (Math.PI * i) / n - Math.PI / 2
    const r = i % 2 === 0 ? 48 : 38
    pts.push(`${(50 + r * Math.cos(a)).toFixed(1)},${(50 + r * Math.sin(a)).toFixed(1)}`)
  }
  return pts.join(' ')
}

function Eyes({ mood }: { mood: Mood }) {
  switch (mood) {
    case 'look':
    case 'surprised': {
      // eyes from the brand board: tall white ovals, oval pupils that wander
      const ry = mood === 'surprised' ? 12 : 10.5
      return (
        <g className="mascot__eyes">
          <ellipse cx="39" cy="45" rx="7.5" ry={ry} fill="#fff" stroke="none" />
          <ellipse cx="61" cy="45" rx="7.5" ry={ry} fill="#fff" stroke="none" />
          <g className="mascot__pupils" fill="#111" stroke="none">
            <ellipse cx="40" cy="46" rx={mood === 'surprised' ? 3.2 : 4.4} ry={mood === 'surprised' ? 4.4 : 7} />
            <ellipse cx="62" cy="46" rx={mood === 'surprised' ? 3.2 : 4.4} ry={mood === 'surprised' ? 4.4 : 7} />
          </g>
        </g>
      )
    }
    case 'happy':
      return (
        <g className="mascot__eyes" fill="#111" stroke="none">
          <ellipse cx="42" cy="44" rx="3.6" ry="6.4" />
          <ellipse cx="58" cy="44" rx="3.6" ry="6.4" />
        </g>
      )
    case 'done':
      return <path d="M33 47 Q39 39 45 47 M55 47 Q61 39 67 47" />
    case 'excited':
      return <path d="M34 39 L43 45 L34 51 M66 39 L57 45 L66 51" />
    case 'sleepy':
      return <path d="M33 45 H45 M55 45 H67" />
    case 'oops':
      return <path d="M34 40 L44 50 M44 40 L34 50 M56 40 L66 50 M66 40 L56 50" />
    case 'wink':
      return (
        <>
          <ellipse cx="42" cy="44" rx="3.6" ry="6.4" fill="#111" stroke="none" />
          <path d="M53 45 Q59 39 65 45" />
        </>
      )
  }
}

function Mouth({ mood }: { mood: Mood }) {
  switch (mood) {
    case 'look':
    case 'wink':
      return null
    case 'surprised':
      return <ellipse cx="50" cy="64" rx="4.5" ry="5.5" fill="#111" stroke="none" />
    case 'excited':
      return <path d="M38 58 Q50 74 62 58 Z" fill="#111" />
    case 'oops':
      return <path d="M40 64 Q50 59 60 64" />
    case 'sleepy':
      return <path d="M44 63 Q50 66 56 63" />
    default:
      return <path d="M36 58 Q50 72 64 58" />
  }
}
