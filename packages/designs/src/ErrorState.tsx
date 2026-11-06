"use client"

import { type ComponentProps, useEffect, useRef } from "react"
import { cn } from "./utils"
import "./designs.css"
import { letterShape, tidy } from "./letterShapes"
import { Body, type Rect, type Vec, World } from "./softBody"

export type ErrorStateProps = Omit<ComponentProps<"div">, "children"> & {
  /** The words to set in soft letters. Three letters to a row, as softle.app sets its name. */
  text?: string
  /** The line under the box. */
  message?: string
}

// Sizes and timings, after softle.app's
const FILL = 0.95 // the tightest box holds the letters at 95% of its area
const BOX_RANGE = [250, 400] // the square box's side, smallest to largest, px
const BOX_OPEN = 290 // the side it settles at before the intro lets go
const START_SCALE = 1.45 // the box opens this much larger than that, and ends there
const SQUEEZE_DELAY = 450 // ms before the intro squeeze
const SQUEEZE_MS = 750 // in to the settled box, then the same back out
const PRESETTLE = 300 // steps run before the first frame, so the letters start at rest
const TILTS = [20, -20, 16, -20, 3, 10, -12, 14, -6] // each letter's lean, in degrees
const PER_ROW = 3
const SPACING = 6 // px between outline points
const NOTCH = 5 // px, how deep the nicks at inner corners go
const SMOOTH_DRAW = 0.15 // the drawn outline trails the physics by this much a frame
const CALM = 0.0025 // squared px per substep under which it counts as still
const CALM_FRAMES = 30 // still this long and it stops working until touched
const HANDLE = 8 // corner squares, px
const HANDLE_HIT = 12 // how near a corner or edge a press catches it, px
const MARGIN = 40 // kept clear around the box, px
const LABEL_ROOM = 44 // under the box, for the message
const LINE = 2 // px, the letters' stroke
// Tilting a phone: nothing under 3°, full gravity by 35°, eased in
const TILT_DEAD = Math.sin((3 * Math.PI) / 180)
const TILT_FULL = Math.sin((35 * Math.PI) / 180)
const TILT_GRAVITY = 900
const TILT_EASE = 0.15
const CURSORS = [
  "nwse-resize",
  "nesw-resize",
  "nwse-resize",
  "nesw-resize",
  "ns-resize",
  "ew-resize",
  "ns-resize",
  "ew-resize",
]

const easeInOutQuad = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2)

const square = (side: number): Rect => ({
  left: -side / 2,
  right: side / 2,
  top: -side / 2,
  bottom: side / 2,
})

const centreOf = (ps: Vec[]) => {
  let x = 0
  let y = 0
  for (const p of ps) {
    x += p.x
    y += p.y
  }
  return { x: x / ps.length, y: y / ps.length }
}

/** Turn points about a centre by some degrees */
const turnAbout = (ps: Vec[], c: Vec, deg: number): Vec[] => {
  const a = (deg * Math.PI) / 180
  const cos = Math.cos(a)
  const sin = Math.sin(a)
  return ps.map((p) => ({
    x: c.x + (p.x - c.x) * cos - (p.y - c.y) * sin,
    y: c.y + (p.x - c.x) * sin + (p.y - c.y) * cos,
  }))
}

const areaOf = (ps: Vec[]) =>
  ps.reduce((sum, p, i) => {
    const q = ps[(i + 1) % ps.length]
    return sum + (p.x * q.y - q.x * p.y) / 2
  }, 0)

const perimeterOf = (ps: Vec[]) =>
  ps.reduce((sum, p, i) => {
    const q = ps[(i + 1) % ps.length]
    return sum + Math.hypot(q.x - p.x, q.y - p.y)
  }, 0)

/** A closed curve through the points; corners (the nicks) draw sharp */
function smoothLoop(ctx: CanvasRenderingContext2D, ps: Vec[], corners?: Set<number>) {
  const n = ps.length
  ctx.moveTo(ps[0].x, ps[0].y)
  for (let i = 0; i < n; i++) {
    const p0 = ps[(i + n - 1) % n]
    const p1 = ps[i]
    const p2 = ps[(i + 1) % n]
    const p3 = ps[(i + 2) % n]
    const sharp1 = corners?.has(i)
    const sharp2 = corners?.has((i + 1) % n)
    ctx.bezierCurveTo(
      sharp1 ? p1.x + (p2.x - p1.x) / 3 : p1.x + (p2.x - p0.x) / 6,
      sharp1 ? p1.y + (p2.y - p1.y) / 3 : p1.y + (p2.y - p0.y) / 6,
      sharp2 ? p2.x - (p2.x - p1.x) / 3 : p2.x - (p3.x - p1.x) / 6,
      sharp2 ? p2.y - (p2.y - p1.y) / 3 : p2.y - (p3.y - p1.y) / 6,
      p2.x,
      p2.y,
    )
  }
  ctx.closePath()
}

type Scene = { world: World; tight: number; open: number; start: number }

/** Set the text in soft letters, three to a row, lean each one, and size the box */
function buildScene(text: string, font: string): Scene {
  const rows = text
    .trim()
    .toUpperCase()
    .split(/\s+/)
    .flatMap((word) => word.match(new RegExp(`.{1,${PER_ROW}}`, "g")) ?? [])
  const size = 160
  const shapes = rows.map((row) => [...row].map((ch) => letterShape(ch, font, size, 1.5)))
  const gap = size * 0.08
  const rowH = size * 1.05
  const raw: { outline: Vec[]; holes: Vec[][]; corners: Vec[] }[] = []
  let lean = 0
  shapes.forEach((row, r) => {
    const width = row.reduce((sum, s) => sum + s.width, 0) + gap * (row.length - 1)
    let x = -width / 2
    const y = (r - (shapes.length - 1) / 2) * rowH
    for (const s of row) {
      const deg = TILTS[lean++ % TILTS.length]
      const at = (p: Vec) => ({ x: p.x + x + s.width / 2, y: p.y + y })
      const placed = s.outline.map(at)
      const centre = centreOf(placed)
      raw.push({
        outline: turnAbout(placed, centre, deg),
        holes: s.holes.map((h) => turnAbout(h.map(at), centre, deg)),
        corners: turnAbout(s.corners.map(at), centre, deg),
      })
      x += s.width + gap
    }
  })
  // Scale so the tightest box, at FILL, is 95% of BOX_OPEN: about softle's letter size
  let area = 0
  for (const { outline } of raw) {
    let a = 0
    outline.forEach((p, i) => {
      const q = outline[(i + 1) % outline.length]
      a += p.x * q.y - q.x * p.y
    })
    area += Math.abs(a / 2)
  }
  const want = BOX_OPEN * 0.95
  const k = want / Math.sqrt(area / FILL)
  const scale = (p: Vec) => ({ x: p.x * k, y: p.y * k })
  const bodies = raw.map((l, i) => {
    const dense = l.outline.map(scale)
    const points = tidy(dense, Math.max(16, Math.round(perimeterOf(dense) / SPACING)), 2)
    const holes = l.holes.map((h) => {
      const hd = h.map(scale)
      return tidy(hd, Math.max(10, Math.round(perimeterOf(hd) / SPACING)), 2)
    })
    // Each inner corner of the thin letter puts a nick at the nearest point of the balloon
    const reach = Math.sqrt(Math.abs(areaOf(points))) * 0.45
    const notches: { i: number; depth: number }[] = []
    for (const corner of l.corners) {
      const c = scale(corner)
      let best = -1
      let bestD = reach
      points.forEach((p, j) => {
        const d = Math.hypot(p.x - c.x, p.y - c.y)
        if (d < bestD) {
          bestD = d
          best = j
        }
      })
      const n = points.length
      if (
        best !== -1 &&
        !notches.some((o) => Math.min(Math.abs(o.i - best), n - Math.abs(o.i - best)) < 4)
      )
        notches.push({ i: best, depth: NOTCH })
    }
    return new Body(points, holes, notches, i)
  })
  const tight = Math.max(BOX_RANGE[0], want)
  const open = Math.max(BOX_OPEN, tight)
  const start = Math.min(open * START_SCALE, BOX_RANGE[1])
  const world = new World(bodies, square(start))
  for (let i = 0; i < PRESETTLE; i++) world.stepOnce()
  return { world, tight, open, start }
}

/**
 * An error state set in soft letters, after softle.app: balloon letters in a selection box
 * that settle, get squeezed together, and are let go. Then they're yours: drag a letter to
 * pull it about, drag a corner or an edge to squash or loosen the box, tilt a phone and they
 * slide. A message sits under the box.
 */
export function ErrorState({
  text = "error 404",
  message = "This page wandered off",
  className,
  ...props
}: ErrorStateProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const labelRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const label = labelRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return
    const style = getComputedStyle(canvas)
    const font = style.getPropertyValue("--ds-font") || "sans-serif"
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const { world, tight, open, start } = buildScene(text, font)

    let fit = 1
    let dpr = window.devicePixelRatio || 1
    let frame = 0
    let last = 0
    let calm = 0
    let introStart = reduced || start === open ? 0 : performance.now()
    let handle = -1 // the corner (0–3) or edge (4–7) being dragged
    let grabbed: { body: Body; ox: number; oy: number } | null = null
    const tilt = { x: 0, y: 0, on: false }
    // The drawn outlines, trailing the physics a little in each letter's own frame
    const drawn = world.bodies.map((b) => ({
      local: new Float64Array(b.particles.length * 2),
      out: b.particles.map(() => ({ x: 0, y: 0 })),
      seeded: false,
    }))

    const layout = () => {
      dpr = window.devicePixelRatio || 1
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      const room = BOX_RANGE[1] + HANDLE
      fit = Math.min(1, (w - MARGIN * 2) / room, (h - MARGIN * 2 - LABEL_ROOM) / room)
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      draw()
    }

    const toWorld = (event: PointerEvent) => {
      const box = canvas.getBoundingClientRect()
      return {
        x: (event.clientX - box.left - box.width / 2) / fit,
        y: (event.clientY - box.top - (box.height - LABEL_ROOM) / 2) / fit,
      }
    }

    const corners = (r: Rect): Vec[] => [
      { x: r.left, y: r.top },
      { x: r.right, y: r.top },
      { x: r.right, y: r.bottom },
      { x: r.left, y: r.bottom },
    ]

    const handleAt = (p: Vec) => {
      const r = world.wall
      const hit = HANDLE_HIT / fit
      const c = corners(r).findIndex(
        (q) => Math.abs(q.x - p.x) <= hit && Math.abs(q.y - p.y) <= hit,
      )
      if (c !== -1) return c
      const inX = p.x >= r.left - hit && p.x <= r.right + hit
      const inY = p.y >= r.top - hit && p.y <= r.bottom + hit
      if (inX && Math.abs(p.y - r.top) <= hit) return 4
      if (inY && Math.abs(p.x - r.right) <= hit) return 5
      if (inX && Math.abs(p.y - r.bottom) <= hit) return 6
      if (inY && Math.abs(p.x - r.left) <= hit) return 7
      return -1
    }

    /** A letter's outline as drawn: eased toward the physics in its own frame, nicks added */
    const outlineOf = (index: number) => {
      const body = world.bodies[index]
      const d = drawn[index]
      const f = body.fit()
      const c = Math.cos(f.angle)
      const s = Math.sin(f.angle)
      const ease = d.seeded ? SMOOTH_DRAW : 1
      body.particles.forEach((p, i) => {
        const ox = p.x - f.x
        const oy = p.y - f.y
        const lx = ox * c + oy * s
        const ly = -ox * s + oy * c
        d.local[i * 2] += (lx - d.local[i * 2]) * ease
        d.local[i * 2 + 1] += (ly - d.local[i * 2 + 1]) * ease
        const x = d.local[i * 2]
        const y = d.local[i * 2 + 1]
        d.out[i].x = f.x + x * c - y * s
        d.out[i].y = f.y + x * s + y * c
      })
      d.seeded = true
      if (body.notches.length === 0) return { ring: d.out, sharp: undefined }
      // Each nick: a short straight run either side of a sharp point, shallower when squashed
      const ring: Vec[] = []
      const sharp = new Set<number>()
      const sign = Math.sign(body.baseArea) || 1
      const n = d.out.length
      let next = 0
      for (let i = 0; i < n; i++) {
        const notch =
          next < body.notches.length && body.notches[next].i === i ? body.notches[next] : null
        if (!notch) {
          ring.push(d.out[i])
          continue
        }
        next++
        const a = d.out[(i - 1 + n) % n]
        const m = d.out[i]
        const b = d.out[(i + 1) % n]
        const tx = b.x - a.x
        const ty = b.y - a.y
        const tl = Math.hypot(tx, ty) || 1e-9
        const pa = body.particles[(i - 1 + n) % n]
        const pm = body.particles[i]
        const pb = body.particles[(i + 1) % n]
        const restRun =
          Math.hypot(pm.rx - pa.rx, pm.ry - pa.ry) + Math.hypot(pb.rx - pm.rx, pb.ry - pm.ry) ||
          1e-9
        const squash = Math.min(
          1,
          (Math.hypot(m.x - a.x, m.y - a.y) + Math.hypot(b.x - m.x, b.y - m.y)) / restRun,
        )
        const depth = notch.depth * squash
        const run = tl * 0.18
        const nx = (-ty / tl) * sign
        const ny = (tx / tl) * sign
        sharp.add(ring.length)
        ring.push({ x: m.x - (tx / tl) * run, y: m.y - (ty / tl) * run })
        sharp.add(ring.length)
        ring.push({ x: m.x + nx * depth, y: m.y + ny * depth })
        sharp.add(ring.length)
        ring.push({ x: m.x + (tx / tl) * run, y: m.y + (ty / tl) * run })
      }
      return { ring, sharp }
    }

    function draw() {
      if (!ctx || !canvas) return
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      const css = getComputedStyle(canvas)
      const ink = css.color
      const accent = css.getPropertyValue("--ds-accent").trim() || "#3b82f6"
      const paper = css.getPropertyValue("--ds-surface").trim() || "#fff"
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.setTransform(dpr * fit, 0, 0, dpr * fit, (w / 2) * dpr, ((h - LABEL_ROOM) / 2) * dpr)

      ctx.lineWidth = LINE / fit
      ctx.lineJoin = "round"
      ctx.lineCap = "round"
      ctx.strokeStyle = ink
      world.bodies.forEach((body, i) => {
        const { ring, sharp } = outlineOf(i)
        ctx.beginPath()
        smoothLoop(ctx, ring, sharp)
        // Holes ride rigidly with the letter
        const f = body.fit()
        const c = Math.cos(f.angle) * body.scale
        const s = Math.sin(f.angle) * body.scale
        for (const hole of body.holes) {
          smoothLoop(
            ctx,
            hole.map((p) => ({ x: f.x + p.x * c - p.y * s, y: f.y + p.x * s + p.y * c })),
          )
        }
        ctx.stroke()
      })

      // The selection box and its corners
      const r = world.wall
      ctx.lineWidth = 1 / fit
      ctx.strokeStyle = accent
      ctx.strokeRect(r.left, r.top, r.right - r.left, r.bottom - r.top)
      ctx.fillStyle = paper
      const half = HANDLE / 2 / fit
      for (const c of corners(r)) {
        ctx.beginPath()
        ctx.rect(c.x - half, c.y - half, half * 2, half * 2)
        ctx.fill()
        ctx.stroke()
      }

      if (label) {
        label.style.left = `${w / 2 + ((r.left + r.right) / 2) * fit}px`
        label.style.top = `${(h - LABEL_ROOM) / 2 + r.bottom * fit + 12}px`
      }
    }

    // The intro: after a beat, squeeze the box to its settled size, then let it back out
    const intro = (now: number) => {
      if (!introStart) return
      const t = now - introStart - SQUEEZE_DELAY
      if (t < 0) return
      if (t >= SQUEEZE_MS * 2) {
        world.bounds = square(start)
        introStart = 0
        return
      }
      const inward = t < SQUEEZE_MS
      const e = easeInOutQuad(inward ? t / SQUEEZE_MS : (t - SQUEEZE_MS) / SQUEEZE_MS)
      const side = inward ? start + (open - start) * e : open + (start - open) * e
      world.bounds = square(Math.max(tight, side))
    }

    const tick = (now: number) => {
      frame = 0
      intro(now)
      if (tilt.on) {
        world.gravity.x = tilt.x
        world.gravity.y = tilt.y
      }
      world.step((now - last) / 1000)
      last = now
      draw()
      const busy = introStart || grabbed || handle !== -1 || tilt.on
      calm = busy || !world.wallSettled() || world.liveliness() > CALM ? 0 : calm + 1
      if (calm < CALM_FRAMES) frame = requestAnimationFrame(tick)
    }

    const wake = () => {
      calm = 0
      if (frame === 0) {
        last = performance.now()
        frame = requestAnimationFrame(tick)
      }
    }

    const onDown = (event: PointerEvent) => {
      if (event.button !== 0) return
      const p = toWorld(event)
      handle = handleAt(p)
      if (handle === -1) {
        const body = world.pick(p.x, p.y)
        if (!body) return
        grabbed = { body, ox: p.x - body.frame.x, oy: p.y - body.frame.y }
        body.pull = { x: p.x - grabbed.ox, y: p.y - grabbed.oy }
      }
      introStart = 0
      canvas.setPointerCapture(event.pointerId)
      canvas.style.cursor = handle === -1 ? "grabbing" : CURSORS[handle]
      event.preventDefault()
      wake()
    }

    const onMove = (event: PointerEvent) => {
      const p = toWorld(event)
      if (grabbed) {
        grabbed.body.pull = { x: p.x - grabbed.ox, y: p.y - grabbed.oy }
        wake()
        return
      }
      if (handle !== -1) {
        // The box stays square, about its centre
        const b = world.bounds
        const cx = (b.left + b.right) / 2
        const cy = (b.top + b.bottom) / 2
        const dx = p.x - cx
        const dy = p.y - cy
        const reach =
          handle < 4
            ? Math.max((handle === 1 || handle === 2 ? 1 : -1) * dx, (handle >= 2 ? 1 : -1) * dy)
            : handle === 4
              ? -dy
              : handle === 5
                ? dx
                : handle === 6
                  ? dy
                  : -dx
        const half = Math.min(Math.max(reach, tight / 2), BOX_RANGE[1] / 2)
        world.bounds = { left: cx - half, right: cx + half, top: cy - half, bottom: cy + half }
        wake()
        return
      }
      const over = handleAt(p)
      canvas.style.cursor = over !== -1 ? CURSORS[over] : world.pick(p.x, p.y) ? "grab" : ""
    }

    const onUp = () => {
      if (grabbed) {
        // Let go without a fling: it rests where it was dropped
        for (const q of grabbed.body.particles) {
          q.px = q.x
          q.py = q.y
        }
        grabbed.body.pull = null
        grabbed = null
      }
      handle = -1
      canvas.style.cursor = ""
      wake()
    }

    // A phone's tilt becomes gravity, where it's allowed without asking
    const onTilt = (event: DeviceOrientationEvent) => {
      if (event.beta === null || event.gamma === null) return
      const gx = Math.sin((event.gamma * Math.PI) / 180)
      const gy = Math.sin((event.beta * Math.PI) / 180)
      const strength = (v: number) => {
        const m = Math.abs(v)
        if (m <= TILT_DEAD) return 0
        return Math.sign(v) * (Math.min(m - TILT_DEAD, TILT_FULL) / TILT_FULL) * TILT_GRAVITY
      }
      tilt.x += (strength(gx) - tilt.x) * TILT_EASE
      tilt.y += (strength(gy) - tilt.y) * TILT_EASE
      const moving = Math.hypot(tilt.x, tilt.y) > 1
      if (moving && !tilt.on) wake()
      tilt.on = moving
      if (!moving) world.gravity = { x: 0, y: 0 }
    }
    const askless =
      typeof window.DeviceOrientationEvent !== "undefined" &&
      typeof (window.DeviceOrientationEvent as unknown as { requestPermission?: unknown })
        .requestPermission !== "function" &&
      navigator.maxTouchPoints > 0
    if (askless && !reduced) window.addEventListener("deviceorientation", onTilt)

    const resize = new ResizeObserver(layout)
    resize.observe(canvas)
    canvas.addEventListener("pointerdown", onDown)
    canvas.addEventListener("pointermove", onMove)
    canvas.addEventListener("pointerup", onUp)
    canvas.addEventListener("pointercancel", onUp)
    layout()
    wake()

    return () => {
      cancelAnimationFrame(frame)
      resize.disconnect()
      canvas.removeEventListener("pointerdown", onDown)
      canvas.removeEventListener("pointermove", onMove)
      canvas.removeEventListener("pointerup", onUp)
      canvas.removeEventListener("pointercancel", onUp)
      window.removeEventListener("deviceorientation", onTilt)
    }
  }, [text])

  return (
    <div className={cn("ds-error", className)} {...props}>
      <canvas ref={canvasRef} className="ds-error__canvas" role="img" aria-label={text.trim()} />
      <p ref={labelRef} className="ds-error__label">
        {message}
      </p>
    </div>
  )
}
