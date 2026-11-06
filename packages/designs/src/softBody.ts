/**
 * A position-based soft-body world for squishy letters, matched to softle.app's behaviour.
 *
 * Each letter is a ring of particles held by:
 * - edges that never stretch and squash to 60% at most,
 * - bends that smooth any corner turning past 0.6 rad, firmly past 45°,
 * - internal struts across the shape that stop it folding below 35% of its width,
 * - an area constraint that keeps it inflated,
 * - a weak shape match (0.004) that pulls it back to its outline while letting it turn, and
 *   damps wobble toward the motion of the letter as a whole.
 * Letters keep their own particles apart, push each other edge against edge with full
 * friction, and are shoved apart whole if one sinks into another. The square box's walls
 * ease toward their target and carry the letters they touch. Steps are 1/60s, 8 substeps.
 */

export type Vec = { x: number; y: number }

export type Particle = {
  x: number
  y: number
  px: number
  py: number
  invMass: number
  body: number
  index: number
  ring: number
  rx: number
  ry: number
}

export type Rect = { left: number; right: number; top: number; bottom: number }

export const STEP = 1 / 60
export const SUBSTEPS = 8
const DAMPING = 1 // velocity lost per second, as a fraction
const FRICTION = 1 // tangential velocity removed on contact (1: all of it)
const WALL_SPEED = 500 // px per second the walls travel toward their target
const AREA_COMPLIANCE = 0.001
const SHAPE_STIFFNESS = 0.004
const SHAPE_MAX_CORRECTION = 4
const RIGID_DAMPING = 0.1 // share of non-rigid velocity removed per substep
const EDGE_FLOOR = 0.6
const SOFT_TURN = 0.6 // radians a corner may turn freely
const MAX_TURN = Math.PI / 4 // past this a corner is smoothed firmly
const TURN_STRENGTH = 0.5
const SOFT_TURN_STRENGTH = 0.05
const STRUT_FLOOR = 0.35 // a strut won't let the shape close below 35% of its rest span
const SELF_SKIP = 3 // ring neighbours this close don't collide with each other
const CONTACT = 0.5 // share of an overlap corrected per pass
const MAX_PUSH = 5 // px, the most one contact pass moves a point
const SHOVE = 2 // px a sunken letter is pushed out per substep
const SUNK = 0.3 // share of a letter's points inside another before it's shoved

const signedArea = (ps: Vec[]) => {
  let a = 0
  for (let i = 0, n = ps.length; i < n; i++) {
    const p = ps[i]
    const q = ps[(i + 1) % n]
    a += p.x * q.y - q.x * p.y
  }
  return a / 2
}

export const inside = (ps: Vec[], x: number, y: number) => {
  let hit = false
  for (let i = 0, n = ps.length; i < n; i++) {
    const a = ps[i]
    const b = ps[(i + 1) % n]
    if (a.y > y !== b.y > y && x < a.x + ((y - a.y) * (b.x - a.x)) / (b.y - a.y)) hit = !hit
  }
  return hit
}

const dist = (a: Vec, b: Vec) => Math.hypot(b.x - a.x, b.y - a.y)

type Strut = { a: Particle; b: Particle; min: number }

/** Struts across the shape: from each point, straight inward to the far side */
function strutsFor(ps: Particle[]): Strut[] {
  const n = ps.length
  const sign = signedArea(ps) > 0 ? 1 : -1
  let mean = 0
  for (let i = 0; i < n; i++) mean += dist(ps[i], ps[(i + 1) % n])
  mean /= n
  const seen = new Set<number>()
  const out: Strut[] = []
  for (let i = 0; i < n; i++) {
    const prev = ps[(i - 1 + n) % n]
    const next = ps[(i + 1) % n]
    const tx = next.x - prev.x
    const ty = next.y - prev.y
    const tl = Math.hypot(tx, ty)
    if (tl < 1e-9) continue
    // Inward normal
    const nx = (-ty / tl) * sign
    const ny = (tx / tl) * sign
    const p = ps[i]
    let best = Infinity
    let hit = -1
    for (let j = 0; j < n; j++) {
      const gap = (j - i + n) % n
      if (gap <= 1 || gap >= n - 2) continue
      const a = ps[j]
      const b = ps[(j + 1) % n]
      const ex = b.x - a.x
      const ey = b.y - a.y
      const den = nx * ey - ny * ex
      if (Math.abs(den) < 1e-12) continue
      const ax = a.x - p.x
      const ay = a.y - p.y
      const t = (ax * ey - ay * ex) / den
      const u = (ax * ny - ay * nx) / den
      if (t <= mean / 2 || u < 0 || u > 1 || t >= best) continue
      best = t
      hit = u < 0.5 ? j : (j + 1) % n
    }
    if (hit === -1) continue
    const ring = Math.min(Math.abs(i - hit), n - Math.abs(i - hit))
    if (ring <= 2) continue
    const mid = { x: (p.x + ps[hit].x) / 2, y: (p.y + ps[hit].y) / 2 }
    if (!inside(ps, mid.x, mid.y)) continue
    const lo = Math.min(i, hit)
    const hi = Math.max(i, hit)
    const key = lo * n + hi
    if (seen.has(key)) continue
    seen.add(key)
    out.push({ a: ps[lo], b: ps[hi], min: dist(ps[lo], ps[hi]) * STRUT_FLOOR })
  }
  return out
}

export class Body {
  particles: Particle[]
  rest: number[]
  restArea: number
  baseArea: number
  struts: Strut[]
  holes: Vec[][] // around the rest centroid, drawn rigidly with the body
  notches: { i: number; depth: number }[]
  maxEdge = 0
  frame = { x: 0, y: 0, angle: 0 }
  pull: Vec | null = null
  scale = 1
  private rx: Float64Array
  private ry: Float64Array
  private gx: Float64Array
  private gy: Float64Array

  constructor(
    points: Vec[],
    holes: Vec[][],
    notches: { i: number; depth: number }[],
    index: number,
  ) {
    const n = points.length
    let cx = 0
    let cy = 0
    for (const p of points) {
      cx += p.x
      cy += p.y
    }
    cx /= n
    cy /= n
    this.particles = points.map((p, i) => ({
      x: p.x,
      y: p.y,
      px: p.x,
      py: p.y,
      invMass: 1,
      body: index,
      index: i,
      ring: n,
      rx: p.x - cx,
      ry: p.y - cy,
    }))
    this.rx = new Float64Array(n)
    this.ry = new Float64Array(n)
    let perimeter = 0
    this.rest = points.map((p, i) => {
      this.rx[i] = p.x - cx
      this.ry[i] = p.y - cy
      const d = dist(p, points[(i + 1) % n])
      perimeter += d
      if (d > this.maxEdge) this.maxEdge = d
      return d
    })
    // Inflate to its own area, but never past a circle of the same outline length
    this.baseArea = signedArea(points)
    const circle = (perimeter * perimeter) / (4 * n * Math.tan(Math.PI / n))
    const area = Math.min(Math.abs(this.baseArea), circle)
    this.restArea = Math.sign(this.baseArea) * area
    this.scale = Math.sqrt(area / Math.abs(this.baseArea))
    this.struts = strutsFor(this.particles)
    this.holes = holes.map((h) => h.map((p) => ({ x: p.x - cx, y: p.y - cy })))
    this.notches = [...notches].sort((a, b) => a.i - b.i)
    this.frame = { x: cx, y: cy, angle: 0 }
    this.gx = new Float64Array(n)
    this.gy = new Float64Array(n)
  }

  /** The best-fit position and turn of the current shape against the rest shape */
  fit() {
    const ps = this.particles
    const n = ps.length
    let cx = 0
    let cy = 0
    for (const p of ps) {
      cx += p.x
      cy += p.y
    }
    cx /= n
    cy /= n
    let c = 0
    let s = 0
    for (let i = 0; i < n; i++) {
      const qx = ps[i].x - cx
      const qy = ps[i].y - cy
      c += this.rx[i] * qx + this.ry[i] * qy
      s += this.rx[i] * qy - this.ry[i] * qx
    }
    return { x: cx, y: cy, angle: Math.atan2(s, c) }
  }

  projectArea(dt: number) {
    const ps = this.particles
    const n = ps.length
    const c = signedArea(ps) - this.restArea
    let w = 0
    for (let i = 0; i < n; i++) {
      const prev = ps[(i + n - 1) % n]
      const next = ps[(i + 1) % n]
      const gx = 0.5 * (next.y - prev.y)
      const gy = 0.5 * (prev.x - next.x)
      this.gx[i] = gx
      this.gy[i] = gy
      w += ps[i].invMass * (gx * gx + gy * gy)
    }
    const alpha = AREA_COMPLIANCE / (dt * dt)
    if (w + alpha === 0) return
    const lambda = -c / (w + alpha)
    for (let i = 0; i < n; i++) {
      const p = ps[i]
      p.x += lambda * p.invMass * this.gx[i]
      p.y += lambda * p.invMass * this.gy[i]
    }
  }

  private projectStrut({ a, b, min }: Strut) {
    const w = a.invMass + b.invMass
    if (w === 0) return
    const dx = b.x - a.x
    const dy = b.y - a.y
    const d = Math.hypot(dx, dy) || 1e-9
    if (d >= min) return
    const k = (d - min) / (w * d)
    a.x += dx * k * a.invMass
    a.y += dy * k * a.invMass
    b.x -= dx * k * b.invMass
    b.y -= dy * k * b.invMass
  }

  projectStruts() {
    for (let i = 0; i < this.struts.length; i++) this.projectStrut(this.struts[i])
    for (let i = this.struts.length - 1; i >= 0; i--) this.projectStrut(this.struts[i])
  }

  /** Shape match, with wobble damped toward the letter's rigid motion */
  projectShape() {
    const ps = this.particles
    const n = ps.length
    const fit = this.fit()
    // The letter's own motion: how it's moving and turning as one piece
    let vx = 0
    let vy = 0
    for (const p of ps) {
      vx += p.x - p.px
      vy += p.y - p.py
    }
    vx /= n
    vy /= n
    let spin = 0
    let inertia = 0
    for (const p of ps) {
      const ox = p.x - fit.x
      const oy = p.y - fit.y
      spin += ox * (p.y - p.py - vy) - oy * (p.x - p.px - vx)
      inertia += ox * ox + oy * oy
    }
    const omega = inertia > 1e-9 ? spin / inertia : 0
    const held = this.pull ? Math.min(0.5, 2 * Math.sqrt(SHAPE_STIFFNESS)) : 0
    for (const p of ps) {
      if (p.invMass === 0) continue
      const rigidX = vx - omega * (p.y - fit.y)
      const rigidY = vy + omega * (p.x - fit.x)
      p.px += (p.x - p.px - rigidX) * RIGID_DAMPING
      p.py += (p.y - p.py - rigidY) * RIGID_DAMPING
      if (held > 0) {
        p.px += (p.x - p.px) * held
        p.py += (p.y - p.py) * held
      }
    }
    // Pull toward the rest shape, centred on the pointer while it's held
    const tx = this.pull ? this.pull.x : fit.x
    const ty = this.pull ? this.pull.y : fit.y
    const cos = Math.cos(fit.angle) * this.scale
    const sin = Math.sin(fit.angle) * this.scale
    this.frame = { x: tx, y: ty, angle: fit.angle }
    for (let i = 0; i < n; i++) {
      const p = ps[i]
      if (p.invMass === 0) continue
      const dx = tx + this.rx[i] * cos - this.ry[i] * sin - p.x
      const dy = ty + this.rx[i] * sin + this.ry[i] * cos - p.y
      const d = Math.hypot(dx, dy)
      if (d < 1e-9) continue
      const k = Math.min(SHAPE_STIFFNESS * d, SHAPE_MAX_CORRECTION)
      p.x += (dx / d) * k
      p.y += (dy / d) * k
    }
  }

  private projectEdge(i: number) {
    const ps = this.particles
    const n = ps.length
    const a = ps[i]
    const b = ps[(i + 1) % n]
    const dx = b.x - a.x
    const dy = b.y - a.y
    const d = Math.hypot(dx, dy) || 1e-9
    const rest = this.rest[i]
    const target = d > rest ? rest : d < rest * EDGE_FLOOR ? rest * EDGE_FLOOR : 0
    if (target !== 0) {
      const k = (d - target) / (2 * d)
      a.x += dx * k
      a.y += dy * k
      b.x -= dx * k
      b.y -= dy * k
    }
    // The bend at the next point: smooth it if it turns too sharply
    const c = ps[(i + 2) % n]
    let turn = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(b.y - a.y, b.x - a.x)
    while (turn > Math.PI) turn -= 2 * Math.PI
    while (turn < -Math.PI) turn += 2 * Math.PI
    const t = Math.abs(turn)
    if (t <= SOFT_TURN) return
    const s =
      t > MAX_TURN ? Math.min(TURN_STRENGTH, TURN_STRENGTH * (t - MAX_TURN)) : SOFT_TURN_STRENGTH
    b.x += ((a.x + c.x) / 2 - b.x) * s
    b.y += ((a.y + c.y) / 2 - b.y) * s
  }

  projectEdges() {
    const n = this.particles.length
    for (let i = 0; i < n; i++) this.projectEdge(i)
    for (let i = n - 1; i >= 0; i--) this.projectEdge(i)
  }

  contains(x: number, y: number) {
    return inside(this.particles, x, y)
  }
}

type Box = { minX: number; minY: number; maxX: number; maxY: number; cx: number; cy: number }

export class World {
  bodies: Body[]
  particles: Particle[]
  bounds: Rect
  wall: Rect
  radius: number
  gravity = { x: 0, y: 0 }
  private accumulator = 0
  private parity = 0
  private cells = new Map<number, Particle[]>()
  private boxes: Box[] = []

  constructor(bodies: Body[], bounds: Rect) {
    this.bodies = bodies
    this.particles = bodies.flatMap((b) => b.particles)
    this.bounds = { ...bounds }
    this.wall = { ...bounds }
    this.radius = (Math.max(...bodies.map((b) => b.maxEdge)) + 2) / 2
  }

  step(seconds: number) {
    // A frame stamped before a long setup can arrive with negative time: count it as none
    this.accumulator += Math.max(0, Math.min(seconds, 0.1))
    while (this.accumulator >= STEP) {
      this.accumulator -= STEP
      this.stepOnce()
    }
  }

  stepOnce() {
    this.parity ^= 1
    for (let s = 0; s < SUBSTEPS; s++) this.substep(STEP / SUBSTEPS, (s + this.parity) % 2 === 1)
  }

  wallSettled() {
    const { bounds: b, wall: w } = this
    return b.left === w.left && b.right === w.right && b.top === w.top && b.bottom === w.bottom
  }

  liveliness() {
    let m = 0
    for (const p of this.particles) {
      const d = (p.x - p.px) ** 2 + (p.y - p.py) ** 2
      if (d > m) m = d
    }
    return m
  }

  private substep(dt: number, reverse: boolean) {
    // Walls travel toward their target; their motion this substep is handed to what they touch
    const reach = WALL_SPEED * dt
    const { bounds: b, wall: w } = this
    const dl = b.left <= w.left ? b.left - w.left : Math.min(b.left - w.left, reach)
    const dr = b.right >= w.right ? b.right - w.right : Math.max(b.right - w.right, -reach)
    const db = b.bottom >= w.bottom ? b.bottom - w.bottom : Math.max(b.bottom - w.bottom, -reach)
    const dtp = b.top <= w.top ? b.top - w.top : Math.min(b.top - w.top, reach)
    w.left += dl
    w.right += dr
    w.bottom += db
    w.top += dtp

    const keep = Math.max(0, 1 - DAMPING * dt)
    const friction = 1 - (1 - FRICTION) ** (1 / SUBSTEPS)
    const gx = this.gravity.x * dt * dt
    const gy = this.gravity.y * dt * dt
    for (const p of this.particles) {
      if (p.invMass === 0) continue
      const vx = (p.x - p.px) * keep
      const vy = (p.y - p.py) * keep
      p.px = p.x
      p.py = p.y
      p.x += vx + gx
      p.y += vy + gy
    }

    for (const body of this.bodies) {
      body.projectArea(dt)
      body.projectStruts()
      body.projectShape()
      body.projectEdges()
    }

    this.selfContacts(friction, reverse)
    this.letterContacts(friction, reverse)
    this.walls(friction, dl, dr, db, dtp)
  }

  /** A letter's own points, far apart on its ring, keep their distance: it can't fold into itself */
  private selfContacts(friction: number, reverse: boolean) {
    const size = this.radius * 2
    const key = (cx: number, cy: number) => (cx + 32768) * 65536 + (cy + 32768)
    this.cells.clear()
    for (const p of this.particles) {
      const k = key(Math.floor(p.x / size), Math.floor(p.y / size))
      const cell = this.cells.get(k)
      if (cell) cell.push(p)
      else this.cells.set(k, [p])
    }
    const n = this.particles.length
    for (let s = 0; s < n; s++) {
      const p = this.particles[reverse ? n - 1 - s : s]
      const cx = Math.floor(p.x / size)
      const cy = Math.floor(p.y / size)
      for (let x = cx - 1; x <= cx + 1; x++) {
        for (let y = cy - 1; y <= cy + 1; y++) {
          const cell = this.cells.get(key(x, y))
          if (!cell) continue
          for (const q of cell) {
            if (q.body !== p.body || p.index >= q.index) continue
            const gap = q.index - p.index
            if (Math.min(gap, p.ring - gap) <= SELF_SKIP) continue
            const dx = q.x - p.x
            const dy = q.y - p.y
            const d2 = dx * dx + dy * dy
            if (d2 >= size * size) continue
            const w = p.invMass + q.invMass
            if (w === 0) continue
            const min = Math.min(size, 0.9 * Math.hypot(q.rx - p.rx, q.ry - p.ry))
            const d = Math.sqrt(d2) || 1e-9
            if (d >= min) continue
            const nx = dx / d
            const ny = dy / d
            const k = ((min - d) * CONTACT) / w
            p.x -= nx * k * p.invMass
            p.y -= ny * k * p.invMass
            p.px -= nx * k * p.invMass
            p.py -= ny * k * p.invMass
            q.x += nx * k * q.invMass
            q.y += ny * k * q.invMass
            q.px += nx * k * q.invMass
            q.py += ny * k * q.invMass
            // Friction on the sliding part, and stop them closing further
            const rvx = p.x - p.px - (q.x - q.px)
            const rvy = p.y - p.py - (q.y - q.py)
            const along = rvx * nx + rvy * ny
            let fx = (rvx - along * nx) * friction
            let fy = (rvy - along * ny) * friction
            if (along > 0) {
              fx += along * nx
              fy += along * ny
            }
            p.px += fx * (p.invMass / w)
            p.py += fy * (p.invMass / w)
            q.px -= fx * (q.invMass / w)
            q.py -= fy * (q.invMass / w)
          }
        }
      }
    }
  }

  /** Letters push each other edge against edge; one sunk deep into another is shoved out whole */
  private letterContacts(friction: number, reverse: boolean) {
    const reach = this.radius * 2
    const bodies = this.bodies
    const h = bodies.length
    for (let i = 0; i < h; i++) {
      const ps = bodies[i].particles
      const box: Box = {
        minX: Infinity,
        minY: Infinity,
        maxX: -Infinity,
        maxY: -Infinity,
        cx: 0,
        cy: 0,
      }
      for (const p of ps) {
        if (p.x < box.minX) box.minX = p.x
        if (p.x > box.maxX) box.maxX = p.x
        if (p.y < box.minY) box.minY = p.y
        if (p.y > box.maxY) box.maxY = p.y
        box.cx += p.x
        box.cy += p.y
      }
      box.cx /= ps.length
      box.cy /= ps.length
      this.boxes[i] = box
    }
    const pairs: [number, number][] = []
    for (let i = 0; i < h - 1; i++) {
      for (let j = i + 1; j < h; j++) {
        const a = this.boxes[i]
        const b = this.boxes[j]
        if (
          a.minX > b.maxX + reach ||
          b.minX > a.maxX + reach ||
          a.minY > b.maxY + reach ||
          b.minY > a.maxY + reach
        )
          continue
        pairs.push([i, j])
      }
    }
    for (let s = 0; s < pairs.length; s++) {
      const [i, j] = pairs[reverse ? pairs.length - 1 - s : s]
      const A = bodies[i]
      const B = bodies[j]
      const a = this.boxes[i]
      const b = this.boxes[j]
      if (
        (inside(B.particles, a.cx, a.cy) && this.sunk(A, B)) ||
        (inside(A.particles, b.cx, b.cy) && this.sunk(B, A))
      ) {
        let nx = a.cx - b.cx
        let ny = a.cy - b.cy
        const l = Math.hypot(nx, ny)
        if (l > 1e-6) {
          nx /= l
          ny /= l
        } else {
          nx = 1
          ny = 0
        }
        const na = A.particles.length
        const nb = B.particles.length
        const ka = (SHOVE * nb) / (na + nb)
        const kb = (SHOVE * na) / (na + nb)
        for (const p of A.particles) {
          p.x += nx * ka
          p.y += ny * ka
          p.px += nx * ka
          p.py += ny * ka
        }
        for (const p of B.particles) {
          p.x -= nx * kb
          p.y -= ny * kb
          p.px -= nx * kb
          p.py -= ny * kb
        }
      }
      const zone = {
        minX: Math.max(a.minX, b.minX) - reach,
        minY: Math.max(a.minY, b.minY) - reach,
        maxX: Math.min(a.maxX, b.maxX) + reach,
        maxY: Math.min(a.maxY, b.maxY) + reach,
      }
      const first = reverse ? B : A
      const second = reverse ? A : B
      this.pushOut(first, second, zone, friction, reverse)
      this.pushOut(second, first, zone, friction, reverse)
    }
  }

  private sunk(a: Body, b: Body) {
    const ps = a.particles
    const stride = Math.max(1, ps.length >> 4)
    let hits = 0
    let tries = 0
    for (let i = 0; i < ps.length; i += stride) {
      tries++
      if (inside(b.particles, ps[i].x, ps[i].y)) hits++
    }
    return hits / tries > SUNK
  }

  /** Each point of one letter, near or inside the other, is pushed off the other's nearest edge */
  private pushOut(
    mover: Body,
    other: Body,
    zone: { minX: number; minY: number; maxX: number; maxY: number },
    friction: number,
    reverse: boolean,
  ) {
    const reach = this.radius * 2
    const edge = other.particles
    const m = edge.length
    const ps = mover.particles
    const n = ps.length
    for (let s = 0; s < n; s++) {
      const z = ps[reverse ? n - 1 - s : s]
      if (z.x < zone.minX || z.x > zone.maxX || z.y < zone.minY || z.y > zone.maxY) continue
      let within = false
      let best = Infinity
      let at = 0
      let t = 0
      let cx = 0
      let cy = 0
      for (let k = 0; k < m; k++) {
        const a = edge[k]
        const b = edge[(k + 1) % m]
        if (a.y > z.y !== b.y > z.y && z.x < a.x + ((z.y - a.y) * (b.x - a.x)) / (b.y - a.y))
          within = !within
        const ex = b.x - a.x
        const ey = b.y - a.y
        const l2 = ex * ex + ey * ey || 1e-9
        let u = ((z.x - a.x) * ex + (z.y - a.y) * ey) / l2
        u = u < 0 ? 0 : u > 1 ? 1 : u
        const qx = a.x + u * ex
        const qy = a.y + u * ey
        const d2 = (z.x - qx) ** 2 + (z.y - qy) ** 2
        if (d2 < best) {
          best = d2
          at = k
          t = u
          cx = qx
          cy = qy
        }
      }
      if (!within && best >= reach * reach) continue
      const a = edge[at]
      const b = edge[(at + 1) % m]
      const d = Math.sqrt(best)
      let nx: number
      let ny: number
      if (d > 1e-6) {
        nx = (z.x - cx) / d
        ny = (z.y - cy) / d
        if (within) {
          nx = -nx
          ny = -ny
        }
      } else {
        const sign = Math.sign(other.baseArea) || 1
        const ex = b.x - a.x
        const ey = b.y - a.y
        const el = Math.hypot(ex, ey) || 1e-9
        nx = (sign * ey) / el
        ny = (-sign * ex) / el
      }
      const depth = within ? d + reach : reach - d
      const wa = 1 - t
      const wb = t
      const w = z.invMass + wa * wa * a.invMass + wb * wb * b.invMass
      if (w === 0) continue
      const k = (Math.min(depth, MAX_PUSH) * CONTACT) / w
      const kz = k * z.invMass
      z.x += nx * kz
      z.y += ny * kz
      z.px += nx * kz
      z.py += ny * kz
      const ka = k * wa * a.invMass
      a.x -= nx * ka
      a.y -= ny * ka
      a.px -= nx * ka
      a.py -= ny * ka
      const kb = k * wb * b.invMass
      b.x -= nx * kb
      b.y -= ny * kb
      b.px -= nx * kb
      b.py -= ny * kb
      // Friction against the edge's own motion; and no further approach
      const f = within ? 0 : friction
      const evx = wa * (a.x - a.px) + wb * (b.x - b.px)
      const evy = wa * (a.y - a.py) + wb * (b.y - b.py)
      const rvx = z.x - z.px - evx
      const rvy = z.y - z.py - evy
      const along = rvx * nx + rvy * ny
      let fx = (rvx - along * nx) * f
      let fy = (rvy - along * ny) * f
      if (along < 0) {
        fx += along * nx
        fy += along * ny
      }
      z.px += fx * (z.invMass / w)
      z.py += fy * (z.invMass / w)
      a.px -= fx * ((wa * a.invMass) / w)
      a.py -= fy * ((wa * a.invMass) / w)
      b.px -= fx * ((wb * b.invMass) / w)
      b.py -= fy * ((wb * b.invMass) / w)
    }
  }

  /** The walls hold the points in (a radius inside), carry them as they move, and grip them */
  private walls(friction: number, dl: number, dr: number, db: number, dt: number) {
    const r = this.radius
    const w = this.wall
    const left = w.left + r
    const right = w.right - r
    const bottom = w.bottom - r
    const top = w.top + r
    for (const p of this.particles) {
      if (p.invMass === 0) continue
      if (p.x < left) {
        p.x = left
        p.px = p.x - dl
        p.py += (p.y - p.py) * friction
      } else if (p.x > right) {
        p.x = right
        p.px = p.x - dr
        p.py += (p.y - p.py) * friction
      }
      if (p.y > bottom) {
        p.y = bottom
        p.py = p.y - db
        p.px += (p.x - p.px) * friction
      } else if (p.y < top) {
        p.y = top
        p.py = p.y - dt
        p.px += (p.x - p.px) * friction
      }
    }
  }

  /** The letter under the point, topmost first */
  pick(x: number, y: number): Body | null {
    for (let i = this.bodies.length - 1; i >= 0; i--)
      if (this.bodies[i].contains(x, y)) return this.bodies[i]
    return null
  }
}
