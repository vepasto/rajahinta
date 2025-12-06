'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from './ThemeToggle'

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="top-nav">
      <div className="nav-container">
        <div className="nav-links">
          <Link href="/" className={`nav-link ${pathname === '/' ? 'active' : ''}`}>
            Hintalaskuri
          </Link>
          <Link href="/info" className={`nav-link ${pathname === '/info' ? 'active' : ''}`}>
            Info
          </Link>
          <Link href="/graphs" className={`nav-link ${pathname === '/graphs' ? 'active' : ''}`}>
            Graafit
          </Link>
        </div>
        <ThemeToggle />
      </div>
    </nav>
  )
}



