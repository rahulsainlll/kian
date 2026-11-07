/*
 * Per-page SEO for the single-page site: sets the title, description,
 * canonical URL, Open Graph and Twitter tags, and an optional JSON-LD block
 * whenever the route changes. index.html carries the same defaults for
 * crawlers that don't run scripts.
 */
import { useEffect } from 'react'

export const SITE = 'https://kiandesk.vercel.app'

export interface Seo {
  title: string
  description: string
  path: string
  image?: string
  type?: 'website' | 'article'
  jsonLd?: object
}

function meta(attr: 'name' | 'property', key: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.content = value
}

export function applySeo({ title, description, path, image = '/og.png', type = 'website', jsonLd }: Seo) {
  const url = SITE + path
  const img = image.startsWith('http') ? image : SITE + image
  document.title = title
  meta('name', 'description', description)
  meta('property', 'og:title', title)
  meta('property', 'og:description', description)
  meta('property', 'og:url', url)
  meta('property', 'og:type', type)
  meta('property', 'og:image', img)
  meta('name', 'twitter:title', title)
  meta('name', 'twitter:description', description)
  meta('name', 'twitter:image', img)
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!link) {
    link = document.createElement('link')
    link.rel = 'canonical'
    document.head.appendChild(link)
  }
  link.href = url
  document.getElementById('page-ld')?.remove()
  if (jsonLd) {
    const s = document.createElement('script')
    s.type = 'application/ld+json'
    s.id = 'page-ld'
    s.textContent = JSON.stringify(jsonLd)
    document.head.appendChild(s)
  }
}

export function useSeo(seo: Seo) {
  useEffect(() => applySeo(seo), [seo.path, seo.title])
}
