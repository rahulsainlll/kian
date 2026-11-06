"use client"

import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import {
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  useEffect,
  useRef,
} from "react"
import { cn } from "./utils"
import "./designs.css"
import { Icon } from "./Icon"
import { useControllable } from "./useControllable"

export type StepperProps = {
  label: string
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  min?: number
  max?: number
  step?: number
  className?: string
}

type Roll = { d: number; instant: boolean }

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))

// Hold a key: one step at once, then after a pause it repeats, quickening to a floor
const HOLD_DELAY = 400
const HOLD_START = 120
const HOLD_FLOOR = 50
const HOLD_EASE = 0.85

/**
 * Gap − 24 +: at the control height (40px). The digits roll with a pointer change, kept short
 * so fast clicking never lags, and change at once from the keyboard. Hold − or + to keep going.
 * The number's box fits the widest value, so the keys never move under the pointer.
 */
export function Stepper({
  label,
  value,
  defaultValue = 0,
  onValueChange,
  min = Number.NEGATIVE_INFINITY,
  max = Number.POSITIVE_INFINITY,
  step = 1,
  className,
}: StepperProps) {
  const [current, setCurrent] = useControllable(value, defaultValue, onValueChange)
  const previous = useRef(current)
  const direction = current >= previous.current ? 1 : -1
  previous.current = current
  const reduced = useReducedMotion()
  // The latest value for the hold timer, and whether the last change came from the keyboard
  const latest = useRef(current)
  latest.current = current
  const fromKeyboard = useRef(false)
  const hold = useRef<ReturnType<typeof setTimeout>>(undefined)
  const instant = reduced || fromKeyboard.current
  const roll: Roll = { d: direction, instant }

  // Digits to fit: the widest of min and max, three when unbounded
  const digits = Math.max(
    Number.isFinite(max) ? String(Math.trunc(max)).length : 3,
    Number.isFinite(min) ? String(Math.trunc(min)).length : 3,
  )

  const commit = (next: number, keyboard: boolean) => {
    const clamped = clamp(next, min, max)
    if (clamped === latest.current) return false
    fromKeyboard.current = keyboard
    latest.current = clamped
    setCurrent(clamped)
    return true
  }

  const stopHold = () => clearTimeout(hold.current)
  // Unmounting mid-hold: stop repeating
  useEffect(() => () => clearTimeout(hold.current), [])

  const startHold = (delta: number) => (event: PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return
    stopHold()
    if (!commit(latest.current + delta, false)) return
    let interval = HOLD_START
    const repeat = () => {
      if (!commit(latest.current + delta, false)) return
      interval = Math.max(HOLD_FLOOR, interval * HOLD_EASE)
      hold.current = setTimeout(repeat, interval)
    }
    hold.current = setTimeout(repeat, HOLD_DELAY)
  }

  // Pointer presses step on pointerdown; this only answers Enter and Space (detail 0)
  const keyStep = (delta: number) => (event: MouseEvent<HTMLButtonElement>) => {
    if (event.detail === 0) commit(latest.current + delta, true)
  }

  const onKeyDown = (event: KeyboardEvent) => {
    const keys: Record<string, number | undefined> = {
      ArrowUp: current + step,
      ArrowRight: current + step,
      ArrowDown: current - step,
      ArrowLeft: current - step,
      PageUp: current + step * 10,
      PageDown: current - step * 10,
      Home: Number.isFinite(min) ? min : undefined,
      End: Number.isFinite(max) ? max : undefined,
    }
    const next = keys[event.key]
    if (next === undefined) return
    event.preventDefault()
    commit(next, true)
  }

  const holdEnds = {
    onPointerUp: stopHold,
    onPointerLeave: stopHold,
    onPointerCancel: stopHold,
  }

  return (
    <fieldset
      aria-label={label}
      className={cn("ds-stepper ds-poster ds-surface", className)}
      style={{ "--ds-stepper-digits": digits } as CSSProperties}
    >
      <span className="ds-stepper__label" aria-hidden>
        {label}
      </span>
      <button
        type="button"
        className="ds-stepper__key"
        onPointerDown={startHold(-step)}
        onClick={keyStep(-step)}
        {...holdEnds}
        disabled={current <= min}
        aria-label={`Decrease ${label}`}
      >
        <Icon name="minus" size={16} stroke={2} />
      </button>
      <span
        role="spinbutton"
        tabIndex={0}
        aria-label={label}
        aria-valuenow={current}
        aria-valuemin={Number.isFinite(min) ? min : undefined}
        aria-valuemax={Number.isFinite(max) ? max : undefined}
        onKeyDown={onKeyDown}
        className="ds-stepper__value"
      >
        <AnimatePresence initial={false} mode="popLayout" custom={roll}>
          <motion.span
            key={current}
            className="ds-stepper__digit"
            custom={roll}
            variants={{
              enter: ({ d, instant }: Roll) => ({
                y: instant ? 0 : `${d * 70}%`,
                opacity: instant ? 1 : 0,
              }),
              center: { y: 0, opacity: 1 },
              // Read through `custom`, which reaches the leaving digit too (its own props are stale)
              exit: ({ d, instant }: Roll) => ({
                y: instant ? 0 : `${d * -70}%`,
                opacity: 0,
                transition: instant ? { duration: 0 } : undefined,
              }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={instant ? { duration: 0 } : { duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
          >
            {current}
          </motion.span>
        </AnimatePresence>
      </span>
      <button
        type="button"
        className="ds-stepper__key"
        onPointerDown={startHold(step)}
        onClick={keyStep(step)}
        {...holdEnds}
        disabled={current >= max}
        aria-label={`Increase ${label}`}
      >
        <Icon name="plus" size={16} stroke={2} />
      </button>
    </fieldset>
  )
}
