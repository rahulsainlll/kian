/*
 * Block: the home page's section frame. Eyebrow, title and body reveal once
 * on scroll, in that order, so each section reads heading first.
 */
import type { ReactNode } from 'react'
import { useReveal } from '../../scenes/useScene'

export function Block({ id, eyebrow, title, children }: { id?: string; eyebrow?: string; title: string; children: ReactNode }) {
  const ref = useReveal<HTMLElement>()
  return (
    <section className="block reveal" id={id} ref={ref}>
      {eyebrow && (
        <p className="eyebrow" style={{ ['--i' as string]: 0 }}>
          {eyebrow}
        </p>
      )}
      <h2 className="block__title" style={{ ['--i' as string]: 0 }}>
        {title}
      </h2>
      <div className="block__body" style={{ ['--i' as string]: 1 }}>
        {children}
      </div>
    </section>
  )
}
