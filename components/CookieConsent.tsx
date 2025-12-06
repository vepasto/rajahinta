'use client'

import { useEffect } from 'react'
import { initCookieConsent } from '@/lib/cookies'

export function CookieConsent() {
  useEffect(() => {
    initCookieConsent()
  }, [])

  return (
    <div id="cookieConsent" className="cookie-consent">
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
          <button id="cookieAccept" className="cookie-consent-btn accept">
            Hyväksy
          </button>
          <button id="cookieDecline" className="cookie-consent-btn decline">
            Hylkää
          </button>
        </div>
      </div>
    </div>
  )
}



