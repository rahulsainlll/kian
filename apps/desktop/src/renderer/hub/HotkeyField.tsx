/*
 * HotkeyField: click it, press the shortcut you want, and it is saved. Shows
 * the shortcut the way the platform writes it. Escape cancels; a shortcut
 * needs at least one modifier so it can't swallow ordinary typing.
 */
import { useEffect, useState } from 'react'
import { acceleratorFrom, prettyHotkey } from '../hotkey'

export function HotkeyField({ value, onChange }: { value: string; onChange: (accel: string) => void }) {
  const [listening, setListening] = useState(false)

  useEffect(() => {
    if (!listening) return
    const onKey = (e: KeyboardEvent) => {
      e.preventDefault()
      if (e.key === 'Escape') return setListening(false)
      const accel = acceleratorFrom(e)
      if (!accel) return
      onChange(accel)
      setListening(false)
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [listening, onChange])

  return (
    <button className="hotkey-field" data-listening={listening || undefined} onClick={() => setListening((v) => !v)}>
      {listening ? 'Press your shortcut…' : <kbd>{prettyHotkey(value, window.kian.platform)}</kbd>}
    </button>
  )
}
