/*
 * The two windows. The widget is a transparent, frameless, always-on-top
 * window at the bottom centre of the screen, larger than the pill so cards
 * can grow above it; its empty pixels pass clicks through to the apps below.
 * The hub is an ordinary window for setup, today, approvals and rooms.
 * Links inside either window open in the default browser, never in the app.
 */
import { BrowserWindow, screen, shell } from 'electron'
import { join } from 'node:path'

const WIDGET = { width: 460, height: 440 }
const preload = join(__dirname, '../preload/index.js')

function load(win: BrowserWindow, page: 'widget' | 'hub') {
  const dev = process.env.ELECTRON_RENDERER_URL
  if (dev) void win.loadURL(`${dev}/${page}.html`)
  else void win.loadFile(join(__dirname, `../renderer/${page}.html`))
}

function externalLinks(win: BrowserWindow) {
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//.test(url)) void shell.openExternal(url)
    return { action: 'deny' }
  })
  win.webContents.on('will-navigate', (event, url) => {
    if (url !== win.webContents.getURL()) {
      event.preventDefault()
      if (/^https?:\/\//.test(url)) void shell.openExternal(url)
    }
  })
}

export function createWidget(): BrowserWindow {
  const { workArea } = screen.getPrimaryDisplay()
  const win = new BrowserWindow({
    ...WIDGET,
    x: Math.round(workArea.x + (workArea.width - WIDGET.width) / 2),
    y: workArea.y + workArea.height - WIDGET.height - 8,
    show: false,
    frame: false,
    transparent: true,
    resizable: false,
    movable: false,
    hasShadow: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    fullscreenable: false,
    backgroundColor: '#00000000',
    webPreferences: { preload, sandbox: false, backgroundThrottling: false },
  })
  win.setAlwaysOnTop(true, process.platform === 'darwin' ? 'floating' : 'screen-saver')
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
  win.setIgnoreMouseEvents(true, { forward: true })
  win.once('ready-to-show', () => win.showInactive())
  externalLinks(win)
  load(win, 'widget')
  return win
}

export function createHub(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1040,
    height: 720,
    minWidth: 760,
    minHeight: 520,
    show: false,
    title: 'Kian',
    backgroundColor: '#f1ece4',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    autoHideMenuBar: true,
    webPreferences: { preload, sandbox: false },
  })
  win.once('ready-to-show', () => win.show())
  externalLinks(win)
  load(win, 'hub')
  return win
}
