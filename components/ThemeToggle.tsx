'use client'

import { useEffect } from 'react'
import { initTheme } from '@/lib/theme'

export function ThemeToggle() {
  useEffect(() => {
    initTheme()
  }, [])

  return (
    <button
      className="theme-toggle"
      id="themeToggle"
      aria-label="Vaihda teemaa"
      aria-live="polite"
    >
      <span className="theme-icon" id="lightIcon">
        ☼
      </span>
      <span className="theme-icon" id="darkIcon">
        ☾
      </span>
    </button>
  )
}

