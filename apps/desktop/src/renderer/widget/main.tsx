/*
 * Entry for the widget window: the widget's styles and the Widget component.
 * Only @kian/ui's stylesheet is needed here; the window itself is transparent.
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../reset.css'
import '@kian/designs/tokens.css'
import '@kian/designs/designs.css'
import '@kian/ui/styles.css'
import './widget.css'
import { Widget } from './Widget'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Widget />
  </StrictMode>,
)
