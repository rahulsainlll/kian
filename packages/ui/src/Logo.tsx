/*
 * Logo: the chunky "kian" wordmark with the blue flower beside it. One
 * component everywhere (website, hub, desktop app); `size` is the wordmark's
 * font size in px, or it inherits from the parent.
 */
import { Mascot } from './Character'

export function Logo({ size, talk = false }: { size?: number; talk?: boolean }) {
  return (
    <span className="logo" style={size ? { fontSize: size } : undefined}>
      <span className="logo__word">kian</span>
      <span className="logo__buddy">
        <Mascot talk={talk} />
      </span>
    </span>
  )
}
