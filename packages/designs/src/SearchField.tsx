/*
 * SearchField: a search input whose clear button dissolves the text.
 */
"use client"

import { type ComponentProps, useEffect, useRef } from "react"
import { cn } from "./utils"
import "./designs.css"
import { Icon } from "./Icon"
import { useControllable } from "./useControllable"

export type SearchFieldProps = Omit<
  ComponentProps<"input">,
  "value" | "defaultValue" | "onChange" | "type" | "size"
> & {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** md: matches Field (40px). lg: the poster's search (48px). */
  size?: "md" | "lg"
  /** Show a clear button once there is text. On by default. */
  clearable?: boolean
}

// The clear dissolve: the old text falls 12px and blurs out while the placeholder falls in
// from above, and a soft streak flares under each word. Timings from the original.
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)"
const TEXT_MS = 400
const CLEAR_MS = 1000
const FLY_PX = 12
const BLUR_PX = 2
const GLOW_DELAY_MS = 50
const GLOW_PEAK_AT = 0.15
const GLOW_OPACITY = 0.42
const GLOW_SPREAD = 1.5

let measure: CanvasRenderingContext2D | null = null

/**
 * The streak under the words: a few soft ellipses at the bottom edge per word, placed by
 * measuring each word in the input's own font (and its scroll), tinted with the ink token.
 */
function glowLayers(text: string, input: HTMLInputElement, width: number) {
  measure ??= document.createElement("canvas").getContext("2d")
  if (!measure || !width) return ""
  const style = getComputedStyle(input)
  measure.font = style.font
  if ("letterSpacing" in measure) measure.letterSpacing = style.letterSpacing
  const layers: string[] = []
  let x = -input.scrollLeft
  for (const segment of text.split(/(\s+)/)) {
    const w = measure.measureText(segment).width
    if (segment.trim()) {
      const cx = x + w / 2
      const hw = Math.max(w * 0.45, 8) * GLOW_SPREAD
      const stops = [
        { dx: 0, rw: hw * 0.8, rh: 7, a: 22 },
        { dx: hw * 0.45, rw: hw * 0.55, rh: 8, a: 18 },
        { dx: -hw * 0.4, rw: hw * 0.65, rh: 6, a: 16 },
        { dx: hw * 0.15, rw: hw * 0.9, rh: 5, a: 14 },
      ]
      for (const s of stops) {
        const at = (((cx + s.dx) / width) * 100).toFixed(2)
        layers.push(
          `radial-gradient(ellipse ${Math.max(s.rw, 2).toFixed(1)}px ${s.rh}px at ${at}% 100%, color-mix(in srgb, var(--ds-text-strong) ${s.a}%, transparent), transparent)`,
        )
      }
    }
    x += w
  }
  return layers.join(", ")
}

/**
 * A search bar: the glass, the input, and a clear button. Clearing (the × or Escape)
 * dissolves the text: it falls and blurs out as the placeholder falls in. Reduced motion
 * clears at once.
 */
export function SearchField({
  value,
  defaultValue = "",
  onValueChange,
  size = "md",
  clearable = true,
  placeholder = "Search",
  className,
  onKeyDown,
  "aria-label": ariaLabel = "Search",
  ...props
}: SearchFieldProps) {
  const [current, setCurrent] = useControllable(value, defaultValue, onValueChange)
  const input = useRef<HTMLInputElement>(null)
  const field = useRef<HTMLDivElement>(null)
  const mirror = useRef<HTMLSpanElement>(null)
  const ghost = useRef<HTMLSpanElement>(null)
  const glow = useRef<HTMLSpanElement>(null)
  const running = useRef<Animation[]>([])
  const lg = size === "lg"

  // Ends a dissolve now: drops its animations and puts every layer back at rest
  const settle = () => {
    for (const animation of running.current) animation.cancel()
    running.current = []
    if (field.current) delete field.current.dataset.clearing
    if (mirror.current) mirror.current.textContent = ""
    if (glow.current) glow.current.style.background = ""
  }

  // Unmounting mid-dissolve: stop its animations
  useEffect(
    () => () => {
      for (const animation of running.current) animation.cancel()
    },
    [],
  )

  const clear = () => {
    const el = input.current
    const wrap = field.current
    const text = current
    if (!text) return
    settle()
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduced || !el || !wrap || !mirror.current || !ghost.current || !glow.current) {
      setCurrent("")
      return
    }

    // The mirror takes the old text, exactly where the input drew it (scroll included)
    const line = mirror.current
    line.textContent = text
    line.style.transform = `translateX(${-el.scrollLeft}px)`
    glow.current.style.background = glowLayers(text, el, wrap.clientWidth)
    wrap.dataset.clearing = ""
    el.value = ""
    setCurrent("")

    const timing = { duration: TEXT_MS, easing: EASE, fill: "forwards" as const }
    const glowStart = GLOW_DELAY_MS / CLEAR_MS
    running.current = [
      // Old text falls out
      line.parentElement?.animate(
        [
          { transform: "translateY(0)", opacity: 1, filter: "blur(0)" },
          { transform: `translateY(${FLY_PX}px)`, opacity: 0, filter: `blur(${BLUR_PX}px)` },
        ],
        timing,
      ),
      // Placeholder falls in from above
      ghost.current.animate(
        [
          { transform: `translateY(${-FLY_PX}px)`, opacity: 0.9, filter: `blur(${BLUR_PX}px)` },
          { transform: "translateY(0)", opacity: 1, filter: "blur(0)" },
        ],
        timing,
      ),
      // The streak holds, flares to its peak, then fades over the full clear
      glow.current.animate(
        [
          { opacity: 0, offset: 0 },
          { opacity: 0, offset: glowStart },
          { opacity: GLOW_OPACITY, offset: glowStart + (1 - glowStart) * GLOW_PEAK_AT },
          { opacity: 0, offset: 1 },
        ],
        { duration: CLEAR_MS, easing: "linear", fill: "forwards" },
      ),
    ].filter((a): a is Animation => !!a)

    const run = running.current
    Promise.all(run.map((a) => a.finished))
      .then(() => {
        if (running.current === run) settle()
      })
      .catch(() => undefined)
  }

  return (
    <div
      className={cn("ds-search ds-surface", lg && "ds-poster", className)}
      data-size={size}
      data-filled={current ? true : undefined}
    >
      <Icon name="search" size={lg ? 18 : 15} />
      <div ref={field} className="ds-search__field">
        <input
          ref={input}
          type="search"
          className="ds-search__input"
          value={current}
          onChange={(event) => {
            // Typing mid-dissolve: the new text wins, at once
            if (running.current.length) settle()
            setCurrent(event.target.value)
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape" && current) {
              event.preventDefault()
              clear()
            }
            onKeyDown?.(event)
          }}
          placeholder={placeholder}
          aria-label={ariaLabel}
          {...props}
        />
        <span className="ds-search__layer ds-search__mirror" aria-hidden>
          <span ref={mirror} />
        </span>
        <span ref={ghost} className="ds-search__layer ds-search__placeholder" aria-hidden>
          {placeholder}
        </span>
        <span ref={glow} className="ds-search__glow" aria-hidden />
      </div>
      {clearable && (
        <button
          type="button"
          className="ds-search__clear"
          data-shown={current ? true : undefined}
          // Out of reach while there's nothing to clear: no focus, nothing read out
          inert={!current}
          // Keep focus in the input: the press would otherwise move it to the button
          onPointerDown={(event) => {
            if (document.activeElement === input.current) event.preventDefault()
          }}
          onClick={() => {
            clear()
            input.current?.focus({ preventScroll: true })
          }}
          aria-label="Clear search"
        >
          <Icon name="close" size={lg ? 12 : 10} stroke={2} />
        </button>
      )}
    </div>
  )
}
