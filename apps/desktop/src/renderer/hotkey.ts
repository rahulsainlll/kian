/*
 * Hotkeys as Electron accelerators ("CommandOrControl+Shift+K"): turning a
 * key press into one, and showing one the way each platform writes it
 * (⌘⇧K on a Mac, Ctrl+Shift+K on Windows).
 */
const MODIFIER_KEYS = new Set(['Meta', 'Control', 'Alt', 'Shift'])

/** The accelerator for a key press, or null while only modifiers are held. */
export function acceleratorFrom(e: KeyboardEvent): string | null {
  if (MODIFIER_KEYS.has(e.key)) return null
  const parts: string[] = []
  if (e.metaKey || e.ctrlKey) parts.push('CommandOrControl')
  if (e.altKey) parts.push('Alt')
  if (e.shiftKey) parts.push('Shift')
  if (!parts.length) return null // a global shortcut needs at least one modifier
  const code = e.code
  const key = code.startsWith('Key')
    ? code.slice(3)
    : code.startsWith('Digit')
      ? code.slice(5)
      : code === 'Space'
        ? 'Space'
        : /^F\d+$/.test(code)
          ? code
          : e.key.length === 1
            ? e.key.toUpperCase()
            : null
  return key ? [...parts, key].join('+') : null
}

export function prettyHotkey(accel: string, platform: string) {
  const mac = platform === 'darwin'
  const names: Record<string, string> = mac
    ? { CommandOrControl: '⌘', Alt: '⌥', Shift: '⇧', Space: 'Space' }
    : { CommandOrControl: 'Ctrl', Alt: 'Alt', Shift: 'Shift', Space: 'Space' }
  return accel
    .split('+')
    .map((p) => names[p] ?? p)
    .join(mac ? '' : '+')
}
