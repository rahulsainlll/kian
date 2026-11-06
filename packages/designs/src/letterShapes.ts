import type { Vec } from "./softBody"

export type LetterShape = {
  outline: Vec[]
  holes: Vec[][]
  /** Where the letter's inner corners were before it was fattened: where its nicks go */
  corners: Vec[]
  width: number
  height: number
}

// Moore-neighbour directions, clockwise on screen (y points down): E, SE, S, SW, W, NW, N, NE
const DIRS = [
  [1, 0],
  [1, 1],
  [0, 1],
  [-1, 1],
  [-1, 0],
  [-1, -1],
  [0, -1],
  [1, -1],
] as const

const dirOf = (dx: number, dy: number) => DIRS.findIndex(([x, y]) => x === dx && y === dy)

/** The boundary of a blob of cells, walked clockwise from its first cell */
function trace(inside: (x: number, y: number) => boolean, sx: number, sy: number): Vec[] {
  const out: Vec[] = [{ x: sx, y: sy }]
  let x = sx
  let y = sy
  let back = 4 // we arrived from the west: the cell there is outside
  for (let guard = 0; guard < 200_000; guard++) {
    let found = false
    for (let k = 1; k <= 8; k++) {
      const d = (back + k) % 8
      const nx = x + DIRS[d][0]
      const ny = y + DIRS[d][1]
      if (inside(nx, ny)) {
        // The cell checked just before this one was outside: look back toward it next time
        const pd = (back + k - 1) % 8
        const bx = x + DIRS[pd][0]
        const by = y + DIRS[pd][1]
        back = dirOf(bx - nx, by - ny)
        x = nx
        y = ny
        found = true
        break
      }
    }
    if (!found || (x === sx && y === sy)) break
    out.push({ x, y })
  }
  return out
}

/** Smooth the pixel stair-steps away, then space points evenly along the outline */
export function tidy(points: Vec[], count: number, passes = 4): Vec[] {
  let ps = points
  for (let pass = 0; pass < passes; pass++) {
    const n = ps.length
    ps = ps.map((_, i) => {
      let x = 0
      let y = 0
      for (let k = -2; k <= 2; k++) {
        const q = ps[(i + k + n) % n]
        x += q.x
        y += q.y
      }
      return { x: x / 5, y: y / 5 }
    })
  }
  const n = ps.length
  const lengths = [0]
  for (let i = 1; i <= n; i++) {
    const a = ps[i - 1]
    const b = ps[i % n]
    lengths.push(lengths[i - 1] + Math.hypot(b.x - a.x, b.y - a.y))
  }
  const total = lengths[n]
  const out: Vec[] = []
  let j = 0
  for (let k = 0; k < count; k++) {
    const at = (k / count) * total
    while (lengths[j + 1] < at) j++
    const a = ps[j]
    const b = ps[(j + 1) % n]
    const t = (at - lengths[j]) / (lengths[j + 1] - lengths[j] || 1)
    out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t })
  }
  return out
}

/**
 * Letters a font can't make into a good balloon (an E's arms close into a block), drawn
 * instead from fat rounded bars, in units of the size about the centre. Where the bars' round
 * ends meet they leave rounded scoops with a sharp point at the bottom, where the nicks go: the
 * way softle.app draws its E.
 */
// [left, top, right, bottom, then corner radii: top-left, top-right, bottom-right, bottom-left]
type Bar = [number, number, number, number, number, number, number, number]
const BLOBS: Record<string, Bar[]> = {
  // A fat spine and three arms stacked edge to edge: their round ends leave the scoops
  E: [
    [-0.32, -0.47, 0.0, 0.49, 0.24, 0, 0, 0.24], // spine
    [-0.32, -0.47, 0.25, -0.13, 0.24, 0.14, 0.2, 0], // top arm
    [-0.32, -0.13, 0.17, 0.13, 0, 0.13, 0.13, 0], // middle arm, a little shorter
    [-0.32, 0.13, 0.25, 0.49, 0, 0.2, 0.16, 0.24], // bottom arm
  ],
}

/**
 * One character as a soft letter: set in the given font at its heaviest, then fattened with a
 * round stroke until it's a balloon, small counters closing up as softle.app's do (an O keeps
 * a small hole). Returns a dense, smooth outline and any holes, centred on the origin, for the
 * caller to space out at its final size.
 */
export function letterShape(
  char: string,
  font: string,
  size: number,
  spacing: number,
): LetterShape {
  const pad = Math.ceil(size * 0.4)
  const w = Math.ceil(size * 1.4) + pad * 2
  const h = Math.ceil(size * 1.4) + pad * 2
  const canvas = document.createElement("canvas")
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext("2d", { willReadFrequently: true })
  if (!ctx) return { outline: [], holes: [], corners: [], width: 0, height: 0 }
  ctx.font = `900 ${size}px ${font}`
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.lineJoin = "round"
  ctx.fillStyle = "#000"
  ctx.strokeStyle = "#000"
  const blob = BLOBS[char]
  /** The character fattened by a round stroke of this width, as inked cells and its rim */
  const render = (stroke: number) => {
    ctx.clearRect(0, 0, w, h)
    ctx.lineWidth = stroke
    if (blob) {
      const X = (u: number) => w / 2 + u * size
      const Y = (u: number) => h / 2 + u * size
      ctx.beginPath()
      for (const [l, t, r, b, ...radii] of blob) {
        ctx.roundRect(
          X(l),
          Y(t),
          (r - l) * size,
          (b - t) * size,
          radii.map((v) => v * size),
        )
      }
      ctx.fill("nonzero")
      ctx.stroke()
    } else {
      ctx.fillText(char, w / 2, h / 2)
      ctx.strokeText(char, w / 2, h / 2)
    }
    const alpha = ctx.getImageData(0, 0, w, h).data
    const cells = new Uint8Array(w * h)
    for (let i = 0; i < w * h; i++) cells[i] = alpha[i * 4 + 3] > 127 ? 1 : 0
    const at = (x: number, y: number) =>
      x >= 0 && y >= 0 && x < w && y < h && cells[y * w + x] === 1
    let first = -1
    for (let i = 0; i < w * h; i++)
      if (cells[i]) {
        first = i
        break
      }
    return { cells, rim: first === -1 ? [] : trace(at, first % w, Math.floor(first / w)) }
  }

  // Lightly fattened first, to find the inner corners and the ends of narrow gaps (between an
  // E's arms, at an R's leg); then fat, so those gaps close and the letter is one balloon
  const thin = render(blob ? size * 0.01 : size * 0.09)
  const thinPoints = tidy(thin.rim, Math.max(16, Math.round(thin.rim.length / 4)), 2)
  const inner = notchesOf(thinPoints, 0, 0.8)
  const fat = blob ? render(size * 0.03) : render(size * 0.17)
  const ink = fat.cells
  const rim = fat.rim
  if (rim.length === 0) return { outline: [], holes: [], corners: [], width: 0, height: 0 }
  // From each inner corner, walk out along the gap it opens onto until leaving the balloon:
  // that's where the closed-up gap meets the outline, and where its nick belongs
  let thinArea = 0
  for (let i = 0; i < thinPoints.length; i++) {
    const p = thinPoints[i]
    const q = thinPoints[(i + 1) % thinPoints.length]
    thinArea += p.x * q.y - q.x * p.y
  }
  const winding = Math.sign(thinArea) || 1
  const corners: Vec[] = []
  for (const { i } of inner) {
    const n = thinPoints.length
    const a = thinPoints[(i - 2 + n) % n]
    const b = thinPoints[(i + 2) % n]
    const tx = b.x - a.x
    const ty = b.y - a.y
    const tl = Math.hypot(tx, ty) || 1
    const ox = (ty / tl) * winding
    const oy = (-tx / tl) * winding
    let x = thinPoints[i].x
    let y = thinPoints[i].y
    for (let step = 0; step < size; step++) {
      const cx = Math.round(x)
      const cy = Math.round(y)
      if (cx < 0 || cy < 0 || cx >= w || cy >= h || !ink[cy * w + cx]) break
      x += ox
      y += oy
    }
    corners.push({ x, y })
  }

  // Holes: blank cells the outside can't reach
  const outside = new Uint8Array(w * h)
  const stack: number[] = [0]
  outside[0] = 1
  while (stack.length) {
    const i = stack.pop() as number
    const x = i % w
    const y = Math.floor(i / w)
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const nx = x + dx
      const ny = y + dy
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue
      const j = ny * w + nx
      if (outside[j] || ink[j]) continue
      outside[j] = 1
      stack.push(j)
    }
  }
  const seen = new Uint8Array(w * h)
  const holes: Vec[][] = []
  for (let i = 0; i < w * h; i++) {
    if (ink[i] || outside[i] || seen[i]) continue
    // Mark this hole, counting its cells
    let cells = 0
    const fill = [i]
    seen[i] = 1
    while (fill.length) {
      const k = fill.pop() as number
      cells++
      const x = k % w
      const y = Math.floor(k / w)
      for (const [dx, dy] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]) {
        const j = (y + dy) * w + (x + dx)
        if (j < 0 || j >= w * h || ink[j] || outside[j] || seen[j]) continue
        seen[j] = 1
        fill.push(j)
      }
    }
    if (cells < size * size * 0.003) continue
    const inHole = (x: number, y: number) => {
      if (x < 0 || y < 0 || x >= w || y >= h) return false
      const j = y * w + x
      return !ink[j] && !outside[j]
    }
    const loop = trace(inHole, i % w, Math.floor(i / w))
    const perimeter = loop.length
    holes.push(tidy(loop, Math.max(12, Math.round(perimeter / spacing)), 3))
  }

  const outline = tidy(rim, Math.max(16, Math.round(rim.length / spacing)), 3)
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  for (const p of outline) {
    minX = Math.min(minX, p.x)
    maxX = Math.max(maxX, p.x)
    minY = Math.min(minY, p.y)
    maxY = Math.max(maxY, p.y)
  }
  const cx = (minX + maxX) / 2
  const cy = (minY + maxY) / 2
  const centre = (p: Vec) => ({ x: p.x - cx, y: p.y - cy })
  return {
    outline: outline.map(centre),
    holes: holes.map((hole) => hole.map(centre)),
    corners: corners.map(centre),
    width: maxX - minX,
    height: maxY - minY,
  }
}

/**
 * Inner corners worth a nick: where the outline turns sharply inward, the way softle.app marks
 * the joins of its letters. Takes evenly spaced points and the outline's winding.
 */
export function notchesOf(
  points: Vec[],
  depth: number,
  threshold = 0.6,
): { i: number; depth: number }[] {
  const n = points.length
  let area = 0
  for (let i = 0; i < n; i++) {
    const p = points[i]
    const q = points[(i + 1) % n]
    area += p.x * q.y - q.x * p.y
  }
  const sign = Math.sign(area) || 1
  const reach = 2
  const turn = points.map((_, i) => {
    const a = points[(i - reach + n) % n]
    const b = points[i]
    const c = points[(i + reach) % n]
    let t = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(b.y - a.y, b.x - a.x)
    while (t > Math.PI) t -= 2 * Math.PI
    while (t < -Math.PI) t += 2 * Math.PI
    return -t * sign // positive where it bends inward
  })
  const out: { i: number; depth: number }[] = []
  for (let i = 0; i < n; i++) {
    const t = turn[i]
    if (t < threshold) continue
    let peak = true
    for (let k = -3; k <= 3; k++) if (k !== 0 && turn[(i + k + n) % n] > t) peak = false
    if (peak && !out.some((o) => Math.min(Math.abs(o.i - i), n - Math.abs(o.i - i)) < 5))
      out.push({ i, depth })
  }
  return out
}
