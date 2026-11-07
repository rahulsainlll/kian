/*
 * The tray (menu bar on macOS): open the hub or its settings, show or hide
 * the widget, move it, snooze cards for an hour, and quit. The app has no Dock icon on macOS, so
 * this menu is how people reach it besides the hotkey.
 */
import { Menu, Tray, app, nativeImage } from 'electron'
import { join } from 'node:path'
import type { WidgetPosition } from '../shared/types'

export interface TrayActions {
  openHub(): void
  openSettings(): void
  toggleWidget(): void
  snooze(minutes: number): void
  position(): WidgetPosition
  setPosition(p: WidgetPosition): void
}

const POSITIONS: [WidgetPosition, string][] = [
  ['bottom', 'Bottom centre'],
  ['bottom-left', 'Bottom left'],
  ['bottom-right', 'Bottom right'],
  ['left', 'Left edge'],
  ['right', 'Right edge'],
]

export function createTray(actions: TrayActions): Tray {
  const icon = nativeImage.createFromPath(join(__dirname, '../../resources/tray.png'))
  const tray = new Tray(icon)
  tray.setToolTip('Kian')
  // Rebuilt on every open so the position radio shows the current choice.
  tray.on('click', () => tray.popUpContextMenu(menu(actions)))
  tray.on('right-click', () => tray.popUpContextMenu(menu(actions)))
  return tray
}

function menu(actions: TrayActions) {
  return Menu.buildFromTemplate([
    { label: 'Open Kian', click: actions.openHub },
    { label: 'Settings…', click: actions.openSettings },
    { label: 'Show or hide the widget', click: actions.toggleWidget },
    {
      label: 'Widget position',
      submenu: POSITIONS.map(([id, label]) => ({
      label,
      type: 'radio' as const,
      checked: actions.position() === id,
      click: () => actions.setPosition(id),
      })),
    },
    { type: 'separator' },
    { label: 'Snooze for an hour', click: () => actions.snooze(60) },
    { type: 'separator' },
    { label: 'Quit Kian', role: 'quit', click: () => app.quit() },
  ])
}
