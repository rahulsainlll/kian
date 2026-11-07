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

export async function captureRun(windows: { widget: () => BrowserWindow | null; hub: () => BrowserWindow | null }, say: (text: string) => Promise<void>) {
  const dir = process.env.KIAN_CAPTURE
  if (!dir) return
  mkdirSync(dir, { recursive: true })
  await wait(2500)
  await shoot(windows.widget(), dir, 'widget-idle')
  await say('morning')
  await wait(4500)
  await shoot(windows.widget(), dir, 'widget-card')
  await shoot(windows.hub(), dir, 'hub-today')
  console.log(`[kian] captured windows into ${dir}`)
  app.quit()
}
