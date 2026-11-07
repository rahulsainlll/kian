/*
 * Small building blocks for long blog posts: a table from rows, a figure
 * with alt text, inline code, an outbound link and a highlighted note.
 */
import type { ReactNode } from 'react'

/** A table: the first row is the header. */
export function Table({ rows }: { rows: ReactNode[][] }) {
  const [head, ...body] = rows
  return (
    <div className="post__table">
      <table>
        <thead>
          <tr>
            {head.map((c, i) => (
              <th key={i}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (
                <td key={j}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function Fig({ src, alt, w, h }: { src: string; alt: string; w: number; h: number }) {
  return (
    <figure className="post__img">
      <img src={src} alt={alt} width={w} height={h} loading="lazy" />
    </figure>
  )
}

export const C = ({ children }: { children: ReactNode }) => <code>{children}</code>

export const Out = ({ href, children }: { href: string; children: ReactNode }) => (
  <a href={href} target="_blank" rel="noopener">
    {children}
  </a>
)

export const Note = ({ children }: { children: ReactNode }) => <aside className="post__note">{children}</aside>
