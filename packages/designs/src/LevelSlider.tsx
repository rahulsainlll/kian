"use client"

import { Brain, CircleHelp } from "lucide-react"
import { useReducedMotion } from "motion/react"
import { Slider as SliderPrimitive } from "radix-ui"
import { type CSSProperties, type ReactNode, useEffect, useId, useRef } from "react"
import { cn } from "./utils"
import "./designs.css"
import { Tooltip } from "./Tooltip"
import { useControllable } from "./useControllable"

export type Level<T extends string = string> = {
  value: T
  label: string
  /** galaxy: the top tier. The fill becomes a living pixel dither and the thumb glows. */
  effect?: "galaxy"
}

export type LevelSliderProps<T extends string = string> = {
  /** The steps, lowest first. The header shows the current one's label. */
  levels: readonly Level<T>[]
  value?: T
  defaultValue?: T
  onValueChange?: (value: T) => void
  /** What is being chosen, e.g. "Answer depth". */
  title: string
  /** The two ends of the scale, e.g. "Quicker" and "Deeper". */
  startLabel?: string
  endLabel?: string
  /** A level to mark with a tick and a "Recommended" note under it. */
  recommended?: T
  recommendedLabel?: string
  /** Explains the scale, shown from the (?) button. */
  help?: ReactNode
  /** The thumb's glyph. A brain by default. */
  thumbIcon?: ReactNode
  disabled?: boolean
  className?: string
}

/**
 * A stepped slider for picking a level, like answer depth: named steps, the current one
 * in the header, a fill that warms toward the thumb, and an optional recommended mark.
 * A level with `effect: "galaxy"` turns the fill into an animated pixel dither.
 */
export function LevelSlider<T extends string = string>({
  levels,
  value,
  defaultValue,
  onValueChange,
  title,
  startLabel,
  endLabel,
  recommended,
  recommendedLabel = "Recommended",
  help,
  thumbIcon,
  disabled,
  className,
}: LevelSliderProps<T>) {
  const [current, setCurrent] = useControllable(
    value,
    defaultValue ?? levels[0]?.value,
    onValueChange,
  )
  const last = Math.max(1, levels.length - 1)
  const index = Math.max(
    0,
    levels.findIndex((level) => level.value === current),
  )
  const galaxy = levels[index]?.effect === "galaxy"
  const recommendedIndex = levels.findIndex((level) => level.value === recommended)
  // Where a step sits on the track: the thumb's center travels between half a thumb from each end
  const at = (i: number) => ({ "--ds-level-p": i / last }) as CSSProperties

  return (
    <div
      className={cn("ds-level", className)}
      data-disabled={disabled || undefined}
      data-first={index === 0 || undefined}
      data-effect={galaxy ? "galaxy" : undefined}
    >
      <div className="ds-level__head">
        <span className="ds-level__title">{title}</span>
        <span className="ds-level__current" aria-live="polite">
          {levels[index]?.label}
        </span>
        {help && (
          <Tooltip label={help} side="top">
            <button type="button" className="ds-level__help" aria-label={`About ${title}`}>
              <CircleHelp size={18} strokeWidth={1.75} aria-hidden="true" />
            </button>
          </Tooltip>
        )}
      </div>

      {(startLabel || endLabel) && (
        <div className="ds-level__ends" aria-hidden>
          <span>{startLabel}</span>
          <span>{endLabel}</span>
        </div>
      )}

      <SliderPrimitive.Root
        className="ds-level__track"
        min={0}
        max={last}
        step={1}
        value={[index]}
        onValueChange={([i]) => {
          const next = levels[i]
          if (next) setCurrent(next.value)
        }}
        disabled={disabled}
        style={{ "--ds-level-value": index / last } as CSSProperties}
      >
        <SliderPrimitive.Track className="ds-level__rail">
          <span className="ds-level__fill" />
          <GalaxyDither active={galaxy} reach={index / last} />
        </SliderPrimitive.Track>
        {levels.map((level, i) =>
          i === index ? null : (
            <span
              key={level.value}
              className="ds-level__step"
              data-recommended={i === recommendedIndex || undefined}
              style={at(i)}
              aria-hidden
            />
          ),
        )}
        <SliderPrimitive.Thumb
          className="ds-level__thumb"
          aria-label={title}
          aria-valuetext={levels[index]?.label}
        >
          <span className="ds-level__glow" aria-hidden />
          <GalaxyRays />
          {thumbIcon ?? (
            <>
              <BrainFill />
              <Brain size={42} strokeWidth={1.5} aria-hidden="true" />
            </>
          )}
        </SliderPrimitive.Thumb>
      </SliderPrimitive.Root>

      {recommendedIndex >= 0 && (
        <div className="ds-level__notes">
          <span className="ds-level__note" style={at(recommendedIndex)}>
            {recommendedLabel}
          </span>
        </div>
      )}
    </div>
  )
}

/**
 * The solid body under lucide's Brain. Its outline is arcs of eight circles, so filling
 * those circles (plus the middle) fits exactly inside the strokes and closes the gaps
 * lucide leaves open. The fill is a gradient whose stops are CSS variables: both the
 * thumb color normally, periwinkle to pink on the galaxy level, where sparkles twinkle on it.
 */
const SPARKS = [
  { x: 8, y: 8, r: 0.55, d: 0 },
  { x: 15.6, y: 8.6, r: 0.6, d: 0.5 },
  { x: 10.2, y: 14.2, r: 0.45, d: 1.1 },
  { x: 16.6, y: 15.2, r: 0.5, d: 0.3 },
  { x: 13.6, y: 5.8, r: 0.4, d: 0.8 },
  { x: 6.8, y: 12.6, r: 0.4, d: 1.4 },
  { x: 14.2, y: 12.1, r: 0.35, d: 0.2 },
  { x: 18.4, y: 11, r: 0.35, d: 1 },
]

function BrainFill() {
  // Only id-safe characters: url(#…) can trip on the «» or : React puts in useId
  const gradient = `brain-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`
  return (
    <svg viewBox="0 0 24 24" width="42" height="42" aria-hidden="true">
      <defs>
        <linearGradient id={gradient} x1="0" y1="0.2" x2="1" y2="0.8">
          <stop offset="0" className="ds-level__brain-from" />
          <stop offset="0.3" className="ds-level__brain-from" />
          <stop offset="1" className="ds-level__brain-to" />
        </linearGradient>
      </defs>
      <g fill={`url(#${gradient})`}>
        <circle cx="9" cy="5" r="3" />
        <circle cx="15" cy="5" r="3" />
        <circle cx="7" cy="9" r="4" />
        <circle cx="17" cy="9" r="4" />
        <circle cx="6" cy="14" r="4" />
        <circle cx="18" cy="14" r="4" />
        <circle cx="8" cy="18" r="4" />
        <circle cx="16" cy="18" r="4" />
        <rect x="9" y="5" width="6" height="13" />
      </g>
      {SPARKS.map((spark) => (
        <circle
          key={`${spark.x}-${spark.y}`}
          className="ds-level__spark"
          cx={spark.x}
          cy={spark.y}
          r={spark.r}
          style={{ animationDelay: `${spark.d}s` }}
        />
      ))}
    </svg>
  )
}

/**
 * Rays of dots around the thumb on the galaxy level. They stay put and mostly steady; only
 * the last few dots at each ray's outer end flicker, one after another, so the tip extends and
 * retracts a little. Speeds and offsets differ per ray, so neighbors are never in step. The
 * timing lives in CSS (one keyframe per tip position, see .ds-level__ray-dot).
 */
const RAYS = 16
const MAX_DOTS = 8
/** How many dots at the outer end of each ray flicker; the rest are steady. */
const TIP_DOTS = 3
const round = (n: number) => Math.round(n * 100) / 100
const RAY_SET = Array.from({ length: RAYS }, (_, i) => {
  const angle = (i / RAYS) * Math.PI * 2
  // Deterministic spread (server and client agree): 5 to 8 dots, 1.1s to 2s a cycle
  const dots = 5 + ((i * 3) % 4)
  const duration = round(1.1 + (((i * 7) % 9) / 8) * 0.9)
  const delay = round(-(((i * 5) % 11) / 11) * duration)
  return { angle, dots, duration, delay }
})

function GalaxyRays() {
  // The brain's gradient, laid across the whole burst in the same direction, so the rays
  // and the brain read as one glow (stops follow --ds-brain-from / --ds-brain-to)
  const gradient = `rays-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`
  return (
    <svg className="ds-level__rays" viewBox="-50 -50 100 100" aria-hidden="true">
      <defs>
        <linearGradient
          id={gradient}
          gradientUnits="userSpaceOnUse"
          x1="-50"
          y1="-20"
          x2="50"
          y2="20"
        >
          <stop offset="0" className="ds-level__brain-from" />
          <stop offset="0.3" className="ds-level__brain-from" />
          <stop offset="1" className="ds-level__brain-to" />
        </linearGradient>
      </defs>
      <g fill={`url(#${gradient})`}>
        {RAY_SET.map((ray) => (
          <g
            key={ray.angle}
            style={
              {
                "--ray-duration": `${ray.duration}s`,
                "--ray-delay": `${ray.delay}s`,
              } as CSSProperties
            }
          >
            {Array.from({ length: Math.min(ray.dots, MAX_DOTS) }, (_, k) => {
              const r = 22 + k * 3.8
              // The last few dots are the tip: only they flicker; the rest hold steady
              const tip = k - (ray.dots - TIP_DOTS)
              return (
                <circle
                  // biome-ignore lint/suspicious/noArrayIndexKey: dots are positions along the ray
                  key={k}
                  className="ds-level__ray-dot"
                  data-k={k}
                  data-tip={tip >= 0 ? tip : undefined}
                  cx={round(Math.cos(ray.angle) * r)}
                  cy={round(Math.sin(ray.angle) * r)}
                  // Biggest beside the brain, shrinking toward the tip
                  r={round(1.2 - k * 0.09)}
                />
              )
            })}
          </g>
        ))}
      </g>
    </svg>
  )
}

const PALETTE = [
  "--color-ds-galaxy-deep",
  "--color-ds-galaxy-violet",
  "--color-ds-galaxy-orchid",
  "--color-ds-galaxy-pink",
  "--color-ds-galaxy-sky",
  "--color-ds-galaxy-star",
]
const CELL = 5
const PITCH = 7
/** Re-rolls of the dither pattern per second: low enough to read as pixels shimmering. */
const FPS = 15

const hash = (x: number, y: number) => {
  const s = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453
  return s - Math.floor(s)
}

/**
 * The galaxy fill: a grid of small squares, sparse at the left and dense at the thumb. Each
 * cell twinkles at its own rate, a bright band flows toward the thumb, and the dither
 * threshold re-rolls every frame, so the field never sits still. Holds a single frame
 * under reduced motion, and stops whenever it isn't the active level or is off screen.
 */
function GalaxyDither({ active, reach }: { active: boolean; reach: number }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const el = canvas.current
    const ctx = el?.getContext("2d")
    if (!el || !ctx || !active) return

    const styles = getComputedStyle(el)
    const colors = PALETTE.map((name) => styles.getPropertyValue(name).trim())
    const thumb = Number.parseFloat(styles.getPropertyValue("--ds-level-t")) || 32
    let width = 0
    let height = 0

    const size = () => {
      const dpr = window.devicePixelRatio || 1
      width = el.clientWidth
      height = el.clientHeight
      el.width = Math.round(width * dpr)
      el.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const draw = (t: number) => {
      ctx.clearRect(0, 0, width, height)
      const end = thumb / 2 + reach * (width - thumb)
      const cols = Math.ceil(end / PITCH)
      const rows = Math.floor(height / PITCH)
      const top = (height - rows * PITCH + (PITCH - CELL)) / 2
      const roll = Math.floor(t * FPS)
      const band = ((t * 0.35) % 1.4) - 0.2
      for (let c = 0; c < cols; c++) {
        const d = (c * PITCH) / end
        // Never empty: a sparse floor at the left, near solid at the thumb
        const density = 0.32 + 0.68 * d ** 0.8
        for (let r = 0; r < rows; r++) {
          const h = hash(c, r)
          const twinkle = 0.5 + 0.5 * Math.sin(t * (1.2 + h * 3.5) + h * 40)
          const flow = Math.exp(-(((d - band) / 0.1) ** 2))
          const level = density * (0.35 + 0.65 * twinkle) + flow * 0.55 * Math.sqrt(density)
          if (hash(c + roll * 7.13, r + roll * 3.71) > level) continue
          const tier = Math.min(colors.length - 1, Math.floor(d * 3.6 + h * 2.6 + flow * 1.8))
          // Dim far from the thumb, full strength beside it
          ctx.globalAlpha = Math.min(1, 0.18 + level * 0.6 + d * 0.3)
          ctx.fillStyle = colors[tier] || colors[0]
          ctx.fillRect(c * PITCH, top + r * PITCH, CELL, CELL)
        }
      }
      ctx.globalAlpha = 1
    }

    size()
    const observer = new ResizeObserver(size)
    observer.observe(el)

    if (reduced) {
      draw(1.7)
      return () => observer.disconnect()
    }

    // Only animate while on screen
    let visible = true
    const seen = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
    })
    seen.observe(el)

    let frame = 0
    let lastDraw = 0
    const start = performance.now()
    const tick = () => {
      frame = requestAnimationFrame(tick)
      // The clock, not rAF's timestamp: that one can stall while frames still fire
      const now = performance.now()
      if (!visible || now - lastDraw < 1000 / FPS) return
      lastDraw = now
      draw((now - start) / 1000)
    }
    frame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      seen.disconnect()
    }
  }, [active, reach, reduced])

  // Decorative: an empty canvas has no accessible content, so screen readers pass over it
  return <canvas ref={canvas} className="ds-level__galaxy" />
}
