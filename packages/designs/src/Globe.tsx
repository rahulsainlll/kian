"use client"

import { type ComponentProps, type CSSProperties, useEffect, useRef } from "react"
import * as THREE from "three"
import { cn } from "./utils"
import "./designs.css"

export type GlobeProps = Omit<ComponentProps<"div">, "children"> & {
  /** The stripes' two colours. Green and black by default. */
  colors?: [string, string]
  /** Stripe pairs right round the globe. 32 by default (16 show across the front). */
  stripes?: number
  /** Radians a second the globe turns. */
  spin?: number
  /** Radians of latitude a second the bands climb. */
  climb?: number
}

const DEFAULT_COLORS: [string, string] = ["#387f45", "#000000"]
// The bands, in radians of latitude: a big one, then a thin one, each shifted half a stripe
// from the last, so every boundary is a seam and every thin band a row of checks
const BIG = 0.6
const THIN = 0.14

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main () {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

const fragment = /* glsl */ `
  varying vec2 vUv;
  uniform vec2 uResolution;
  uniform float uTurn;
  uniform float uRise;
  uniform float uStripes;
  uniform vec3 uA;
  uniform vec3 uB;
  const float PI = 3.14159265;
  const float BIG = ${BIG.toFixed(3)};
  const float THIN = ${THIN.toFixed(3)};

  void main () {
    // The largest circle that fits, centred
    float side = min(uResolution.x, uResolution.y);
    vec2 p = (vUv * uResolution - uResolution * 0.5) / (side * 0.5);
    float r = length(p);
    float edge = fwidth(r);
    float inside = 1.0 - smoothstep(1.0 - edge, 1.0, r);
    if (inside <= 0.0) discard;

    // Where this point sits on the sphere
    float z = sqrt(max(0.0, 1.0 - dot(p, p)));
    float lon = atan(p.x, z) + uTurn;
    float lat = asin(clamp(p.y, -1.0, 1.0));

    // Which band (climbing over time), and its half-stripe shift
    float period = BIG + THIN;
    float y = lat - uRise;
    float k = floor(y / period);
    float within = y - k * period;
    float band = k * 2.0 + (within < BIG ? 0.0 : 1.0);
    float shift = mod(band, 2.0) * 0.5;

    // Meridian stripes, softened by a pixel so they stay crisp as they bunch at the rim
    float s = fract(lon / (2.0 * PI) * uStripes + shift);
    float w = fwidth(lon / (2.0 * PI) * uStripes);
    float a = smoothstep(-w, w, s) - smoothstep(0.5 - w, 0.5 + w, s) + smoothstep(1.0 - w, 1.0 + w, s);
    vec3 colour = mix(uB, uA, a);
    gl_FragColor = vec4(colour, inside);
  }
`

/**
 * A striped globe: green and black meridians, broken into latitude bands that sit half a
 * stripe apart, so seams and rows of checks wrap it. It turns on its axis while the bands
 * climb up through it, the pattern always held inside the sphere.
 */
export function Globe({
  colors = DEFAULT_COLORS,
  stripes = 32,
  spin = 0.25,
  climb = 0.12,
  className,
  ...props
}: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        premultipliedAlpha: false,
      })
    } catch {
      return
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setClearColor(0x000000, 0)

    const material = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
      uniforms: {
        uResolution: { value: new THREE.Vector2(1, 1) },
        uTurn: { value: 0 },
        uRise: { value: 0 },
        uStripes: { value: stripes },
        // Taken as written: the shader outputs colour as-is, with no conversion to undo
        uA: { value: new THREE.Color().setStyle(colors[0], THREE.LinearSRGBColorSpace) },
        uB: { value: new THREE.Color().setStyle(colors[1], THREE.LinearSRGBColorSpace) },
      },
    })
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3),
    )
    geometry.setAttribute("uv", new THREE.BufferAttribute(new Float32Array([0, 0, 2, 0, 0, 2]), 2))
    const quad = new THREE.Mesh(geometry, material)
    quad.frustumCulled = false
    const scene = new THREE.Scene()
    scene.add(quad)
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

    let frame = 0
    let visible = true
    let last = performance.now()
    const draw = () => renderer.render(scene, camera)

    const tick = (now: number) => {
      frame = 0
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now
      material.uniforms.uTurn.value += spin * dt
      material.uniforms.uRise.value += climb * dt
      draw()
      if (visible) frame = requestAnimationFrame(tick)
    }
    const start = () => {
      if (reduced || frame !== 0 || !visible) return
      last = performance.now()
      frame = requestAnimationFrame(tick)
    }

    const layout = () => {
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      renderer.setSize(w, h, false)
      material.uniforms.uResolution.value.set(w, h)
      draw()
    }
    const resize = new ResizeObserver(layout)
    resize.observe(canvas)
    const seen = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) start()
    })
    seen.observe(canvas)
    layout()
    start()

    return () => {
      cancelAnimationFrame(frame)
      resize.disconnect()
      seen.disconnect()
      material.dispose()
      geometry.dispose()
      renderer.dispose()
    }
  }, [colors[0], colors[1], stripes, spin, climb])

  return (
    // Decorative: nothing a reader needs
    <div className={cn("ds-globe", className)} aria-hidden="true" {...props}>
      <canvas ref={canvasRef} className="ds-globe__canvas" />
    </div>
  )
}

export type GlobePosterProps = Omit<ComponentProps<"div">, "children"> & {
  /** The three labels across the black strip: left, centre, right. */
  labels?: [string, string, string]
  /** The colour of the globe's lower slice, under the strip. Orange by default. */
  slice?: string
  /** The ground above the strip. Grey by default. */
  ground?: string
  /** Big type behind the globe, if any. */
  title?: string
} & Pick<GlobeProps, "colors" | "stripes" | "spin" | "climb">

/**
 * The globe as a poster: on a grey ground, cut by a black strip carrying three labels, its
 * lower slice showing below in solid orange. Laid out on a 768 × 748 grid, in proportion.
 */
export function GlobePoster({
  labels = ["02", "C", "03"],
  slice = "#eb5831",
  ground = "#585858",
  title,
  colors,
  stripes,
  spin,
  climb,
  className,
  style,
  ...props
}: GlobePosterProps) {
  return (
    <div
      className={cn("ds-globe-poster", className)}
      style={{ "--ds-globe-slice": slice, "--ds-globe-ground": ground, ...style } as CSSProperties}
      {...props}
    >
      {title && (
        <p className="ds-globe-poster__title" aria-hidden="true">
          {title}
        </p>
      )}
      <Globe
        className="ds-globe-poster__globe"
        colors={colors}
        stripes={stripes}
        spin={spin}
        climb={climb}
      />
      <div className="ds-globe-poster__below" aria-hidden="true" />
      <div className="ds-globe-poster__slice" aria-hidden="true" />
      <div className="ds-globe-poster__strip">
        {(["left", "centre", "right"] as const).map((place, i) => (
          <span key={place} className="ds-globe-poster__label" data-place={place}>
            {labels[i]}
          </span>
        ))}
      </div>
    </div>
  )
}
