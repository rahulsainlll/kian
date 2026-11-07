#!/usr/bin/env node
/*
 * check-files: the repo's two house rules, enforced.
 *
 *   1. No source file is longer than 400 lines. Split by responsibility instead.
 *   2. Every source file opens with a comment that says what it does.
 *
 * It walks the files git tracks (plus new, unignored ones), so vendored skills,
 * build output and node_modules are never checked. Run it with `pnpm check:files`;
 * it exits non-zero and lists every offender when a rule is broken.
 */
import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const MAX_LINES = 400
const SOURCE = /\.(ts|tsx|mjs|js|css|py|sh|ya?ml)$/
const SKIP = [/^\.claude\//, /^pnpm-(lock|workspace)\.yaml$/, /(^|\/)vite-env\.d\.ts$/]

/** A header is a comment as the first thing in the file (after a shebang). */
function hasHeader(path, text) {
  const lines = text.split('\n').filter((l) => l.trim() !== '')
  const first = (lines[0]?.startsWith('#!') ? lines[1] : lines[0])?.trim() ?? ''
  if (/\.(py|sh|ya?ml)$/.test(path)) return first.startsWith('#')
  return first.startsWith('/*') || first.startsWith('//')
}

const files = execSync('git ls-files --cached --others --exclude-standard', { encoding: 'utf8' })
  .split('\n')
  .filter((f) => SOURCE.test(f) && !SKIP.some((re) => re.test(f)))

const long = []
const bare = []
for (const file of files) {
  let text
  try {
    text = readFileSync(file, 'utf8')
  } catch {
    continue // deleted in the working tree
  }
  const count = text.split('\n').length - (text.endsWith('\n') ? 1 : 0)
  if (count > MAX_LINES) long.push(`${String(count).padStart(5)}  ${file}`)
  if (!hasHeader(file, text)) bare.push(`       ${file}`)
}

if (long.length) console.log(`Over ${MAX_LINES} lines:\n${long.join('\n')}\n`)
if (bare.length) console.log(`Missing a header comment:\n${bare.join('\n')}\n`)
if (long.length || bare.length) process.exit(1)
console.log(`check-files: ${files.length} files, all under ${MAX_LINES} lines with a header.`)
