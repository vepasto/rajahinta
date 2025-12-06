import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'
import { CookieConsent } from '@/components/CookieConsent'
import { Calculator } from '@/components/Calculator'
import '@/styles/calculator.css'

export default function HomePage() {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Siirry sisältöön
      </a>
      <Navigation />
      <header className="header">
        <h1>Hitas hintalaskuri</h1>
        <p className="subtitle">Laske Hitas-asuntosi nykyinen velaton enimmäishinta</p>
      </header>

      <main id="main-content" className="container">
        <Calculator />
      </main>

      <Footer />
      <CookieConsent />
    </>
  )
}



