'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from './ThemeToggle'

function isActivePath(pathname: string, href: string): boolean {
  // Normalize both paths by removing trailing slash (except root)
  const normalize = (path: string) => (path.endsWith('/') && path !== '/' ? path.slice(0, -1) : path)
  return normalize(pathname) === normalize(href)
}

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="top-nav">
      <div className="nav-container">
        <div className="nav-links">
          <Link href="/" className={`nav-link ${isActivePath(pathname, '/') ? 'active' : ''}`}>
            Hintalaskuri
          </Link>
          <Link href="/info" className={`nav-link ${isActivePath(pathname, '/info') ? 'active' : ''}`}>
            Info
          </Link>
          <Link href="/graphs" className={`nav-link ${isActivePath(pathname, '/graphs') ? 'active' : ''}`}>
            Indeksit
          </Link>
        </div>
        <ThemeToggle />
      </div>
    </nav>
  )
}



