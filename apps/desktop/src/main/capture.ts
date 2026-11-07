/*
 * A development aid: with KIAN_CAPTURE=<folder>, the app plays the demo
 * morning on its own and saves each window's pixels as PNGs, then quits.
 * Used to check the UI without screenshotting the whole screen, and to
 * render the README's desktop images.
 */
import { BrowserWindow, app } from 'electron'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function shoot(win: BrowserWindow | null, dir: string, name: string) {
  if (!win || win.isDestroyed()) return
  const image = await win.webContents.capturePage()
  writeFileSync(join(dir, `${name}.png`), image.toPNG())
}

export interface CaptureDesk {
  say(text: string): Promise<void>
  /** Answer the card on screen, if there is one. */
  answer(reply: string): Promise<void>
}

export async function captureRun(windows: { widget: () => BrowserWindow | null; hub: () => BrowserWindow | null }, desk: CaptureDesk) {
  const dir = process.env.KIAN_CAPTURE
  if (!dir) return
  mkdirSync(dir, { recursive: true })
  await wait(2500)
  await shoot(windows.widget(), dir, 'widget-idle')
  await desk.say('morning')
  await wait(4500)
  await shoot(windows.widget(), dir, 'widget-card')
  await desk.answer('draft')
  await wait(7000)
  await shoot(windows.widget(), dir, 'widget-next')
  await desk.answer('skip')
  await wait(1200)
  await shoot(windows.widget(), dir, 'widget-approval')
  windows.hub()?.show()
  windows.hub()?.webContents.invalidate()
  await wait(800) // a window in the background keeps its last painted frame
  await shoot(windows.hub(), dir, 'hub-today')
  for (const tab of ['general', 'agents', 'connectors']) {
    await windows.hub()?.webContents.executeJavaScript(`location.hash = 'settings/${tab}'`)
    await wait(700)
    windows.hub()?.webContents.invalidate()
    await wait(300)
    await shoot(windows.hub(), dir, `hub-settings-${tab}`)
  }
  console.log(`[kian] captured windows into ${dir}`)
  app.quit()
}
