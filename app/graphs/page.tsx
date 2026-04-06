import type { BreadcrumbList, WebPage, WithContext } from 'schema-dts'
import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'
import { Charts } from '@/components/Charts'
import { JsonLd } from '@/components/JsonLd'
import '@/styles/graphs.css'
import '@/styles/calculator.css'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''

export const metadata = {
  title: 'Hitas-indeksit - Graafit - Hitas hintalaskuri',
  description: 'Visuaaliset graafit hitas-indeksien kehityksestä vuosien varrella.',
}

export default function GraphsPage() {
  const breadcrumbJsonLd: WithContext<BreadcrumbList> = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Etusivu',
        item: `${siteUrl}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Hitas-indeksit – Graafit',
        item: `${siteUrl}/graphs/`,
      },
    ],
  }

  const jsonLd: WithContext<WebPage> = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${siteUrl}/graphs/#webpage`,
    url: `${siteUrl}/graphs/`,
    name: 'Hitas-indeksit – Graafit',
    description: 'Visuaaliset graafit hitas-indeksien kehityksestä vuosien varrella.',
    inLanguage: 'fi-FI',
    isPartOf: { '@id': `${siteUrl}/#website` },
    about: {
      '@type': 'Thing',
      name: 'Hitas-indeksit',
      description:
        'Helsingin kaupungin Hitas-asuntojen hinnoittelussa käytettävät rakennuskustannus- ja markkinahintaindeksit.',
    },
  }

  return (
    <>
      <a href="#main-content" className="skip-link">
        Siirry sisältöön
      </a>
      <Navigation />
      <header className="header" style={{ paddingBottom: '10px', marginBottom: '20px' }}>
        <h1>Hitas-indeksit</h1>
        <p className="subtitle" style={{ marginBottom: '10px' }}>Visuaaliset käyrät hitas-indeksien kehityksestä</p>
        <a href="/" className="btn-primary btn-with-arrow">
          <span className="arrow">→</span> Siirry laskuriin
        </a>
      </header>

      <main id="main-content" className="container">
        <h2>Hitas-indeksien kehitys</h2>

        <p>
          Alla olevat graafit näyttävät Hitas-asuntojen hinnoittelussa käytettävien hitas-indeksien
          kehityksen vuosien varrella. Hitas-indeksit päivittyvät säännöllisesti ja niitä käytetään
          määrittämään asuntojen enimmäismyyntihinnat.
        </p>

        <Charts />

        <p style={{ marginTop: '30px', fontSize: '13px', color: '#999', textAlign: 'center' }}>
          Hitas-indeksitiedot päivittyvät automaattisesti Helsingin kaupungin julkaisemista tiedoista.
        </p>
      </main>

      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={jsonLd} />
      <Footer />
    </>
  )
}

