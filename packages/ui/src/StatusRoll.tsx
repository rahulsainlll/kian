import { useEffect, useRef, useState } from 'react'

/**
 * A status word that rolls up when it changes, instead of two spans
 * crossfading. Old text exits up, new text enters from below.
 */
export function StatusRoll({ text }: { text: string }) {
  const [items, setItems] = useState([{ text, key: 0 }])
  const next = useRef(1)

  useEffect(() => {
    setItems((prev) => {
      if (prev[prev.length - 1].text === text) return prev
      return [{ ...prev[prev.length - 1] }, { text, key: next.current++ }]
    })
  }, [text])

  return (
    <span className="k-roll" aria-live="polite">
      {items.map((it, i) => (
        <span
          key={it.key}
          className="k-roll__item"
          data-phase={items.length > 1 ? (i === 0 ? 'out' : 'in') : 'still'}
          onAnimationEnd={() => i === 0 && items.length > 1 && setItems((p) => p.slice(1))}
        >
          {it.text}
        </span>
      ))}
    </span>
  )
}
