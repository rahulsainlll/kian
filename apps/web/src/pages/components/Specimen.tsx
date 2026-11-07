/*
 * Specimen: one component on the gallery page, with its name, a line about
 * it, the code to use it, optional controls and a live stage.
 */
import type { ReactNode } from 'react'

export function Specimen({ id, title, blurb, code, controls, children }: { id: string; title: string; blurb: string; code: string; controls?: ReactNode; children: ReactNode }) {
  return (
    <section className="specimen" id={id}>
      <div className="specimen__head">
        <div>
          <div className="specimen__title">{title}</div>
          <p className="specimen__blurb">{blurb}</p>
        </div>
        {controls && <div className="specimen__controls">{controls}</div>}
      </div>
      {children}
      <pre className="code">
        <code>{code}</code>
      </pre>
    </section>
  )
}
