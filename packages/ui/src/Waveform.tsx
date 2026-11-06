import { useEffect, useRef } from 'react'
import type { Orientation } from './types'

interface WaveformProps {
  getLevel: () => number
  bars?: number
  orientation?: Orientation
  active?: boolean
}

/**
 * Scrolling loudness history. Newest sample enters at the end; bars are
 * written straight to `style.transform` each frame (no re-render).
 */
export function Waveform({ getLevel, bars = 24, orientation = 'horizontal', active = true }: WaveformProps) {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = root.current
    if (!el) return
    const nodes = Array.from(el.children) as HTMLElement[]
    const history = new Array(bars).fill(0)
    const axis = orientation === 'horizontal' ? 'scaleY' : 'scaleX'
    let raf = 0
    let frame = 0

    const tick = () => {
      // sample every 3rd frame (~20/s) so the motion reads as speech, not noise
      if (frame++ % 3 === 0) {
        history.shift()
        history.push(active ? getLevel() : 0)
        for (let i = 0; i < bars; i++) {
          nodes[i].style.transform = `${axis}(${0.12 + history[i] * 0.88})`
        }
      }
      raf = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(raf)
  }, [getLevel, bars, orientation, active])

  return (
    <div className="k-wave" data-orientation={orientation} ref={root} aria-hidden>
      {Array.from({ length: bars }, (_, i) => (
        <span key={i} className="k-wave__bar" />
      ))}
    </div>
  )
}
