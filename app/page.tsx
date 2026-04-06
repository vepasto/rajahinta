import type { WebApplication, WithContext } from 'schema-dts'
import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'
import { Calculator } from '@/components/Calculator'
import { JsonLd } from '@/components/JsonLd'
import '@/styles/calculator.css'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''

export default function HomePage() {
  const jsonLd: WithContext<WebApplication> = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    '@id': `${siteUrl}/#app`,
    url: `${siteUrl}/`,
    name: 'Hitas hintalaskuri',
    description:
      'Laske Hitas-asuntosi nykyinen velaton enimmäishinta käyttäen virallisia rakennuskustannus- ja markkinahintaindeksejä.',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Any',
    inLanguage: 'fi-FI',
    isPartOf: { '@id': `${siteUrl}/#website` },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
    },
  }

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

      <JsonLd data={jsonLd} />
      <Footer />
    </>
  )
}



