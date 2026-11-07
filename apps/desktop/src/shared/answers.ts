/*
 * The answer line. An agent message that needs a person ends with one line of
 * answers, written by the agents (see switch/README.md):
 *
 *   → done · skip · draft
 *   → approve (hold) · refuse
 *
 * parseAnswers splits that line off the message and turns it into widget
 * chips. A message without one has no chips and is shown as plain text.
 */
import type { Chip } from '@kian/ui'

const LINE = /^\s*(?:→|->)\s*(.+)$/
const NEGATIVE = new Set(['refuse', 'no', 'skip room'])

export function parseAnswers(text: string): { body: string; chips: Chip[] } {
  const lines = text.trimEnd().split('\n')
  const match = lines.length ? LINE.exec(lines[lines.length - 1]) : null
  if (!match) return { body: text.trim(), chips: [] }

  const words = match[1].split(/\s*[·|]\s*/).map((w) => w.trim()).filter(Boolean)
  const hasHold = words.some((w) => /\(hold\)$/i.test(w))
  const chips: Chip[] = words.map((word, i) => {
    const hold = /\(hold\)$/i.test(word)
    const label = word.replace(/\s*\(hold\)$/i, '')
    const chip: Chip = { label, reply: label }
    if (hold) Object.assign(chip, { hold: true, holdLabel: `Hold to ${label}`, tone: 'primary' })
    else if (NEGATIVE.has(label.toLowerCase())) chip.tone = 'danger'
    else if (!hasHold && i === words.length - 1 && words.length > 1) chip.tone = 'primary'
    return chip
  })
  return { body: lines.slice(0, -1).join('\n').trim(), chips }
}
