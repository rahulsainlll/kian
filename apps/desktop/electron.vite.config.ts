/*
 * Build config for the desktop app: the main process, the preload bridge and
 * one renderer bundle with two pages (the widget and the hub). Dependencies
 * stay external for main and preload (electron-vite's default); the renderer
 * bundles React and the @kian packages it shares with the website.
 */
import react from '@vitejs/plugin-react'
import { defineConfig } from 'electron-vite'
import { resolve } from 'node:path'

export default defineConfig({
  main: {},
  preload: {},
  renderer: {
    plugins: [react()],
    resolve: { dedupe: ['react', 'react-dom'] },
    build: {
      rollupOptions: {
        input: {
          widget: resolve(__dirname, 'src/renderer/widget.html'),
          hub: resolve(__dirname, 'src/renderer/hub.html'),
        },
      },
    },
  },
})
