/*
 * Scroll and timing hooks for the home page: useInView and useOnScreen (is
 * it visible), useScene (step through beats while visible) and useReveal
 * (reveal once). Visibility is measured from scroll, so it also works in
 * embedded and hidden panes where IntersectionObserver is unreliable.
 */
import { useEffect, useRef, useState } from 'react'

/** True while the element is at least `threshold` on screen. */
export function useInView<T extends Element>(threshold = 0.35) {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold })
    io.observe(el)
    return () => io.disconnect()
  }, [threshold])
  return { ref, inView }
}

function prefersReducedMotion() {
  return typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Plays a scene as a list of beats. `beats[i]` is how long beat i holds before
 * the next one. Runs only while on screen, loops, and restarts from 0 each time
 * it comes back into view. Reduced motion shows the last beat, still.
 */
export function useScene(beats: number[], { loop = true } = {}) {
  const { ref, inView } = useInView<HTMLDivElement>()
  const [step, setStep] = useState(0)
  const reduce = useRef(false)

  useEffect(() => {
    reduce.current = prefersReducedMotion()
  }, [])

  useEffect(() => {
    if (reduce.current) {
      setStep(beats.length - 1)
      return
    }
    if (!inView) return
    setStep(0)
    let i = 0
    let t: number
    const next = () => {
      t = window.setTimeout(() => {
        i += 1
        if (i >= beats.length) {
          if (!loop) return
          i = 0
        }
        setStep(i)
        next()
      }, beats[i])
    }
    next()
    return () => clearTimeout(t)
    // beats is a literal per scene; its identity doesn't matter
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, loop])

  return { ref, step, inView }
}

/**
 * Reveal-on-scroll for a section: sets data-in once, and children stagger in.
 * Measured on scroll rather than with IntersectionObserver, so it still
 * works where observers wait for painted frames (background tabs, previews).
 */
export function useReveal<T extends Element>() {
  const ref = useRef<T>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const show = () => {
      el.setAttribute('data-in', '')
      cleanup()
    }
    const check = () => {
      const r = el.getBoundingClientRect()
      if (r.top < innerHeight * 0.88 && r.bottom > 0) show()
    }
    // check again once fonts and images have settled the layout
    const settle = window.setTimeout(() => check(), 600)
    const cleanup = () => {
      clearTimeout(settle)
      removeEventListener('scroll', check)
      removeEventListener('resize', check)
    }
    addEventListener('scroll', check, { passive: true })
    addEventListener('resize', check)
    check()
    return cleanup
  }, [])
  return ref
}

/**
 * True while at least `share` of the element is on screen, measured on scroll
 * and resize. Unlike IntersectionObserver it doesn't wait for a painted frame,
 * so it also holds in background tabs and previews.
 */
export function useOnScreen<T extends Element>(share = 0.2) {
  const ref = useRef<T>(null)
  const [on, setOn] = useState(false)
  useEffect(() => {
    const check = () => {
      const el = ref.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const visible = Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, 0))
      setOn(visible / Math.max(1, Math.min(r.height, innerHeight)) >= share)
    }
    check()
    addEventListener('scroll', check, { passive: true })
    addEventListener('resize', check)
    return () => {
      removeEventListener('scroll', check)
      removeEventListener('resize', check)
    }
  }, [share])
  return { ref, inView: on }
}
