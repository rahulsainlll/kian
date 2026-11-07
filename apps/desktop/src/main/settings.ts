/*
 * Settings: plain values in settings.json under the app's userData folder,
 * secrets (the Mattermost token or password, the transcription key) encrypted
 * with the OS keychain through safeStorage. The renderer can set a secret but
 * never read one back; it only learns whether one is set.
 */
import { app, safeStorage } from 'electron'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Settings, SettingsUpdate } from '../shared/types'

type Stored = Omit<Settings, 'hasToken' | 'hasSttKey'> & { token?: string; sttKey?: string }

const DEFAULTS: Stored = {
  backend: 'mock',
  url: 'http://localhost:8065',
  team: '',
  username: '',
  agents: ['kian', 'kian-scribe', 'kian-studio'],
  deskRoom: 'kian-desk',
  approvalsRoom: 'kian-approvals',
  approver: false,
  hotkey: 'CommandOrControl+Shift+K',
  position: 'bottom',
  sounds: true,
  speak: false,
  sttProvider: 'off',
  sttUrl: '',
  sttModel: '',
}

const file = () => join(app.getPath('userData'), 'settings.json')

function seal(secret: string): string {
  return safeStorage.isEncryptionAvailable() ? safeStorage.encryptString(secret).toString('base64') : ''
}

function open(sealed?: string): string {
  if (!sealed) return ''
  try {
    return safeStorage.decryptString(Buffer.from(sealed, 'base64'))
  } catch {
    return ''
  }
}

function read(): Stored {
  if (!existsSync(file())) return { ...DEFAULTS }
  try {
    return { ...DEFAULTS, ...(JSON.parse(readFileSync(file(), 'utf8')) as Partial<Stored>) }
  } catch {
    return { ...DEFAULTS }
  }
}

/** What the hub may see. */
export function publicSettings(): Settings {
  const { token, sttKey, ...rest } = read()
  return { ...rest, hasToken: !!token, hasSttKey: !!sttKey }
}

export function saveSettings(update: SettingsUpdate): Settings {
  const { token, sttKey, ...values } = update
  const next: Stored = { ...read(), ...values }
  if (token !== undefined) next.token = token ? seal(token) : undefined
  if (sttKey !== undefined) next.sttKey = sttKey ? seal(sttKey) : undefined
  writeFileSync(file(), JSON.stringify(next, null, 2))
  return publicSettings()
}

/** Main process only: the decrypted secrets. */
export function secrets(): { token: string; sttKey: string } {
  const stored = read()
  return { token: open(stored.token), sttKey: open(stored.sttKey) }
}
