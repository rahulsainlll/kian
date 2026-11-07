/*
 * The desktop app's main process. Starts once (a second launch opens the hub),
 * hides from the Dock on macOS, opens the widget, the tray and the hotkey,
 * connects to the rooms (mock or Mattermost, from settings) and wires the
 * IPC the preload bridge exposes. Saving settings reconnects the rooms.
 */
import { BrowserWindow, app, globalShortcut, ipcMain } from 'electron'
import type { DeskState, RoomEvent, SettingsUpdate } from '../shared/types'
import { captureRun } from './capture'
import { Desk } from './desk'
import { MattermostRooms } from './rooms/mattermost'
import { MockRooms } from './rooms/mock'
import type { Rooms } from './rooms/types'
import { publicSettings, saveSettings, secrets } from './settings'
import { transcribe } from './transcribe'
import { createTray } from './tray'
import { createHub, createWidget } from './windows'

let widget: BrowserWindow | null = null
let hub: BrowserWindow | null = null
let rooms: Rooms | null = null
let desk: Desk | null = null

function send(win: BrowserWindow | null, channel: string, payload?: unknown) {
  if (win && !win.isDestroyed()) win.webContents.send(channel, payload)
}

function openHub() {
  if (hub && !hub.isDestroyed()) return hub.show(), hub.focus()
  hub = createHub()
  hub.on('closed', () => (hub = null))
}

function makeRooms(): Rooms {
  const s = publicSettings()
  const { token } = secrets()
  if (s.backend === 'mattermost' && token) {
    return new MattermostRooms({ url: s.url, team: s.team, secret: token, username: s.username || undefined, agents: s.agents })
  }
  return new MockRooms()
}

async function connect() {
  rooms?.close()
  rooms = makeRooms()
  desk = new Desk(
    rooms,
    publicSettings,
    (state: DeskState) => send(widget, 'desk:state', state),
    (event: RoomEvent) => send(hub, 'hub:feed', event),
  )
  desk.setConnection('connecting')
  try {
    await rooms.connect()
    desk.setConnection(rooms.kind === 'mock' ? 'demo' : 'online')
  } catch (err) {
    console.error('[kian] could not connect:', err)
    desk.setConnection('offline')
  }
}

function registerHotkey() {
  globalShortcut.unregisterAll()
  const ok = globalShortcut.register(publicSettings().hotkey, () => {
    if (!widget || widget.isDestroyed()) return
    widget.showInactive()
    send(widget, 'desk:hotkey')
  })
  if (!ok) console.warn('[kian] hotkey is taken:', publicSettings().hotkey)
}

function wireIpc() {
  ipcMain.handle('desk:state', () => desk?.state())
  ipcMain.handle('desk:say', (_e, text: string) => desk?.say(text))
  ipcMain.handle('desk:answer', (_e, id: string, reply: string) => desk?.answer(id, reply))
  ipcMain.handle('desk:dismiss', (_e, id: string) => desk?.dismiss(id))
  ipcMain.handle('desk:transcribe', (_e, audio: ArrayBuffer, mime: string) =>
    transcribe(audio, mime, publicSettings(), secrets().sttKey),
  )
  ipcMain.on('desk:interactive', (_e, on: boolean) => {
    widget?.setIgnoreMouseEvents(!on, { forward: true })
    if (on) widget?.focus()
  })
  ipcMain.on('desk:open-hub', openHub)

  ipcMain.handle('hub:settings', () => publicSettings())
  ipcMain.handle('hub:save', async (_e, update: SettingsUpdate) => {
    const saved = saveSettings(update)
    registerHotkey()
    await connect()
    return saved
  })
  ipcMain.handle('hub:test', async () => {
    const probe = makeRooms()
    try {
      const me = await probe.connect()
      return { ok: true, message: probe.kind === 'mock' ? 'Demo mode: no server needed.' : `Signed in as ${me.username}.` }
    } catch (err) {
      return { ok: false, message: err instanceof Error ? err.message : String(err) }
    } finally {
      probe.close()
    }
  })
  ipcMain.handle('hub:rooms', () => rooms?.rooms() ?? [])
  ipcMain.handle('hub:feed', async () => (desk?.history().length ? desk.history() : (rooms?.recent() ?? [])))
}

if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  app.on('second-instance', openHub)
  app.whenReady().then(async () => {
    if (process.platform === 'darwin') app.dock?.hide()
    wireIpc()
    widget = createWidget()
    createTray({
      openHub,
      toggleWidget: () => (widget?.isVisible() ? widget.hide() : widget?.showInactive()),
      snooze: (minutes) => desk?.snooze(minutes),
    })
    registerHotkey()
    await connect()
    if (publicSettings().backend === 'mock' && !app.isPackaged) openHub()
    void captureRun(
      { widget: () => widget, hub: () => hub },
      {
        say: async (text) => desk?.say(text),
        answer: async (reply) => {
          const card = desk?.state().message
          if (card) await desk?.answer(card.id, reply)
        },
      },
    )
  })
  app.on('window-all-closed', () => {
    // Stay in the tray: closing the hub doesn't quit Kian.
  })
  app.on('will-quit', () => {
    globalShortcut.unregisterAll()
    rooms?.close()
  })
}
