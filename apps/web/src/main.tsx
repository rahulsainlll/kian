/*
 * Website entry. Loads the stylesheets in cascade order (Tailwind and HeroUI,
 * kit tokens, kit components, widget, site) and routes by pathname: /,
 * /components, /dashboard, /blog[/slug], /contact and /art/<name>.
 */
import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './tailwind.css'
import '@kian/designs/tokens.css'
import '@kian/designs/designs.css'
import '@kian/ui/styles.css'
import './site.css'
import { Home } from './pages/Home'
import { Components } from './pages/Components'
import { Dashboard } from './pages/Dashboard'
import { Blog } from './pages/Blog'
import { Contact } from './pages/Contact'
import { Art } from './pages/Art'
import { Guide } from './pages/Guide'
import { applySeo } from './seo'

// titles and descriptions for the pages that don't set their own
const PAGES: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'Kian: an AI agent for everyone on your team, working together in Switch',
    description: 'Everyone on your team gets their own AI agent. The agents work together in Switch rooms: updates, reminders, follow-ups and drafts, and nothing goes out without a yes. Free for Mac and Windows.',
  },
  '/components': { title: 'Components | Kian', description: 'The UI kit behind Kian: the widget, cards, chips and dashboard, shared by the website and the desktop app.' },
  '/contact': { title: 'Contact | Kian', description: 'Talk to the team behind Kian, an AI agent for everyone on your team.' },
  '/guide/switch': {
    title: 'Connect Kian to Switch: setup guide | Kian',
    description: 'Step by step: install Switch, create an agent for every teammate from one template, connect each Google account, and sign in from the Kian app.',
  },
  '/guide': { title: 'Install Kian on Mac and Windows | Kian', description: 'Step-by-step install guides for the Kian desktop app on Mac and Windows, with a picture of every screen.' },
}

/** Two pages don't need a router: intercept same-origin links and swap on pathname. */
function App() {
  const [path, setPath] = useState(location.pathname)

  useEffect(() => {
    const onPop = () => setPath(location.pathname)
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a')
      if (!a || a.target || e.metaKey || e.ctrlKey || a.origin !== location.origin) return
      if (a.hash && a.pathname === location.pathname) return
      e.preventDefault()
      history.pushState(null, '', a.pathname)
      setPath(a.pathname)
      scrollTo(0, 0)
    }
    addEventListener('popstate', onPop)
    document.addEventListener('click', onClick)
    return () => {
      removeEventListener('popstate', onPop)
      document.removeEventListener('click', onClick)
    }
  }, [])

  useEffect(() => {
    const key = Object.keys(PAGES).find((k) => (k === '/' ? path === '/' : path.startsWith(k)))
    if (key) applySeo({ ...PAGES[key], path: key === '/guide' ? path : key })
  }, [path])

  if (path.startsWith('/components')) return <Components />
  if (path.startsWith('/dashboard')) return <Dashboard />
  if (path.startsWith('/blog')) return <Blog slug={path.split('/')[2] || undefined} />
  if (path.startsWith('/contact')) return <Contact />
  if (path.startsWith('/guide')) return <Guide platform={path.split('/')[2] || undefined} />
  if (path.startsWith('/art')) return <Art name={path.split('/')[2] || undefined} />
  return <Home />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
