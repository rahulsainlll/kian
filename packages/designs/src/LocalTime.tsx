"use client"

import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import {
  type ComponentProps,
  type MouseEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react"
import { cn } from "./utils"
import "./designs.css"

export type LocalTimeProps = Omit<ComponentProps<"p">, "children"> & {
  /** An IANA zone: "Asia/Kolkata", "America/Los_Angeles". */
  timeZone: string
  /** Where that is, as it should read: "New Delhi, India". */
  place: string
  /** The hours the face sleeps through, in that zone (from, to). 11pm to 7am by default. */
  sleep?: [number, number]
  /** Who keeps the time: a bunny by default, or a cat, a bear, a dog. */
  character?: LocalTimeCharacter
  /** A seasonal touch: a diya at Diwali, a pumpkin at Halloween. "auto" follows the date. */
  season?: LocalTimeSeason
}

type Clock = { hour: number; minute: number; period: "am" | "pm" }

const read = (timeZone: string): Clock => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).formatToParts(new Date())
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ""
  return {
    hour: Number(get("hour")),
    minute: Number(get("minute")),
    period: get("dayPeriod").toLowerCase() === "pm" ? "pm" : "am",
  }
}

const hour24 = ({ hour, period }: Clock) => (hour % 12) + (period === "pm" ? 12 : 0)

/** One digit that rolls up to its next value, the way a flip clock turns */
function Digit({ value }: { value: string }) {
  const reduced = useReducedMotion()
  return (
    <span className="ds-time__digit">
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={value}
          initial={reduced ? { opacity: 0 } : { y: "70%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reduced ? { opacity: 0 } : { y: "-70%", opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

const digits = (text: string) =>
  // biome-ignore lint/suspicious/noArrayIndexKey: a digit is its place in the number
  text.split("").map((d, i) => <Digit key={i} value={d} />)

export type LocalTimeCharacter = "bunny" | "cat" | "bear" | "dog"

type Drawing = {
  /** Each ear, folding from its pivot (its foot, or its top for a floppy ear). */
  ears: [string, string]
  /** The face's sides. */
  sides: string
  /** Anything that stays put: a brow, a nose, a mouth. */
  features?: ReactNode
}

// The kaomoji, drawn on one 26-unit grid in 2-unit strokes, the eyes in the same two places
// so they look and blink alike. Sides that aren't ears are the bunny's brackets
const BRACKETS = "M3.5 15.1Q-1.1 20.4 3.5 25.8M22.2 15.1Q26.8 20.4 22.2 25.8"

const CHARACTERS: Record<LocalTimeCharacter, Drawing> = {
  //  /) /)
  // ( • • )
  bunny: {
    ears: [
      "M4.7 10.2 8.2 2M9.4 1.1Q13.8 6.5 9.4 11.8",
      "M16 10.2 19.5 2M20.7 1.1Q25.1 6.5 20.7 11.8",
    ],
    sides: BRACKETS,
  },
  //  /\_/\
  // ( • . • )
  cat: {
    ears: ["M3.4 11.4 7.4 3.2 10.8 9.4", "M14.9 9.4 18.3 3.2 22.3 11.4"],
    sides: BRACKETS,
    features: (
      <>
        <path d="M10.8 9.4h4.1" />
        <circle cx="12.84" cy="21.9" r="0.95" />
      </>
    ),
  },
  // ʕ • ᴥ • ʔ
  bear: {
    ears: ["M2.6 15.2A3.1 3.1 0 1 1 7.6 11.6", "M23.1 15.2A3.1 3.1 0 1 0 18.1 11.6"],
    sides: BRACKETS,
    features: (
      <path
        className="ds-time__mouth"
        d="M10.5 21.4a1.17 1.17 0 0 0 2.34 0a1.17 1.17 0 0 0 2.34 0"
      />
    ),
  },
  // ∪ • ω • ∪  (the ears are its sides, and they flop)
  dog: {
    ears: [
      "M5.6 13.2C0.6 12.8-1.4 18 0 23.2C0.8 25.9 3.9 25.6 4.4 22.4",
      "M20.1 13.2C25.1 12.8 27.1 18 25.7 23.2C24.9 25.9 21.8 25.6 21.3 22.4",
    ],
    sides: "",
    features: (
      <path
        className="ds-time__mouth"
        d="M10.5 21.6a1.17 1.17 0 0 0 2.34 0a1.17 1.17 0 0 0 2.34 0"
      />
    ),
  },
}

// Woken by a double click: the 💢 is over in under 3s, but it stays up glaring for 8s, then
// its eyes droop for the last 1.2s before it's asleep again
const AWAKE_MS = 8000
const DROWSY_MS = 1200

// 💢 drawn as four curled corners around a point, each corner bending in toward it
const ANGER = [
  [1, -1],
  [1, 1],
  [-1, 1],
  [-1, -1],
]
  .map(([x, y]) => `M${1.1 * x} ${4 * y}Q${1.1 * x} ${1.1 * y} ${4 * x} ${1.1 * y}`)
  .join("")

const BLINK_MIN = 2800
const BLINK_SPREAD = 3600
const EYE_REACH = 1.4

// The little things it does, and for how long
type Mood =
  | "happy" // petted (cat)
  | "startled" // a pointer whipped past (cat)
  | "boop" // a single click on the nose (cat)
  | "dizzy" // the pointer circled it (cat)
  | "yawn" // bedtime's near (dog)
  | "stretch" // just woken for the day (dog)
  | "habit" // its own quirk: a paw lick, a scratch, a wag, a nose twitch
  | "sulk" // double-clicked once too often: it turns its back

const MOOD_MS: Record<Exclude<Mood, "happy">, number> = {
  startled: 700,
  boop: 600,
  dizzy: 1800,
  yawn: 1600,
  stretch: 1400,
  habit: 1800,
  sulk: 6000,
}

const PET_MS = 900 // a hover this long is a pet
const STARTLE_SPEED = 2.6 // px per ms, within STARTLE_NEAR of the face
const STARTLE_NEAR = 130
const DIZZY_NEAR = 150
const DIZZY_TURNS = 3 // full circles around it, without stopping
const BOOP_WAIT = 260 // a click waits this long to be sure it isn't a double click
const SULK_CLICKS = 3 // double clicks inside SULK_WINDOW
const SULK_WINDOW = 15_000
const TYPING_HOLD = 1500 // after a keystroke, the eyes stay on the text this long
const HABIT_MIN = 9000
const HABIT_SPREAD = 6000
const HOUR_EVERY = 15_000 // a yawn or a stretch this often, in its half hour

/** The eyes for each state: dots, shut, ^ ^, > <, O O, @ @, or none at all (its back) */
function Eyes({ state }: { state: "open" | "shut" | "happy" | "squint" | "wide" | "dizzy" }) {
  if (state === "shut") return <path className="ds-time__lid" d="M5.6 19.9h3.4M16.7 19.9h3.4" />
  if (state === "happy")
    return (
      <path
        className="ds-time__lid"
        d="M5.5 20.6 7.28 18.8 9.1 20.6M16.6 20.6 18.4 18.8 20.2 20.6"
      />
    )
  if (state === "squint")
    return (
      <path
        className="ds-time__lid"
        d="M5.9 18.6 8.6 19.9 5.9 21.2M19.8 18.6 17.1 19.9 19.8 21.2"
      />
    )
  if (state === "wide")
    return (
      <>
        <circle className="ds-time__ring" cx="7.28" cy="19.87" r="2.5" />
        <circle className="ds-time__ring" cx="18.4" cy="19.87" r="2.5" />
        <circle cx="7.28" cy="19.87" r="0.8" />
        <circle cx="18.4" cy="19.87" r="0.8" />
      </>
    )
  if (state === "dizzy")
    return (
      <>
        <path
          className="ds-time__spiral"
          d="M7.28 19.87m0 0.5a0.5 0.5 0 1 1 0.6-0.6a1.2 1.2 0 1 1-1.8 1.2a2 2 0 1 1 3.2-1.6"
        />
        <path
          className="ds-time__spiral"
          d="M18.4 19.87m0 0.5a0.5 0.5 0 1 1 0.6-0.6a1.2 1.2 0 1 1-1.8 1.2a2 2 0 1 1 3.2-1.6"
        />
      </>
    )
  return (
    <>
      <circle className="ds-time__eye" cx="7.28" cy="19.87" r="1.8" />
      <circle className="ds-time__eye" cx="18.4" cy="19.87" r="1.8" />
    </>
  )
}

export type LocalTimeSeason = "auto" | "none" | "diwali" | "halloween"

// Diwali moves with the moon: its date each year, and a few days either side
const DIWALI: Record<number, string> = {
  2025: "10-20",
  2026: "11-08",
  2027: "10-29",
  2028: "10-17",
  2029: "11-05",
  2030: "10-26",
}

const seasonOf = (now: Date): Exclude<LocalTimeSeason, "auto"> => {
  const year = now.getFullYear()
  const day = (md: string) => new Date(`${year}-${md}T00:00:00`).getTime()
  const t = now.getTime()
  const DAY = 86_400_000
  const diwali = DIWALI[year]
  if (diwali && t >= day(diwali) - 3 * DAY && t < day(diwali) + 3 * DAY) return "diwali"
  if (t >= day("10-25") && t < day("11-01")) return "halloween"
  return "none"
}

/** What it holds for the season: a diya with a flickering flame, or a carved pumpkin */
function Accessory({ season }: { season: "diwali" | "halloween" }) {
  if (season === "diwali")
    return (
      <g className="ds-time__prop" data-season="diwali">
        <path
          className="ds-time__flame"
          d="M30.9 15.6C32.6 17.9 32.4 20.4 30.9 21.2C29.4 20.4 29.2 17.9 30.9 15.6Z"
        />
        <path
          className="ds-time__diya"
          d="M27.3 22.2H34.5Q33.9 25.9 30.9 25.9Q27.9 25.9 27.3 22.2Z"
        />
      </g>
    )
  return (
    <g className="ds-time__prop" data-season="halloween">
      <path className="ds-time__stem" d="M30.9 19.9Q31 18.4 32.3 17.8" />
      <ellipse className="ds-time__pumpkin" cx="30.9" cy="22.9" rx="3.6" ry="3" />
      <path
        className="ds-time__carve"
        d="M29.2 22.4 29.8 21.3 30.4 22.4ZM31.4 22.4 32 21.3 32.6 22.4ZM29.5 23.8Q30.9 25 32.3 23.8"
      />
    </g>
  )
}

/**
 * A little face after the time, one of a few kaomoji. Awake, its eyes follow the pointer, it
 * blinks now and then and its ears twitch; through the night it sleeps, eyes shut, with z's
 * drifting up. Double-click it while it sleeps and it wakes with a jolt and a 💢; do it three
 * times in a row and it turns its back. Each has its own habit, and the cat, the dog and the
 * bear notice more: petting, a fast pointer, a boop, circling, the hour, your typing.
 */
function Face({
  asleep: sleepy,
  character,
  hour,
  season,
}: {
  asleep: boolean
  character: LocalTimeCharacter
  /** In its yawning half hour before bed, or its stretching half hour after waking. */
  hour?: "yawn" | "stretch"
  season?: "diwali" | "halloween"
}) {
  const drawing = CHARACTERS[character]
  const reduced = useReducedMotion()
  const face = useRef<SVGSVGElement>(null)
  const eyes = useRef<SVGGElement>(null)
  const [grumpy, setGrumpy] = useState(false)
  const [drowsy, setDrowsy] = useState(false)
  const [mood, setMood] = useState<Mood | null>(null)
  const grump = useRef<ReturnType<typeof setTimeout>[]>([])
  const moodTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const petTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const boopTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const wakes = useRef<number[]>([])
  const typingUntil = useRef(0)
  const moodNow = useRef<Mood | null>(null)
  moodNow.current = mood

  const settle = () => {
    for (const t of grump.current) clearTimeout(t)
  }
  // Leaving: drop every pending timer
  useEffect(
    () => () => {
      for (const t of grump.current) clearTimeout(t)
      clearTimeout(moodTimer.current)
      clearTimeout(petTimer.current)
      clearTimeout(boopTimer.current)
    },
    [],
  )

  const sulking = mood === "sulk"
  const asleep = sleepy && !grumpy && !sulking
  const is = (...who: LocalTimeCharacter[]) => who.includes(character)

  /** Do something for a moment; a sulk isn't interrupted */
  const play = (next: Exclude<Mood, "happy">) => {
    if (moodNow.current === "sulk" && next !== "sulk") return
    clearTimeout(moodTimer.current)
    setMood(next)
    moodTimer.current = setTimeout(() => setMood(null), MOOD_MS[next])
  }

  const jolt = () => {
    if (reduced) return
    face.current?.animate(
      [
        { transform: "translateY(0)" },
        { transform: "translateY(-3px)" },
        { transform: "translateX(-1.5px)" },
        { transform: "translateX(1.5px)" },
        { transform: "translate(0)" },
      ],
      { duration: 320, easing: "cubic-bezier(0.23, 1, 0.32, 1)" },
    )
  }

  const onDoubleClick = () => {
    clearTimeout(boopTimer.current)
    const now = Date.now()
    wakes.current = [...wakes.current.filter((t) => now - t < SULK_WINDOW), now]
    if (wakes.current.length >= SULK_CLICKS) {
      wakes.current = []
      settle()
      setGrumpy(false)
      setDrowsy(false)
      play("sulk")
      return
    }
    if (!sleepy || sulking) return
    setGrumpy(true)
    setDrowsy(false)
    settle()
    grump.current = [
      setTimeout(() => setDrowsy(true), AWAKE_MS - DROWSY_MS),
      setTimeout(() => {
        setGrumpy(false)
        setDrowsy(false)
      }, AWAKE_MS),
    ]
    jolt()
  }

  // A single click boops the cat's nose, once it's sure the click isn't the first of two
  const onClick = (event: MouseEvent<SVGSVGElement>) => {
    if (!is("cat") || asleep || event.detail !== 1) return
    clearTimeout(boopTimer.current)
    boopTimer.current = setTimeout(() => play("boop"), BOOP_WAIT)
  }

  // Petting: rest the pointer on the cat and it closes its eyes happily
  const onPointerEnter = () => {
    if (!is("cat") || asleep) return
    clearTimeout(petTimer.current)
    petTimer.current = setTimeout(() => {
      if (!moodNow.current) setMood("happy")
    }, PET_MS)
  }
  const onPointerLeave = () => {
    clearTimeout(petTimer.current)
    if (moodNow.current === "happy") setMood(null)
  }

  const lookAt = (x: number, y: number) => {
    const box = face.current?.getBoundingClientRect()
    if (!box || !eyes.current) return
    const dx = x - (box.left + box.width / 2)
    const dy = y - (box.top + box.height / 2)
    const far = Math.hypot(dx, dy) || 1
    const pull = Math.min(1, far / 160)
    eyes.current.style.transform = `translate(${((dx / far) * EYE_REACH * pull).toFixed(2)}px, ${((dy / far) * EYE_REACH * pull).toFixed(2)}px)`
  }

  // The pointer: the eyes follow it, and the cat notices speed (startled) and circling (dizzy)
  // biome-ignore lint/correctness/useExhaustiveDependencies: handlers read refs; rebind on state
  useEffect(() => {
    if (asleep || reduced || sulking) return
    let last = { x: 0, y: 0, t: 0 }
    let angle: number | null = null
    let turned = 0
    let lastTurn = 0
    const move = (event: PointerEvent) => {
      const now = performance.now()
      if (Date.now() > typingUntil.current) lookAt(event.clientX, event.clientY)
      if (!is("cat") || moodNow.current) {
        last = { x: event.clientX, y: event.clientY, t: now }
        return
      }
      const box = face.current?.getBoundingClientRect()
      if (!box) return
      const cx = box.left + box.width / 2
      const cy = box.top + box.height / 2
      const near = Math.hypot(event.clientX - cx, event.clientY - cy)
      // Startled: a fast swipe close by
      const dt = now - last.t
      if (last.t && dt > 0 && dt < 80) {
        const speed = Math.hypot(event.clientX - last.x, event.clientY - last.y) / dt
        if (speed > STARTLE_SPEED && near < STARTLE_NEAR) {
          play("startled")
          angle = null
          turned = 0
        }
      }
      last = { x: event.clientX, y: event.clientY, t: now }
      // Dizzy: keep circling it without a pause
      if (near < DIZZY_NEAR && near > 12) {
        const a = Math.atan2(event.clientY - cy, event.clientX - cx)
        if (angle !== null && now - lastTurn < 600) {
          let d = a - angle
          if (d > Math.PI) d -= 2 * Math.PI
          if (d < -Math.PI) d += 2 * Math.PI
          turned += d
        } else turned = 0
        angle = a
        lastTurn = now
        if (Math.abs(turned) > DIZZY_TURNS * 2 * Math.PI) {
          turned = 0
          play("dizzy")
        }
      } else angle = null
    }
    window.addEventListener("pointermove", move)
    return () => window.removeEventListener("pointermove", move)
  }, [asleep, reduced, sulking, character])

  // The dog and the bear watch you type: their eyes go to the caret in whatever field you're in
  // biome-ignore lint/correctness/useExhaustiveDependencies: lookAt reads refs
  useEffect(() => {
    if (!is("dog", "bear") || asleep || reduced || sulking) return
    const canvas = document.createElement("canvas").getContext("2d")
    const watch = () => {
      const field = document.activeElement
      if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) return
      const box = field.getBoundingClientRect()
      const style = getComputedStyle(field)
      let x = box.left + parseFloat(style.paddingLeft)
      if (canvas) {
        canvas.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`
        const before = field.value.slice(0, field.selectionStart ?? field.value.length)
        x += canvas.measureText(before.split("\n").pop() ?? "").width - field.scrollLeft
      }
      typingUntil.current = Date.now() + TYPING_HOLD
      lookAt(Math.min(x, box.right), box.top + box.height / 2)
    }
    document.addEventListener("input", watch, true)
    document.addEventListener("selectionchange", watch)
    return () => {
      document.removeEventListener("input", watch, true)
      document.removeEventListener("selectionchange", watch)
    }
  }, [asleep, reduced, sulking, character])

  // A blink every few seconds, never on a beat
  useEffect(() => {
    if (asleep || reduced) return
    let timer: ReturnType<typeof setTimeout>
    const next = () => {
      timer = setTimeout(
        () => {
          for (const eye of eyes.current?.querySelectorAll(".ds-time__eye") ?? []) {
            eye.animate(
              [
                { transform: "scaleY(1)" },
                { transform: "scaleY(0.1)" },
                { transform: "scaleY(1)" },
              ],
              { duration: 160, easing: "ease-in-out" },
            )
          }
          next()
        },
        BLINK_MIN + Math.random() * BLINK_SPREAD,
      )
    }
    next()
    return () => clearTimeout(timer)
  }, [asleep, reduced])

  // Its habit, every so often while it's awake and not busy
  // biome-ignore lint/correctness/useExhaustiveDependencies: play reads refs
  useEffect(() => {
    if (asleep || reduced) return
    let timer: ReturnType<typeof setTimeout>
    const next = () => {
      timer = setTimeout(
        () => {
          if (!moodNow.current) play("habit")
          next()
        },
        HABIT_MIN + Math.random() * HABIT_SPREAD,
      )
    }
    next()
    return () => clearTimeout(timer)
  }, [asleep, reduced])

  // The dog keeps the hour: a yawn as bedtime nears, a stretch when the day starts
  // biome-ignore lint/correctness/useExhaustiveDependencies: play reads refs
  useEffect(() => {
    if (!is("dog") || !hour || asleep || reduced) return
    const go = () => {
      if (!moodNow.current) play(hour)
    }
    go()
    const timer = setInterval(go, HOUR_EVERY)
    return () => clearInterval(timer)
  }, [hour, asleep, reduced, character])

  const eyesState = asleep
    ? "shut"
    : mood === "happy" || mood === "stretch" || (mood === "habit" && is("cat"))
      ? "happy"
      : mood === "boop" || (mood === "habit" && is("bear"))
        ? "squint"
        : mood === "startled"
          ? "wide"
          : mood === "dizzy"
            ? "dizzy"
            : mood === "yawn" || drowsy
              ? "shut"
              : "open"

  // From the keyboard (a click with no pointer count): wake it if it sleeps, boop the cat,
  // or give the others a little jump to say it noticed
  const onPress = (event: MouseEvent<HTMLButtonElement>) => {
    if (event.detail !== 0) return
    if (asleep || sulking) onDoubleClick()
    else if (is("cat")) play("boop")
    else jolt()
  }
  const action = asleep
    ? `Wake the ${character}`
    : is("cat")
      ? "Boop the cat"
      : `Say hi to the ${character}`

  return (
    <button type="button" className="ds-time__poke" onClick={onPress} aria-label={action}>
      <svg
        ref={face}
        className="ds-time__face"
        data-asleep={asleep || undefined}
        data-grumpy={grumpy || undefined}
        data-drowsy={drowsy || undefined}
        data-mood={mood ?? undefined}
        data-character={character}
        data-season={season}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        viewBox="0 0 40 40"
        fill="none"
        aria-hidden="true"
      >
        <g transform="translate(6, 8)">
          <g className="ds-time__glyphs">
            <path className="ds-time__ear" data-side="left" d={drawing.ears[0]} />
            <path className="ds-time__ear" data-side="right" d={drawing.ears[1]} />
            {drawing.sides && <path d={drawing.sides} />}
            {/* Turned away: just the back of its head */}
            {!sulking && (
              <>
                {mood === "yawn" ? (
                  <ellipse className="ds-time__yawn" cx="12.84" cy="22.6" rx="1.5" ry="1.9" />
                ) : (
                  drawing.features
                )}
                <g ref={eyes} className="ds-time__eyes">
                  <Eyes state={eyesState} />
                </g>
              </>
            )}
            {mood === "habit" && is("bunny") && (
              <circle className="ds-time__nose" cx="12.84" cy="22" r="0.9" />
            )}
            {mood === "habit" && is("cat") && (
              // A paw print comes up beside its mouth, and a little tongue flicks at it
              <>
                <path className="ds-time__tongue" d="M11.9 22.6h2v1.2a1 1 0 0 1-2 0Z" />
                <g className="ds-time__lick" transform="translate(9.3 26.3) scale(1.5)">
                  <ellipse cx="0" cy="0" rx="1.55" ry="1.25" />
                  <circle cx="-1.45" cy="-1.55" r="0.62" />
                  <circle cx="0" cy="-2.15" r="0.62" />
                  <circle cx="1.45" cy="-1.55" r="0.62" />
                </g>
              </>
            )}
            {mood === "habit" && is("bear") && (
              <path className="ds-time__paw" data-side="right" d="M21.2 24.4a1.6 1.6 0 0 1 3.2 0" />
            )}
            {mood === "happy" && (
              <path
                className="ds-time__heart"
                d="M25 6.2C23.6 5 23.3 3.9 24.1 3.4C24.6 3.1 25 3.5 25 3.9C25 3.5 25.4 3.1 25.9 3.4C26.7 3.9 26.4 5 25 6.2Z"
              />
            )}
            {sulking && <path className="ds-time__huff" d="M27 14.5h2.4M27.4 17h2.2M27 19.5h2.4" />}
          </g>
          {season && <Accessory season={season} />}
          {grumpy && <path className="ds-time__anger" transform="translate(25 3)" d={ANGER} />}
          {asleep && (
            <g className="ds-time__zs">
              <text x="25" y="4">
                z
              </text>
              <text x="25" y="4">
                z
              </text>
              <text x="25" y="4">
                z
              </text>
            </g>
          )}
        </g>
      </svg>
    </button>
  )
}

/**
 * The time where you are, and a face that's awake or asleep to match: "8:21am in New Delhi,
 * India". The digits roll as the minutes turn. It's read in the browser, so it fades in once
 * the page knows the time.
 */
export function LocalTime({
  timeZone,
  place,
  sleep = [23, 7],
  character = "bunny",
  season = "auto",
  className,
  ...props
}: LocalTimeProps) {
  const [clock, setClock] = useState<Clock | null>(null)

  // Tick on the minute, not every second
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const tick = () => {
      setClock(read(timeZone))
      timer = setTimeout(tick, 60_000 - (Date.now() % 60_000) + 50)
    }
    tick()
    return () => clearTimeout(timer)
  }, [timeZone])

  const h = clock ? hour24(clock) : 12
  const [from, to] = sleep
  const asleep = from > to ? h >= from || h < to : h >= from && h < to
  // The half hour before bed and the half hour after waking
  const minute = clock?.minute ?? 0
  const hour =
    clock && h === (from + 23) % 24 && minute >= 30
      ? "yawn"
      : clock && h === to && minute < 30
        ? "stretch"
        : undefined
  const worn = season === "auto" ? (clock ? seasonOf(new Date()) : "none") : season

  return (
    <p className={cn("ds-time", className)} data-ready={clock ? true : undefined} {...props}>
      {/* Rolling digits read badly one by one, so a screen reader gets the plain line */}
      <span className="ds-time__text" aria-hidden>
        {clock && (
          <>
            {digits(String(clock.hour))}:{digits(String(clock.minute).padStart(2, "0"))}
            {clock.period} in {place}
          </>
        )}
      </span>
      {clock && (
        <span className="ds-time__sr">
          {`${clock.hour}:${String(clock.minute).padStart(2, "0")}${clock.period} in ${place}`}
        </span>
      )}{" "}
      <Face
        asleep={asleep}
        character={character}
        hour={hour}
        season={worn === "none" ? undefined : worn}
      />
    </p>
  )
}
