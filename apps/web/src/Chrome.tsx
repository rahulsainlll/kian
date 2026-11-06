import { Mascot } from '@kian/ui'
import type { ReactNode } from 'react'

const LINKS = [
  { href: '/dashboard', label: 'Dashboard', key: 'dashboard' },
  { href: '/blog', label: 'Blog', key: 'blog' },
  { href: '/components', label: 'Components', key: 'components' },
  { href: '/contact', label: 'Contact', key: 'contact' },
] as const

/**
 * The logo: the chunky wordmark with Kian beside it. One component everywhere;
 * `size` is the wordmark's font size in px, or it inherits from the parent.
 */
export function Logo({ size, talk = false }: { size?: number; talk?: boolean }) {
  return (
    <span className="logo" style={size ? { fontSize: size } : undefined}>
      <span className="logo__word">kian</span>
      <span className="logo__buddy">
        <Mascot talk={talk} />
      </span>
    </span>
  )
}

export function Nav({ active }: { active: 'home' | 'components' | 'dashboard' | 'blog' | 'contact' }) {
  return (
    <>
      {/* the nav floats; this holds its place in the flow */}
      <div className="nav-spacer" aria-hidden />
      <div className="nav-wrap">
        <nav className="nav">
          <a href="/" className="nav__mark" aria-label="kian home" aria-current={active === 'home' ? 'page' : undefined}>
            <Logo size={24} />
          </a>
          <span className="nav__links">
            {LINKS.map((l) => (
              <a key={l.key} href={l.href} className="nav__link" aria-current={active === l.key ? 'page' : undefined}>
                {l.label}
              </a>
            ))}
          </span>
          <a className="nav__cta" href="/#download">
            Download
          </a>
        </nav>
      </div>
    </>
  )
}

/** A desktop for the widget to sit on. `sky` echoes the reference wallpaper. */
export function Stage({
  children,
  wallpaper = 'sky',
  height,
  align = 'bottom',
  className = '',
}: {
  children: ReactNode
  wallpaper?: 'sky' | 'graphite' | 'grid'
  height?: number
  align?: 'bottom' | 'center' | 'right'
  className?: string
}) {
  return (
    <div className={`stage ${className}`} data-wallpaper={wallpaper} data-align={align} style={{ height }}>
      {children}
    </div>
  )
}


const FOOT_COLUMNS: { title: string; links: [string, string][] }[] = [
  {
    title: 'Product',
    links: [
      ['The widget', '/#demo'],
      ['Dashboard', '/dashboard'],
      ['Download', '/#download'],
      ['Components', '/components'],
    ],
  },
  {
    title: 'Learn',
    links: [
      ['Blog', '/blog'],
      ['How Kian uses Switch', '/#switch'],
      ['Questions', '/#faq'],
    ],
  },
  {
    title: 'Kian',
    links: [
      ['Contact', '/contact'],
      ['Switch on GitHub', 'https://github.com/sandbox-quantum/switch'],
      ['Flip the Switch', 'https://www.wemakedevs.org/hackathons/switch'],
    ],
  },
]

/**
 * The footer every page shares: a grid band with stickers and one chunky
 * button, a wavy edge, then the cream card with links and the big wordmark.
 */
export function SiteFooter() {
  return (
    <footer className="site-foot">
      <div className="band">
        <span className="band__ticket" aria-hidden>
          <small>Rule one</small>
          Agents draft.
        </span>
        <a className="pill3d" href="/#demo">
          Say “morning, Kian”
        </a>
        <span className="band__burst" aria-hidden>
          <span>People send!</span>
        </span>
        <svg className="band__wave" viewBox="0 0 1200 40" preserveAspectRatio="none" aria-hidden>
          <path d="M0 20 Q 25 0 50 20 T 100 20 T 150 20 T 200 20 T 250 20 T 300 20 T 350 20 T 400 20 T 450 20 T 500 20 T 550 20 T 600 20 T 650 20 T 700 20 T 750 20 T 800 20 T 850 20 T 900 20 T 950 20 T 1000 20 T 1050 20 T 1100 20 T 1150 20 T 1200 20 V 40 H 0 Z" />
        </svg>
      </div>

      <div className="page site-foot__card">
        <div className="site-foot__top">
          <p className="site-foot__tag">A sales desk run by agents in your team’s Switch rooms. Built during Flip the Switch, November 4 to 7, 2026, by voice with Wispr Flow.</p>
          <div className="site-foot__cols">
            {FOOT_COLUMNS.map((c) => (
              <nav className="site-foot__col" key={c.title} aria-label={c.title}>
                <div className="site-foot__title">{c.title}</div>
                {c.links.map(([label, href]) => (
                  <a key={label} href={href} {...(href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}>
                    {label}
                  </a>
                ))}
              </nav>
            ))}
          </div>
        </div>
        <div className="site-foot__mark">
          <Logo talk />
        </div>
      </div>
    </footer>
  )
}
