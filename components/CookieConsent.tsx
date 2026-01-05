'use client'

import { useState, useEffect } from 'react'

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookieConsent')
    
    if (consent === 'accepted') {
      // Update GA consent
      if (typeof (window as any).gtag === 'function') {
        (window as any).gtag('consent', 'update', {
          'analytics_storage': 'granted'
        })
      }
    } else if (!consent) {
      // Show banner if no consent choice has been made
      setIsVisible(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted')
    
    // Update GA consent
    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag('consent', 'update', {
        'analytics_storage': 'granted'
      })
    }
    
    setIsVisible(false)
  }

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined')
    setIsVisible(false)
  }

  if (!isVisible) {
    return null
  }

  return (
    <div className="cookie-consent">
      <div className="cookie-consent-content">
        <div className="cookie-consent-text">
          Tämä sivusto käyttää evästeitä käyttökokemuksen parantamiseksi ja sivuston käytön
          analysoimiseksi. Hyväksymällä evästeet sallit Google Analyticsin käytön. Voit lukea
          lisää{' '}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener"
            className="external-link"
          >
            tietosuojakäytännöstä
          </a>
          .
        </div>
        <div className="cookie-consent-buttons">
          <button onClick={handleAccept} className="cookie-consent-btn accept">
            Hyväksy
          </button>
          <button onClick={handleDecline} className="cookie-consent-btn decline">
            Hylkää
          </button>
        </div>
      </div>
    </div>
  )
}



