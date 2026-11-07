/*
 * Entry for the hub window: the design kit and widget styles (for the shared
 * dashboard parts), the hub's own layout, and the Hub component.
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@kian/designs/tokens.css'
import '@kian/designs/designs.css'
import '@kian/ui/styles.css'
import './hub.css'
import { Hub } from './Hub'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Hub />
  </StrictMode>,
)
