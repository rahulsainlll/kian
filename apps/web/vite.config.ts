/*
 * Vite config for the website: React, Tailwind v4, and one copy of React
 * across the workspace packages. Unknown paths fall back to index.html (SPA).
 */
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // one React for the app and every workspace package
  resolve: { dedupe: ['react', 'react-dom'] },
  // SPA: /components and /dashboard are served by index.html
  appType: 'spa',
})
