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

  if (path.startsWith('/components')) return <Components />
  if (path.startsWith('/dashboard')) return <Dashboard />
  if (path.startsWith('/blog')) return <Blog slug={path.split('/')[2] || undefined} />
  if (path.startsWith('/contact')) return <Contact />
  if (path.startsWith('/art')) return <Art name={path.split('/')[2] || undefined} />
  return <Home />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
