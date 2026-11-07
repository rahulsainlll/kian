/*
 * Tests for the answer line, run with Node's own test runner:
 *   pnpm --filter @kian/desktop test
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { parseAnswers } from './answers.ts'

test('splits the answer line off and makes the last answer primary', () => {
  const { body, chips } = parseAnswers('Priya wants Tuesday.\n→ done · skip · draft')
  assert.equal(body, 'Priya wants Tuesday.')
  assert.deepEqual(chips.map((c) => c.label), ['done', 'skip', 'draft'])
  assert.equal(chips[2].tone, 'primary')
})

test('a (hold) answer becomes hold to confirm, and refuse is a danger', () => {
  const { chips } = parseAnswers('Lumen wants 15% off.\n→ approve (hold) · refuse')
  assert.equal(chips[0].hold, true)
  assert.equal(chips[0].holdLabel, 'Hold to approve')
  assert.equal(chips[0].reply, 'approve')
  assert.equal(chips[1].tone, 'danger')
})

test('accepts -> and | as well', () => {
  assert.deepEqual(parseAnswers('Hi\n-> yes | no').chips.map((c) => c.label), ['yes', 'no'])
})

test('a message without an answer line has no chips', () => {
  assert.deepEqual(parseAnswers('Deal summary updated.'), { body: 'Deal summary updated.', chips: [] })
})

test('only the last line counts', () => {
  assert.equal(parseAnswers('→ done · skip\nThen some text').chips.length, 0)
})
