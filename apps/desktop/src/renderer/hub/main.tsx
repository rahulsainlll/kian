/*
 * Entry for the hub window: the reset, the design kit, the widget and hub
 * styles shared with the website, the desktop's own touches, and the Hub.
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../reset.css'
import '@kian/designs/tokens.css'
import '@kian/designs/designs.css'
import '@kian/ui/styles.css'
import '@kian/hub/hub.css'
import './hub.css'
import { Hub } from './Hub'

document.documentElement.dataset.platform = window.kian.platform

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Hub />
  </StrictMode>,
)
