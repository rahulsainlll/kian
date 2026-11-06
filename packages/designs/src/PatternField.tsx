"use client"

import { type ComponentProps, useEffect, useRef } from "react"
import * as THREE from "three"
import { cn } from "./utils"
import "./designs.css"

export type PatternColors = { ground: string; dark: string; mid: string; light: string }

// Pink ground, blue and yellow inks, white lines: the default palette
const DEFAULT_COLORS: PatternColors = {
  ground: "#fab8d5",
  dark: "#0000ff",
  mid: "#f5f641",
  light: "#ffffff",
}

export type PatternFieldProps = Omit<ComponentProps<"div">, "children"> & {
  /** The picture the field draws, covering it. A soft generated picture by default. */
  image?: string
  /** Fade the field's bottom 30% into the ground. Off by default. */
  bottomFade?: boolean
  /** The four colours it draws with: the ground, the dark and mid inks, and the light lines. */
  colors?: PatternColors
  /**
   * `"auto"`: the picture in colour all the time, moving on its own, the pointer leaving a trail.
   * `"hover"`: the picture in grey, shown in colour wherever the pointer stirs it, draining back
   * to grey. Hover by default.
   */
  mode?: PatternMode
}

export type PatternMode = "auto" | "hover"

/*
 * After brand.base.org/motion. Two layers:
 *
 * 1. A small fluid simulation (stable fluids): the pointer's moves splat velocity and dye into
 *    it; each step adds swirl, removes divergence with a few pressure passes, and carries
 *    velocity and dye along, both fading. It runs at 30 steps a second.
 * 2. A display pass that draws a picture as 8px tiles of vertical bars: each tile's brightness
 *    (with a slow wobble) picks how wide its bar is and its colours. Wherever the fluid's dye
 *    is, tiles switch to a second set of shapes in the palette: the trail. In hover mode the
 *    bars are grey, and where the dye is thick the picture shows through in colour.
 *
 * On first show the picture comes up out of black over 1.6s.
 */

const SIM_RES = 128
const DYE_RES = 512
const PRESSURE_PASSES = 6
const CURL = 48
const DENSITY_DISSIPATION = 0.96
const VELOCITY_DISSIPATION = 0.9
const PRESSURE_DISSIPATION = 0.92
const SPLAT_RADIUS = 0.45 / 100
const SPLAT_FORCE = 3 // pointer px per move, times this, becomes velocity
const STEP_MS = 33 // the simulation and the picture both update at most 30 times a second
const TILE = 8 // px
const TRAIL_THRESHOLD = 0.1 // dye above this turns a tile into a trail shape...
const REVEAL_THRESHOLD = 0.25 // ...and above this, into the picture in colour
const INTRO_MS = 1600
const INTRO_EASE = [0.23, 1, 0.32, 1] as const

/** A cubic-bezier easing, solved by bisection: plenty for one value a frame */
function bezier([x1, y1, x2, y2]: readonly [number, number, number, number]) {
  const at = (t: number, a: number, b: number) =>
    3 * (1 - t) * (1 - t) * t * a + 3 * (1 - t) * t * t * b + t * t * t
  return (x: number) => {
    let lo = 0
    let hi = 1
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2
      if (at(mid, x1, x2) < x) lo = mid
      else hi = mid
    }
    return at((lo + hi) / 2, y1, y2)
  }
}

/**
 * The default picture: crisp-edged shapes on a light ground, a spread of tones, and heavy grain,
 * so neighbouring tiles differ and the trail mixes its shapes instead of pooling into one.
 */
function defaultPicture(): HTMLCanvasElement {
  const c = document.createElement("canvas")
  c.width = 768
  c.height = 512
  const g = c.getContext("2d")
  if (!g) return c
  g.fillStyle = "#000"
  g.fillRect(0, 0, c.width, c.height)
  const grey = (v: number) => `rgb(${v},${v},${v})`

  // An upper wing: a big leaning lobe, darker at its root, with two bright bands across it
  g.save()
  g.translate(470, 210)
  g.rotate(-0.35)
  g.beginPath()
  g.ellipse(0, 0, 230, 150, 0, 0, Math.PI * 2)
  const wing = g.createLinearGradient(-230, 0, 230, 0)
  wing.addColorStop(0, grey(38))
  wing.addColorStop(0.6, grey(80))
  wing.addColorStop(1, grey(55))
  g.fillStyle = wing
  g.fill()
  g.clip()
  g.fillStyle = grey(225)
  g.fillRect(-60, -160, 46, 320)
  g.fillRect(10, -160, 26, 320)
  g.restore()

  // A lower wing, overlapping, a step darker, with its own faint band
  g.save()
  g.translate(430, 360)
  g.rotate(0.2)
  g.beginPath()
  g.ellipse(0, 0, 190, 105, 0, 0, Math.PI * 2)
  g.fillStyle = grey(45)
  g.fill()
  g.clip()
  g.fillStyle = grey(150)
  g.fillRect(40, -120, 34, 240)
  g.restore()

  // A body and two antennae: thin lines catch a line of tiles each
  g.fillStyle = grey(60)
  g.beginPath()
  g.ellipse(250, 300, 70, 26, 0.5, 0, Math.PI * 2)
  g.fill()
  g.strokeStyle = grey(75)
  g.lineWidth = 7
  g.lineCap = "round"
  g.beginPath()
  g.moveTo(205, 268)
  g.quadraticCurveTo(150, 170, 110, 120)
  g.moveTo(215, 262)
  g.quadraticCurveTo(190, 160, 165, 110)
  g.stroke()

  // Grain on everything that isn't black
  const img = g.getImageData(0, 0, c.width, c.height)
  const d = img.data
  let seed = 7
  const random = () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }
  // ...then turn it over: a light ground with dark shapes, as a photo of a plant on white reads
  for (let i = 0; i < d.length; i += 4) {
    const v = d[i] < 8 ? 0 : Math.max(12, Math.min(255, d[i] + (random() - 0.5) * 70))
    d[i] = 255 - v
    d[i + 1] = d[i]
    d[i + 2] = d[i]
  }
  g.putImageData(img, 0, 0)
  return c
}

const quadVertex = /* glsl */ `
  varying vec2 vUv;
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;
  uniform vec2 texelSize;
  void main () {
    vUv = uv;
    vL = vUv - vec2(texelSize.x, 0.0);
    vR = vUv + vec2(texelSize.x, 0.0);
    vT = vUv + vec2(0.0, texelSize.y);
    vB = vUv - vec2(0.0, texelSize.y);
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

const SHADERS = {
  // Scale a texture (the pressure is mostly cleared each step)
  clear: /* glsl */ `
    varying vec2 vUv;
    uniform sampler2D uTexture;
    uniform float value;
    void main () { gl_FragColor = value * texture2D(uTexture, vUv); }
  `,
  // Add a soft dab of colour (velocity or dye) at a point
  splat: /* glsl */ `
    varying vec2 vUv;
    uniform sampler2D uTarget;
    uniform float aspectRatio;
    uniform vec3 color;
    uniform vec2 point;
    uniform float radius;
    void main () {
      vec2 p = vUv - point;
      p.x *= aspectRatio;
      vec3 splat = exp(-dot(p, p) / radius) * color;
      gl_FragColor = vec4(texture2D(uTarget, vUv).xyz + splat, 1.0);
    }
  `,
  // Carry a quantity along the velocity, fading it
  advection: /* glsl */ `
    varying vec2 vUv;
    uniform sampler2D uVelocity;
    uniform sampler2D uSource;
    uniform vec2 texelSize;
    uniform float dt;
    uniform float dissipation;
    void main () {
      vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
      gl_FragColor = vec4(dissipation * texture2D(uSource, coord).xyz, 1.0);
    }
  `,
  divergence: /* glsl */ `
    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uVelocity;
    void main () {
      float L = texture2D(uVelocity, vL).x;
      float R = texture2D(uVelocity, vR).x;
      float T = texture2D(uVelocity, vT).y;
      float B = texture2D(uVelocity, vB).y;
      gl_FragColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
    }
  `,
  curl: /* glsl */ `
    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uVelocity;
    void main () {
      float L = texture2D(uVelocity, vL).y;
      float R = texture2D(uVelocity, vR).y;
      float T = texture2D(uVelocity, vT).x;
      float B = texture2D(uVelocity, vB).x;
      gl_FragColor = vec4(0.5 * (R - L - T + B), 0.0, 0.0, 1.0);
    }
  `,
  // Push the flow round its eddies, keeping it lively
  vorticity: /* glsl */ `
    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uVelocity;
    uniform sampler2D uCurl;
    uniform float curl;
    uniform float dt;
    void main () {
      float L = texture2D(uCurl, vL).x;
      float R = texture2D(uCurl, vR).x;
      float T = texture2D(uCurl, vT).x;
      float B = texture2D(uCurl, vB).x;
      float C = texture2D(uCurl, vUv).x;
      vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
      force /= length(force) + 0.0001;
      force *= curl * C;
      force.y *= -1.0;
      vec2 vel = texture2D(uVelocity, vUv).xy;
      gl_FragColor = vec4(vel + force * dt, 0.0, 1.0);
    }
  `,
  pressure: /* glsl */ `
    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uPressure;
    uniform sampler2D uDivergence;
    void main () {
      float L = texture2D(uPressure, vL).x;
      float R = texture2D(uPressure, vR).x;
      float T = texture2D(uPressure, vT).x;
      float B = texture2D(uPressure, vB).x;
      float divergence = texture2D(uDivergence, vUv).x;
      gl_FragColor = vec4((L + R + B + T - divergence) * 0.25, 0.0, 0.0, 1.0);
    }
  `,
  gradientSubtract: /* glsl */ `
    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uPressure;
    uniform sampler2D uVelocity;
    void main () {
      float L = texture2D(uPressure, vL).x;
      float R = texture2D(uPressure, vR).x;
      float T = texture2D(uPressure, vT).x;
      float B = texture2D(uPressure, vB).x;
      vec2 velocity = texture2D(uVelocity, vUv).xy - vec2(R - L, T - B);
      gl_FragColor = vec4(velocity, 0.0, 1.0);
    }
  `,
}

const displayVertex = /* glsl */ `
  varying vec2 vUv;
  void main () {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

// The picture as tiles of bars, and trail shapes where the dye is
const displayFragment = /* glsl */ `
  varying vec2 vUv;
  uniform sampler2D uImage;
  uniform vec2 uImageSize;
  uniform sampler2D uDye;
  uniform vec2 uResolution;
  uniform float uDpr;
  uniform float uTile;
  uniform float uTime;
  uniform float uBrightness;
  uniform float uContrast;
  uniform float uExposure;
  uniform float uThreshold;
  uniform float uReveal;
  uniform float uAuto;
  uniform float uBottomFade;
  uniform vec3 uGround;
  uniform vec3 uDarkInk;
  uniform vec3 uMidInk;
  uniform vec3 uLight;

  const float TIME_SPEED = 0.5;
  const float SPATIAL_FREQ = 0.008;
  const float TIME_AMPLITUDE = 0.1;
  // The grey state's stand-ins: the ground is white
  const float GREY_LINE = 0.925;
  const float GREY_DARK = 0.9;
  const float GREY_MID = 0.96;

  float lightness(vec3 c) { return 0.299 * c.r + 0.587 * c.g + 0.114 * c.b; }

  vec3 grade(vec3 c) {
    c = clamp(c * pow(2.0, uExposure), 0.0, 1.0);
    c = clamp(c + uBrightness, 0.0, 1.0);
    c = clamp((c - 0.5) * uContrast + 0.5, 0.0, 1.0);
    return c;
  }

  // Cover the field with the picture, as background-size: cover
  vec2 cover(vec2 uv) {
    vec2 field = uResolution / max(uResolution.x, uResolution.y);
    vec2 pic = uImageSize / max(uImageSize.x, uImageSize.y);
    vec2 s = field / pic;
    float fit = max(s.x, s.y);
    vec2 size = pic * fit;
    return (uv * field - (field - size) * 0.5) / size;
  }

  // A bar down the middle of the tile, this share of its width
  float bar(vec2 p, float width) {
    return step(abs(p.x - 0.5), width * 0.5);
  }

  // The trail's shapes in the palette, plainest to boldest: nothing, a light dot, a mid
  // diamond, a dark line, a mid disc, a dark square with a light hole
  vec4 trailShape(int i, vec2 p) {
    vec2 q = p - 0.5;
    if (i == 1) return vec4(uLight, step(length(q), 0.25));
    if (i == 2) return vec4(uMidInk, step(abs(q.x) + abs(q.y), 0.36));
    if (i == 3) return vec4(uDarkInk, step(abs(q.x), 0.125));
    if (i == 4) return vec4(uMidInk, step(length(q), 0.5));
    if (i == 5) return length(q) < 0.25 ? vec4(uLight, 1.0) : vec4(uDarkInk, 1.0);
    return vec4(0.0);
  }

  void main () {
    vec2 pix = gl_FragCoord.xy / uDpr;
    vec2 tile = floor(pix / uTile);
    vec2 centre = (tile * uTile + uTile * 0.5) / uResolution;
    vec2 picUv = cover(centre);
    vec2 inTile = mod(pix, uTile) / uTile;

    vec3 blank = uAuto > 0.5 ? uGround : vec3(1.0);
    vec3 colour = blank;
    if (picUv.x >= 0.0 && picUv.x <= 1.0 && picUv.y >= 0.0 && picUv.y <= 1.0) {
      vec3 original = grade(texture2D(uImage, vec2(picUv.x, 1.0 - picUv.y)).rgb);
      float lum = lightness(original);
      lum = clamp(lum + sin(uTime * TIME_SPEED + dot(tile, vec2(SPATIAL_FREQ))) * TIME_AMPLITUDE, 0.0, 1.0);

      // The picture in colour. Light parts: the ground with fine light lines. Mid tones: the
      // mid ink in bars over the dark ink. Darks: solid dark ink, split by hairlines of light.
      // The grey state is the same picture, tile for tile, with greys for the four colours
      vec3 regular;
      vec3 grey;
      if (lum >= 0.78) {
        regular = mix(uGround, uLight, bar(inTile, 0.25));
        grey = mix(vec3(1.0), vec3(GREY_LINE), bar(inTile, 0.25));
      } else if (lum >= 0.6) {
        regular = mix(uGround, uLight, bar(inTile, 0.45));
        grey = mix(vec3(1.0), vec3(GREY_LINE), bar(inTile, 0.45));
      } else if (lum >= 0.45) {
        regular = mix(uDarkInk, uMidInk, bar(inTile, 0.75));
        grey = mix(vec3(GREY_DARK), vec3(GREY_MID), bar(inTile, 0.75));
      } else if (lum >= 0.3) {
        regular = mix(uDarkInk, uMidInk, bar(inTile, 0.35));
        grey = mix(vec3(GREY_DARK), vec3(GREY_MID), bar(inTile, 0.35));
      } else if (lum >= 0.15) {
        regular = mix(uDarkInk, uLight, bar(inTile, 0.2));
        grey = mix(vec3(GREY_DARK), vec3(1.0), bar(inTile, 0.2));
      } else {
        regular = mix(uDarkInk, uLight, bar(inTile, 0.1));
        grey = mix(vec3(GREY_DARK), vec3(1.0), bar(inTile, 0.1));
      }

      // The trail: shapes in the palette where the dye is, darker picture, bolder shape.
      // Auto: over the picture in colour. Hover: over the grey, and where the dye is thick,
      // the picture in colour shows through
      float paint = dot(texture2D(uDye, centre).rgb, vec3(1.0 / 3.0));
      float depth = 1.0 - lum;
      int trailIndex = depth < 0.1 ? 0 : depth < 0.3 ? 1 : depth < 0.5 ? 2 : depth < 0.7 ? 3 : depth < 0.9 ? 4 : 5;
      vec4 shape = trailShape(trailIndex, inTile);
      vec3 trail = mix(uGround, shape.rgb, shape.a);
      vec3 rest = uAuto > 0.5 ? regular : paint > uReveal ? regular : grey;
      colour = paint > uThreshold && (uAuto > 0.5 || paint <= uReveal) ? trail : rest;
    }

    if (uBottomFade > 0.5) {
      float f = smoothstep(0.0, 0.3, vUv.y);
      f = f * f * (3.0 - 2.0 * f);
      colour = mix(blank, colour, f);
    }
    gl_FragColor = vec4(colour, 1.0);
  }
`

type Pair = { read: THREE.WebGLRenderTarget; write: THREE.WebGLRenderTarget; swap: () => void }

/**
 * A picture drawn in light grey bars, which the pointer stirs like water: where it stirs, the
 * picture shows through in colour, then drains back to grey. After brand.base.org/motion.
 */
export function PatternField({
  image,
  bottomFade = false,
  colors = DEFAULT_COLORS,
  mode = "hover",
  className,
  ...props
}: PatternFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // Read each step, so switching modes keeps the fluid as it is
  const modeRef = useRef(mode)
  const wakeRef = useRef<() => void>(() => {})
  useEffect(() => {
    modeRef.current = mode
    wakeRef.current()
  }, [mode])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false })
    } catch {
      return
    }
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    renderer.setPixelRatio(dpr)
    renderer.autoClear = false

    const target = (size: number, filter: THREE.MagnificationTextureFilter) =>
      new THREE.WebGLRenderTarget(size, size, {
        minFilter: filter,
        magFilter: filter,
        format: THREE.RGBAFormat,
        type: THREE.HalfFloatType,
        depthBuffer: false,
        stencilBuffer: false,
      })
    const pair = (size: number, filter: THREE.MagnificationTextureFilter): Pair => {
      const p = {
        read: target(size, filter),
        write: target(size, filter),
        swap() {
          const t = p.read
          p.read = p.write
          p.write = t
        },
      }
      return p
    }
    const velocity = pair(SIM_RES, THREE.NearestFilter)
    const dye = pair(DYE_RES, THREE.LinearFilter)
    const pressure = pair(SIM_RES, THREE.LinearFilter)
    const divergence = target(SIM_RES, THREE.NearestFilter)
    const curl = target(SIM_RES, THREE.NearestFilter)

    // One full-screen triangle, reused for every pass
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3),
    )
    geometry.setAttribute("uv", new THREE.BufferAttribute(new Float32Array([0, 0, 2, 0, 0, 2]), 2))
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    const scene = new THREE.Scene()
    const quad = new THREE.Mesh(geometry)
    quad.frustumCulled = false
    scene.add(quad)

    const texel = new THREE.Vector2(1 / SIM_RES, 1 / SIM_RES)
    const material = (fragmentShader: string, uniforms: Record<string, THREE.IUniform>) =>
      new THREE.ShaderMaterial({
        vertexShader: quadVertex,
        fragmentShader,
        uniforms: { texelSize: { value: texel }, ...uniforms },
        depthTest: false,
        depthWrite: false,
      })
    const m = {
      clear: material(SHADERS.clear, {
        uTexture: { value: null },
        value: { value: PRESSURE_DISSIPATION },
      }),
      splat: material(SHADERS.splat, {
        uTarget: { value: null },
        aspectRatio: { value: 1 },
        color: { value: new THREE.Vector3() },
        point: { value: new THREE.Vector2() },
        radius: { value: SPLAT_RADIUS },
      }),
      advection: material(SHADERS.advection, {
        uVelocity: { value: null },
        uSource: { value: null },
        dt: { value: 0.016 },
        dissipation: { value: 1 },
      }),
      divergence: material(SHADERS.divergence, { uVelocity: { value: null } }),
      curl: material(SHADERS.curl, { uVelocity: { value: null } }),
      vorticity: material(SHADERS.vorticity, {
        uVelocity: { value: null },
        uCurl: { value: null },
        curl: { value: CURL },
        dt: { value: 0.016 },
      }),
      pressure: material(SHADERS.pressure, {
        uPressure: { value: null },
        uDivergence: { value: null },
      }),
      gradientSubtract: material(SHADERS.gradientSubtract, {
        uPressure: { value: null },
        uVelocity: { value: null },
      }),
    }
    const run = (mat: THREE.ShaderMaterial, out: THREE.WebGLRenderTarget | null) => {
      quad.material = mat
      renderer.setRenderTarget(out)
      renderer.render(scene, camera)
    }

    const display = new THREE.ShaderMaterial({
      vertexShader: displayVertex,
      fragmentShader: displayFragment,
      uniforms: {
        uImage: { value: null },
        uImageSize: { value: new THREE.Vector2(1, 1) },
        uDye: { value: null },
        uResolution: { value: new THREE.Vector2(1, 1) },
        uDpr: { value: dpr },
        uTile: { value: TILE },
        uTime: { value: 0 },
        uBrightness: { value: reduced ? 0 : -1 },
        uContrast: { value: reduced ? 1 : 4 },
        uExposure: { value: reduced ? 0 : -4.5 },
        uThreshold: { value: TRAIL_THRESHOLD },
        uReveal: { value: REVEAL_THRESHOLD },
        uAuto: { value: 0 },
        uBottomFade: { value: bottomFade ? 1 : 0 },
        // Taken as written: the shader outputs colour as-is, with no conversion to undo
        uGround: { value: new THREE.Color().setStyle(colors.ground, THREE.LinearSRGBColorSpace) },
        uDarkInk: { value: new THREE.Color().setStyle(colors.dark, THREE.LinearSRGBColorSpace) },
        uMidInk: { value: new THREE.Color().setStyle(colors.mid, THREE.LinearSRGBColorSpace) },
        uLight: { value: new THREE.Color().setStyle(colors.light, THREE.LinearSRGBColorSpace) },
      },
      depthTest: false,
      depthWrite: false,
    })

    // The picture
    const loadTexture = (source: HTMLCanvasElement | HTMLImageElement) => {
      const tex = new THREE.Texture(source)
      tex.colorSpace = THREE.NoColorSpace
      tex.minFilter = THREE.LinearFilter
      tex.magFilter = THREE.LinearFilter
      tex.needsUpdate = true
      display.uniforms.uImage.value = tex
      display.uniforms.uImageSize.value.set(source.width, source.height)
    }
    if (image) {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => loadTexture(img)
      img.src = image
    } else loadTexture(defaultPicture())

    // Pointer moves become splats of velocity and dye
    const splats: { x: number; y: number; dx: number; dy: number }[] = []
    let last: { x: number; y: number } | null = null
    const onMove = (event: PointerEvent) => {
      const box = canvas.getBoundingClientRect()
      const x = event.clientX - box.left
      const y = event.clientY - box.top
      if (!last) {
        last = { x, y }
        return
      }
      const dx = x - last.x
      const dy = y - last.y
      last = { x, y }
      if (dx === 0 && dy === 0) return
      if (x < 0 || y < 0 || x > box.width || y > box.height) return
      splats.push({
        x: x / box.width,
        y: 1 - y / box.height,
        dx: SPLAT_FORCE * dx,
        dy: -SPLAT_FORCE * dy,
      })
      wake()
    }

    const splat = (s: (typeof splats)[number]) => {
      m.splat.uniforms.aspectRatio.value = canvas.clientWidth / Math.max(1, canvas.clientHeight)
      m.splat.uniforms.point.value.set(s.x, s.y)
      m.splat.uniforms.uTarget.value = velocity.read.texture
      m.splat.uniforms.color.value.set(s.dx, s.dy, 1)
      run(m.splat, velocity.write)
      velocity.swap()
      m.splat.uniforms.uTarget.value = dye.read.texture
      m.splat.uniforms.color.value.set(
        0.1 * Math.abs(s.dx) + 0.2,
        0.1 * Math.abs(s.dy) + 0.3,
        0.05 * Math.abs(s.dx + s.dy) + 0.5,
      )
      run(m.splat, dye.write)
      dye.swap()
    }

    const step = (frames: number) => {
      while (splats.length) splat(splats.pop() as (typeof splats)[number])
      m.curl.uniforms.uVelocity.value = velocity.read.texture
      run(m.curl, curl)
      m.vorticity.uniforms.uVelocity.value = velocity.read.texture
      m.vorticity.uniforms.uCurl.value = curl.texture
      run(m.vorticity, velocity.write)
      velocity.swap()
      m.divergence.uniforms.uVelocity.value = velocity.read.texture
      run(m.divergence, divergence)
      m.clear.uniforms.uTexture.value = pressure.read.texture
      m.clear.uniforms.value.value = PRESSURE_DISSIPATION ** frames
      run(m.clear, pressure.write)
      pressure.swap()
      m.pressure.uniforms.uDivergence.value = divergence.texture
      for (let i = 0; i < PRESSURE_PASSES; i++) {
        m.pressure.uniforms.uPressure.value = pressure.read.texture
        run(m.pressure, pressure.write)
        pressure.swap()
      }
      m.gradientSubtract.uniforms.uPressure.value = pressure.read.texture
      m.gradientSubtract.uniforms.uVelocity.value = velocity.read.texture
      run(m.gradientSubtract, velocity.write)
      velocity.swap()
      m.advection.uniforms.uVelocity.value = velocity.read.texture
      m.advection.uniforms.uSource.value = velocity.read.texture
      m.advection.uniforms.dissipation.value = VELOCITY_DISSIPATION ** frames
      run(m.advection, velocity.write)
      velocity.swap()
      m.advection.uniforms.uVelocity.value = velocity.read.texture
      m.advection.uniforms.uSource.value = dye.read.texture
      m.advection.uniforms.dissipation.value = DENSITY_DISSIPATION ** frames
      run(m.advection, dye.write)
      dye.swap()
    }

    const ease = bezier(INTRO_EASE)
    const started = performance.now()
    let lastStep = 0
    let frame = 0
    let visible = true
    let quiet = 0

    const render = (now: number) => {
      frame = 0
      if (now - lastStep >= STEP_MS) {
        const frames = lastStep ? (now - lastStep) / 16.667 : 1
        lastStep = now
        step(frames)
        if (!reduced) display.uniforms.uTime.value += 0.05
        const t = reduced ? 1 : Math.min(1, (now - started) / INTRO_MS)
        const e = ease(t)
        display.uniforms.uBrightness.value = -1 + e
        display.uniforms.uContrast.value = 4 - 3 * e
        display.uniforms.uExposure.value = -4.5 + 4.5 * e
        display.uniforms.uDye.value = dye.read.texture
        display.uniforms.uAuto.value = modeRef.current === "auto" ? 1 : 0
        quad.material = display
        renderer.setRenderTarget(null)
        renderer.render(scene, camera)
        quiet = splats.length ? 0 : quiet + 1
      }
      // Keep going while shown: the bars wobble; under reduced motion, only while the dye drains
      const done = reduced && quiet > 90 && now - started > INTRO_MS
      if (visible && !done) frame = requestAnimationFrame(render)
    }

    function wake() {
      quiet = 0
      if (frame === 0 && visible) frame = requestAnimationFrame(render)
    }
    wakeRef.current = wake

    const layout = () => {
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      renderer.setSize(w, h, false)
      display.uniforms.uResolution.value.set(w, h)
      wake()
    }

    const seen = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) wake()
    })
    seen.observe(canvas)
    const resize = new ResizeObserver(layout)
    resize.observe(canvas)
    window.addEventListener("pointermove", onMove)
    layout()

    return () => {
      wakeRef.current = () => {}
      cancelAnimationFrame(frame)
      seen.disconnect()
      resize.disconnect()
      window.removeEventListener("pointermove", onMove)
      for (const mat of Object.values(m)) mat.dispose()
      display.dispose()
      ;(display.uniforms.uImage.value as THREE.Texture | null)?.dispose()
      for (const p of [velocity, dye, pressure]) {
        p.read.dispose()
        p.write.dispose()
      }
      divergence.dispose()
      curl.dispose()
      geometry.dispose()
      renderer.dispose()
    }
  }, [image, bottomFade, colors.ground, colors.dark, colors.mid, colors.light])

  return (
    // Decorative: the picture says nothing a reader needs
    <div className={cn("ds-pattern", className)} aria-hidden="true" {...props}>
      <canvas ref={canvasRef} className="ds-pattern__canvas" />
    </div>
  )
}
