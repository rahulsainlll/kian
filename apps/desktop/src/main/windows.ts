/*
 * The two windows. The widget is a transparent, frameless, always-on-top
 * window, placed by the person (bottom centre, a bottom corner, or upright on
 * the left or right edge). It is larger than the pill so cards can grow
 * beside it; its empty pixels pass clicks through to the apps below.
 * The hub is an ordinary window for setup, today, approvals and rooms.
 * Links inside either window open in the default browser, never in the app.
 */
import { BrowserWindow, screen, shell } from 'electron'
import { join } from 'node:path'
import type { WidgetPosition } from '../shared/types'

const WIDGET = { width: 460, height: 440 }
const EDGE = 4

/** Moves the widget window to its position on the primary display. */
export function placeWidget(win: BrowserWindow, position: WidgetPosition, dragged?: [number, number] | null) {
  if (dragged) return win.setBounds({ x: dragged[0], y: dragged[1], ...WIDGET })
  const { workArea: a } = screen.getPrimaryDisplay()
  const { width: w, height: h } = WIDGET
  const middleX = Math.round(a.x + (a.width - w) / 2)
  const middleY = Math.round(a.y + (a.height - h) / 2)
  const bottom = a.y + a.height - h - EDGE
  const spots: Record<WidgetPosition, [number, number]> = {
    bottom: [middleX, bottom],
    'bottom-left': [a.x + EDGE, bottom],
    'bottom-right': [a.x + a.width - w - EDGE, bottom],
    left: [a.x + EDGE, middleY],
    right: [a.x + a.width - w - EDGE, middleY],
  }
  const [x, y] = spots[position] ?? spots.bottom
  win.setBounds({ x, y, width: w, height: h })
}

const preload = join(__dirname, '../preload/index.js')

function load(win: BrowserWindow, page: 'widget' | 'hub', hash = '') {
  const dev = process.env.ELECTRON_RENDERER_URL
  if (dev) void win.loadURL(`${dev}/${page}.html${hash ? `#${hash}` : ''}`)
  else void win.loadFile(join(__dirname, `../renderer/${page}.html`), { hash })
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

export function createWidget(position: WidgetPosition, dragged?: [number, number] | null): BrowserWindow {
  const win = new BrowserWindow({
    ...WIDGET,
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
  placeWidget(win, position, dragged)
  win.once('ready-to-show', () => win.showInactive())
  externalLinks(win)
  load(win, 'widget')
  return win
}

/** The hub; `hash` opens a view or settings tab, e.g. settings/general. */
export function createHub(hash = ''): BrowserWindow {
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
  load(win, 'hub', hash)
  return win
}
