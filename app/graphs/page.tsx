import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'
import { CookieConsent } from '@/components/CookieConsent'
import { Charts } from '@/components/Charts'
import '@/styles/graphs.css'

export const metadata = {
  title: 'Indeksigraafit - Hitas hintalaskuri',
  description: 'Visuaaliset graafit Hitas-indeksien kehityksestä vuosien varrella.',
}

export default function GraphsPage() {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Siirry sisältöön
      </a>
      <Navigation />
      <header className="header">
        <h1>Indeksigraafit</h1>
        <p className="subtitle">Visuaaliset käyrät Hitas-indeksien kehityksestä</p>
      </header>

      <main id="main-content" className="container">
        <h2>Indeksien kehitys</h2>

        <p>
          Alla olevat graafit näyttävät Hitas-asuntojen hinnoittelussa käytettävien indeksien
          kehityksen vuosien varrella. Indeksit päivittyvät säännöllisesti ja niitä käytetään
          määrittämään asuntojen enimmäismyyntihinnat.
        </p>

        <Charts />

        <p style={{ marginTop: '30px', fontSize: '13px', color: '#999', textAlign: 'center' }}>
          Indeksitiedot päivittyvät automaattisesti Helsingin kaupungin julkaisemista tiedoista.
        </p>
      </main>

      <Footer />
      <CookieConsent />
    </>
  )
}

