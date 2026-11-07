/*
 * The tray (menu bar on macOS): open the hub, show or hide the widget,
 * snooze cards for an hour, and quit. The app has no Dock icon on macOS, so
 * this menu is how people reach it besides the hotkey.
 */
import { Menu, Tray, app, nativeImage } from 'electron'
import { join } from 'node:path'

export interface TrayActions {
  openHub(): void
  toggleWidget(): void
  snooze(minutes: number): void
}

export function createTray(actions: TrayActions): Tray {
  const icon = nativeImage.createFromPath(join(__dirname, '../../resources/tray.png'))
  const tray = new Tray(icon)
  tray.setToolTip('Kian')
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: 'Open Kian', click: actions.openHub },
      { label: 'Show or hide the widget', click: actions.toggleWidget },
      { type: 'separator' },
      { label: 'Snooze for an hour', click: () => actions.snooze(60) },
      { type: 'separator' },
      { label: 'Quit Kian', role: 'quit', click: () => app.quit() },
    ]),
  )
  return tray
}
