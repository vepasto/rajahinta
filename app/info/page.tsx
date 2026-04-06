import type { BreadcrumbList, FAQPage, HowTo, WithContext } from 'schema-dts'
import { readdirSync, readFileSync } from 'fs'
import { join } from 'path'
import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'
import { JsonLd } from '@/components/JsonLd'
import '@/styles/info.css'
import '@/styles/calculator.css'

export const metadata = {
  title: 'Tietoa Hitas-asunnoista - Hitas hintalaskuri',
  description:
    'Lue lisää Hitas-järjestelmästä, hinnoitteluperiaatteista ja enimmäishinnan laskemisesta. Tietoa indekseistä, rajaneliöhinnasta ja parannusten vaikutuksesta.',
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''

interface Rajaneliohinta {
  price_per_sqm: number
  valid_from: string
  valid_until: string
}

function loadLatestRajaneliohinta(): Rajaneliohinta | null {
  try {
    const dataDir = join(process.cwd(), 'public', 'data')
    const latest = readdirSync(dataDir)
      .filter((f) => /^indices-\d{4}-\d{2}-\d{2}\.json$/.test(f))
      .sort()
      .at(-1)
    if (!latest) return null
    const data = JSON.parse(readFileSync(join(dataDir, latest), 'utf-8'))
    const raj = data?.rajaneliohinta
    if (raj?.price_per_sqm && raj?.valid_from && raj?.valid_until) return raj
    return null
  } catch {
    return null
  }
}

function formatFinnishDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number)
  return `${day}.${month}.${year}`
}

function formatPriceSqm(price: number): string {
  return new Intl.NumberFormat('fi-FI').format(price) + '\u00a0€/m²'
}

export default function InfoPage() {
  const raj = loadLatestRajaneliohinta()
  const priceFormatted = raj ? formatPriceSqm(raj.price_per_sqm) : '–'
  const validFrom = raj ? formatFinnishDate(raj.valid_from) : '–'
  const validUntil = raj ? formatFinnishDate(raj.valid_until) : '–'

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
        name: 'Tietoa Hitas-asunnoista',
        item: `${siteUrl}/info/`,
      },
    ],
  }

  const howToSteps: Array<{ name: string; text: string }> = [
    {
      name: 'Selvitä lähtötiedot',
      text: 'Tarvitset asunnon alkuperäisen velattoman hankintahinnan, valmistumisajankohdan (vuosi ja kuukausi) sekä asunnon pinta-alan neliömetreinä.',
    },
    {
      name: 'Laske indeksipohjainen hinta',
      text: 'Vuodesta 2011 alkaen valmistetuille asunnoille lasketaan kaksi indeksihintaa: rakennuskustannusindeksillä ja markkinahintaindeksillä. Kaava: nykyinen indeksi / valmistumishetken indeksi × alkuperäinen hinta. Käytetään näistä korkeampaa. Ennen vuotta 2011 valmistuneille käytetään vanhojen osakeasuntojen hintaindeksiä.',
    },
    {
      name: 'Laske rajaneliöhintapohjainen hinta',
      text: raj
        ? `Kerro asunnon pinta-ala nykyisellä rajaneliöhinnalla (${priceFormatted}, voimassa ${validFrom}–${validUntil}). Rajaneliöhinta on voimassa kaikille Hitas-asunnoille vuodesta 2011 alkaen.`
        : 'Kerro asunnon pinta-ala voimassaolevalla rajaneliöhinnalla. Rajaneliöhinta on voimassa kaikille Hitas-asunnoille vuodesta 2011 alkaen.',
    },
    {
      name: 'Lisää yhtiöparannukset',
      text: 'Lisää huoneistokohtainen osuus yhtiön parannuskustannuksista indeksihintoihin. Parannuksiin sovelletaan 30 €/m² omavastuuta ja indeksitarkistusta. Parannuksia ei lisätä rajaneliöhintaan.',
    },
    {
      name: 'Valitse korkein hinta',
      text: 'Vertaile kaikkia laskettuja hintoja (rakennuskustannusindeksi + parannukset, markkinahintaindeksi + parannukset, rajaneliöhinta ilman parannuksia) ja valitse niistä korkein. Tämä on asunnon velaton enimmäishinta.',
    },
  ]

  const howToJsonLd: WithContext<HowTo> = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'Miten Hitas-asunnon enimmäishinta lasketaan',
    description:
      'Hitas-asunnon velaton enimmäishinta lasketaan vertailemalla indeksipohjaisia hintoja ja rajaneliöhintaa, ja valitsemalla niistä korkein.',
    inLanguage: 'fi-FI',
    step: howToSteps.map(({ name, text }, i) => ({
      '@type': 'HowToStep' as const,
      position: i + 1,
      name,
      text,
    })),
  }

  const faqItems: Array<{ question: string; answer: string }> = [
    {
      question: 'Voiko Hitas-asunnon myydä vapaasti?',
      answer:
        'Ei. Hitas-asunto voidaan myydä vain kaupungin vahvistaman enimmäishinnan mukaisesti, eikä myyntihinta saa ylittää laskettua enimmäishintaa. Ostajan tulee myös olla yksityishenkilö — yritykset eivät voi ostaa Hitas-asuntoa.',
    },
    {
      question: 'Miten tiedän, onko asuntoni Hitas?',
      answer:
        'Hitas-status näkyy isännöitsijäntodistuksessa. Voit myös tarkistaa asian taloyhtiön isännöitsijältä tai Helsingin kaupungin asunto-osastolta. Hitas-asunnot sijaitsevat aina Helsingin kaupungin omistamalla maalla.',
    },
    {
      question: 'Voiko Hitas-asunnon vuokrata?',
      answer:
        'Kyllä, Hitas-asunnon voi vuokrata normaalisti. Vuokraustoimintaan ei sovelleta Hitas-hintasääntelyä — rajoitukset koskevat vain asunnon myyntihintaa.',
    },
    {
      question: 'Miten haen virallisen enimmäishinnan vahvistuksen?',
      answer:
        'Virallinen enimmäishinta haetaan Helsingin kaupungilta. Isännöitsijä täyttää enimmäishinnan vahvistamislomakkeen, johon liitetään isännöitsijäntodistus. Kaupunki vahvistaa hinnan näiden dokumenttien perusteella. Tämä laskuri antaa vain suuntaa antavan arvion — virallinen vahvistus on aina pyydettävä ennen kauppaa.',
    },
    {
      question: 'Vaikuttaako asuntoon tehty remontti enimmäishintaan?',
      answer:
        'Kyllä, mutta vain taloyhtiön tekemät parannukset (yhtiöparannukset) lisätään enimmäishintaan. Osakkeenomistajan itse tekemät remontit eivät suoraan nosta enimmäishintaa. Yhtiöparannuksiin sovelletaan omavastuuta (30 €/m²) ja indeksitarkistusta.',
    },
    {
      question: 'Mikä on rajaneliöhinta ja miksi se on tärkeä?',
      answer: raj
        ? `Rajaneliöhinta on Helsingin kaupunginvaltuuston neljännesvuosittain vahvistama neliöhintaraja. Se toimii hintapohjana kaikille Hitas-asunnoille vuodesta 2011 alkaen: jos indeksipohjainen hinta jää sen alle, käytetään rajaneliöhintaa. Nykyinen rajaneliöhinta on ${priceFormatted} (voimassa ${validFrom}–${validUntil}).`
        : 'Rajaneliöhinta on Helsingin kaupunginvaltuuston neljännesvuosittain vahvistama neliöhintaraja. Se toimii hintapohjana kaikille Hitas-asunnoille vuodesta 2011 alkaen: jos indeksipohjainen hinta jää sen alle, käytetään rajaneliöhintaa.',
    },
  ]

  const faqJsonLd: WithContext<FAQPage> = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${siteUrl}/info/#webpage`,
    url: `${siteUrl}/info/`,
    name: 'Tietoa Hitas-asunnoista',
    description:
      'Lue lisää Hitas-järjestelmästä, hinnoitteluperiaatteista ja enimmäishinnan laskemisesta. Tietoa indekseistä, rajaneliöhinnasta ja parannusten vaikutuksesta.',
    inLanguage: 'fi-FI',
    isPartOf: { '@id': `${siteUrl}/#website` },
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Mikä on Hitas-asunto?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Hitas (Hinta- ja laatutason säätelyjärjestelmä) on Helsingin kaupungin järjestelmä, jolla säädellään kaupungin maalla sijaitsevien asuntojen hintoja. Hitas-asuntojen myyntihinnat on rajattu kaupungin vahvistamiin enimmäishintoihin, asuntoja saa myydä vain yksityishenkilöille, ja alkuperäinen hankintahinta on markkinahintaa alempi.',
        },
      },
      {
        '@type': 'Question',
        name: 'Miten Hitas-asunnon enimmäishinta lasketaan?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: raj
            ? `Hitas-asunnon enimmäishinta lasketaan vertailemalla indeksipohjaisia hintoja ja rajaneliöhintaa. Vuodesta 2011 alkaen valmistetuille lasketaan rakennuskustannusindeksihinta ja markkinahintaindeksihinta (kaava: nykyinen indeksi / valmistumisindeksi × alkuperäinen hinta). Lisäksi lasketaan rajaneliöhintapohjainen hinta (pinta-ala × ${priceFormatted}). Yhtiöparannukset lisätään indeksihintoihin. Lopullinen enimmäishinta on näistä korkein.`
            : 'Hitas-asunnon enimmäishinta lasketaan vertailemalla indeksipohjaisia hintoja ja rajaneliöhintaa. Vuodesta 2011 alkaen valmistetuille lasketaan rakennuskustannusindeksihinta ja markkinahintaindeksihinta (kaava: nykyinen indeksi / valmistumisindeksi × alkuperäinen hinta). Lisäksi lasketaan rajaneliöhintapohjainen hinta. Yhtiöparannukset lisätään indeksihintoihin. Lopullinen enimmäishinta on näistä korkein.',
        },
      },
      ...faqItems.map(({ question, answer }) => ({
        '@type': 'Question' as const,
        name: question,
        acceptedAnswer: { '@type': 'Answer' as const, text: answer },
      })),
    ],
  }

  return (
    <>
      <a href="#main-content" className="skip-link">
        Siirry sisältöön
      </a>
      <Navigation />
      <header className="header" style={{ paddingBottom: '10px', marginBottom: '20px' }}>
        <h1>Tietoa Hitas-asunnoista</h1>
        <p className="subtitle" style={{ marginBottom: '10px' }}>
          Lue lisää Hitas-järjestelmästä ja hinnoittelusta
        </p>
        <a href="/" className="btn-primary btn-with-arrow">
          <span className="arrow">→</span> Siirry laskuriin
        </a>
      </header>

      <main id="main-content" className="container">
        <h2>Mikä on Hitas-asunto?</h2>

        <p>
          Hitas (Hinta- ja laatutason säätelyjärjestelmä) on Helsingin kaupungin omistaman
          asuntotontin luovutukseen ja rakentamiseen liittyvä järjestelmä, jolla säädellään
          asuntojen hintoja ja laatua.
        </p>

        <div className="info-box">
          <strong>Keskeiset Hitas-periaatteet:</strong>
          <ul>
            <li>
              <strong>Hintojen säätely:</strong> Asuntojen myyntihinnat on rajattu kaupungin
              vahvistamiin enimmäishintoihin
            </li>
            <li>
              <strong>Kohtuuhintaisuus:</strong> Tavoitteena on tarjota kohtuuhintaisia asuntoja
              helsinkiläisille
            </li>
            <li>
              <strong>Luonnollisille henkilöille:</strong> Hitas-asuntoja saa myydä vain
              yksityishenkilöille, ei yrityksille
            </li>
            <li>
              <strong>Myyntirajoitus:</strong> Asunnon omistusoikeus voidaan siirtää vain
              kaupungin vahvistaman enimmäishinnan mukaisesti
            </li>
          </ul>
        </div>

        <h3>Hitas-asunnon edut</h3>
        <ul>
          <li>Alkuperäinen hankintahinta on markkinahintaa alempi</li>
          <li>Turvaa kohtuuhintaisen asumisen</li>
          <li>Sijaitsevat usein hyvällä paikalla Helsingissä</li>
        </ul>

        <h3>Hitas-asunnon rajoitukset</h3>
        <ul>
          <li>Myyntihinta on rajattu kaupungin vahvistamaan enimmäishintaan</li>
          <li>Arvonnousu voi jäädä vapaiden markkinahintojen alapuolelle</li>
          <li>Enimmäishinta lasketaan indeksien ja rajaneliöhinnan mukaan</li>
        </ul>

        <h2>Miten hinnat lasketaan?</h2>

        <p>
          Hitas-asuntojen myyntihinnat määräytyvät eri tavalla riippuen siitä, milloin asunto on
          valmistunut.
        </p>

        <h3>Asunnot valmistuneet 1.1.2011 alkaen</h3>

        <p>
          Enimmäishinta lasketaan kahdella indeksillä (
          <a href="/graphs/#new-indices-chart" className="chart-link">
            katso graafi →
          </a>
          ) ja valitaan <strong>korkeampi</strong>:
        </p>

        <div className="formula">
          Rakennuskustannusindeksi:
          <br />
          Nykyinen indeksi / Valmistumishetken indeksi × Alkuperäinen hinta
        </div>

        <div className="formula">
          Markkinahintaindeksi:
          <br />
          Nykyinen indeksi / Valmistumishetken indeksi × Alkuperäinen hinta
        </div>

        <h3>Asunnot valmistuneet ennen 1.1.2011</h3>

        <p>
          Käytetään yhtä vanhojen osakeasuntojen hintaindeksiä (
          <a href="/graphs/#old-indices-chart" className="chart-link">
            katso graafi →
          </a>
          ):
        </p>

        <div className="formula">
          Nykyinen indeksi / Valmistumishetken indeksi × Alkuperäinen hinta
        </div>

        <h3>Rajaneliöhinta (kaikki asunnot)</h3>

        <p>
          Vuodesta 2011 alkaen on käytössä myös <strong>rajaneliöhinta</strong>, joka toimii
          hintapohjana kaikille Hitas-asunnoille:
        </p>

        <div className="info-box">
          <strong>Nykyinen rajaneliöhinta:</strong> {priceFormatted}
          <br />
          <strong>Voimassa:</strong> {validFrom} – {validUntil}
          <br />
          <strong>Päivitetään:</strong> Neljännesvuosittain (helmikuu, toukokuu, elokuu, marraskuu)
        </div>

        <div className="formula">
          Rajaneliöhinta:
          <br />
          Asunnon pinta-ala (m²) × {priceFormatted}
        </div>

        <p>
          <strong>Kaupunginvaltuuston päätös:</strong> Jos indeksipohjainen neliöhinta on alempi
          kuin rajaneliöhinta, käytetään rajaneliöhintaa. Muutoin käytetään indeksipohjaista
          hintaa.
        </p>

        <p>
          <a
            href="https://www.hel.fi/static/kv/asunto-osasto/hitas-rajahintatilasto.pdf"
            className="external-link"
            target="_blank"
            rel="noopener"
          >
            Rajaneliöhinta-tilasto →
          </a>
        </p>

        <h3>Yhtiön parannukset</h3>

        <p>
          Asunnon enimmäishintaan lisätään huoneistokohtainen osuus yhtiön parannusten
          kustannuksista.{' '}
          <a
            href="https://www.hel.fi/fi/asuminen/omistusasunnot/hitas-asunnon-myyminen#hitas-asunnon-muutostyot-ja-parannukset"
            className="external-link"
            target="_blank"
            rel="noopener"
          >
            Lisätietoja Helsingin kaupungin sivuilta →
          </a>
        </p>

        <div className="info-box">
          <strong>Parannusten huomiointi:</strong>
          <ul>
            <li>
              <strong>Omavastuu:</strong> 30 €/m² × asunnon pinta-ala
            </li>
            <li>
              <strong>Indeksitarkistus:</strong> Omavastuun ylittäviin kustannuksiin tehdään
              indeksitarkistus parannusten valmistumisajankohdasta laskenta-ajankohtaan
            </li>
            <li>
              <strong>Huoneiston osuus:</strong> Lasketaan huoneiston ja yhtiön pinta-alojen
              suhteessa (esim. huoneisto 60 m² / yhtiö 2400 m² = 2,5%)
            </li>
            <li>
              <strong>Indeksin valinta:</strong> Jokainen parannus käyttää sitä indeksiä, joka
              antaa korkeamman hinnan (sama logiikka kuin asunnon hintaan)
            </li>
          </ul>
        </div>

        <div className="formula">
          Parannuksen indeksitarkistettu arvo:
          <br />
          (Parannuksen hinta - Omavastuu) × (Nykyinen indeksi / Parannuksen valmistumisindeksi)
        </div>

        <p>
          <strong>Tärkeää:</strong> Parannukset lisätään vain indeksihintoihin
          (rakennuskustannusindeksi, markkinahintaindeksi, vanhat markkinahintaindeksi).
          Rajaneliöhintaan parannuksia ei lisätä.
        </p>

        <h3>Lopullinen enimmäishinta</h3>

        <p>Laskuri vertailee kaikkia laskettuja hintoja ja valitsee <strong>korkeimman</strong>:</p>
        <ul>
          <li>
            Rakennuskustannusindeksillä laskettu hinta + parannukset (jos valmistunut ≥ 2011)
          </li>
          <li>Markkinahintaindeksillä laskettu hinta + parannukset</li>
          <li>Vanhojen markkinahintaindeksin hinta + parannukset (jos valmistunut &lt; 2011)</li>
          <li>
            Rajaneliöhinta (pinta-ala × {priceFormatted}) – <em>ilman parannuksia</em>
          </li>
        </ul>

        <section className="howto-section" aria-labelledby="howto-heading">
          <h2 id="howto-heading">Laskentaohje lyhyesti</h2>
          <ol className="howto-steps">
            {howToSteps.map(({ name, text }, i) => (
              <li key={i} className="howto-step">
                <div className="howto-step-number" aria-hidden="true">{i + 1}</div>
                <div className="howto-step-content">
                  <strong className="howto-step-name">{name}</strong>
                  <p className="howto-step-text">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <h2>Mitä tämä lomake ei huomioi</h2>

        <div className="warning-box">
          <strong>⚠️ Tärkeää:</strong> Tämä laskuri antaa vain{' '}
          <strong>karkean suuntaa antavan</strong> arvion. Virallinen enimmäishinta vahvistetaan
          aina kaupungin toimesta.
        </div>

        <h3>Virallinen enimmäishinnan vahvistus</h3>

        <p>
          Asunnon virallinen enimmäishinta vahvistetaan Helsingin kaupungin toimesta seuraavien
          dokumenttien perusteella:
        </p>

        <ul>
          <li>
            <strong>Isännöitsijäntodistus</strong> - sisältää tiedot asunnosta, yhtiölainoista ja
            tehdyistä remonteista
          </li>
          <li>
            <strong>Enimmäishinnan vahvistamislomake</strong> - isännöitsijän täyttämä lomake
          </li>
        </ul>

        <p>
          Näiden dokumenttien avulla kaupunki voi huomioida kaikki asuntoon ja taloyhtiöön tehdyt
          muutokset ja antaa tarkan enimmäishinnan.
        </p>

        <div className="info-box">
          <strong>💡 Suositus:</strong> Käytä tätä laskuria saamaan alustava arvio hinnasta. Pyydä
          aina virallinen enimmäishinnan vahvistus Helsingin kaupungilta ennen kauppaa.
        </div>

        <h2>Mistä voi ostaa Hitas-asuntoja?</h2>

        <p>Hitas-asuntoja voi ostaa useista eri kanavista:</p>

        <ul>
          <li>
            <a
              href="https://www.hel.fi/fi/asuminen/omistusasunnot/hitas-uudiskohteet"
              className="external-link"
              target="_blank"
              rel="noopener"
            >
              Helsingin kaupungin Hitas-uudiskohteet
            </a>
          </li>
          <li>
            <a
              href="https://asunnot.oikotie.fi/myytavat-asunnot?pagination=1&cardType=100&keywords%5B%5D=hitas"
              className="external-link"
              target="_blank"
              rel="noopener"
            >
              Oikotie.fi - Hitas-asunnot
            </a>
          </li>
          <li>
            <a
              href="https://www.etuovi.com/myytavat-asunnot?haku=M2365618643"
              className="external-link"
              target="_blank"
              rel="noopener"
            >
              Etuovi.com - Hitas-asunnot
            </a>
          </li>
          <li>
            <a
              href="https://www.facebook.com/groups/396231130843742/"
              className="external-link"
              target="_blank"
              rel="noopener"
            >
              Hitaskoti
            </a>
          </li>
        </ul>

        <section className="faq-section" aria-labelledby="faq-heading">
          <h2 id="faq-heading">Usein kysytyt kysymykset</h2>

          <dl className="faq-list">
            {faqItems.map(({ question, answer }) => (
              <div className="faq-item" key={question}>
                <details>
                  <summary>
                    <dt>{question}</dt>
                  </summary>
                  <dd>{answer}</dd>
                </details>
              </div>
            ))}
          </dl>
        </section>

        <h2>Lisätietoa</h2>

        <p>Lisätietoja Hitas-asunnoista ja hinnoittelusta:</p>

        <ul>
          <li>
            <a
              href="https://fi.wikipedia.org/wiki/Hitas"
              className="external-link"
              target="_blank"
              rel="noopener"
            >
              Wikipedia - Hitas
            </a>
          </li>
          <li>
            <a
              href="https://www.hel.fi/fi/asuminen/omistusasunnot/hitas-asunnon-myyminen"
              className="external-link"
              target="_blank"
              rel="noopener"
            >
              Hitas-asunnon myyminen
            </a>
          </li>
          <li>
            <a
              href="https://www.hel.fi/static/kv/asunto-osasto/hitas-indeksit-2005-100.pdf"
              className="external-link"
              target="_blank"
              rel="noopener"
            >
              Hitas-indeksit (2011→)
            </a>
          </li>
          <li>
            <a
              href="https://www.hel.fi/static/kv/asunto-osasto/hitas-markkinahintaindeksi.pdf"
              className="external-link"
              target="_blank"
              rel="noopener"
            >
              Vanhat markkinahintaindeksit (←2011)
            </a>
          </li>
          <li>
            <a
              href="https://www.hel.fi/static/kv/asunto-osasto/hitas-rajahinta.pdf"
              className="external-link"
              target="_blank"
              rel="noopener"
            >
              Rajaneliöhinta
            </a>
          </li>
          <li>
            <a
              href="https://hartela.fi/media/ulvcbt2x/helsingin_kaupunki_hitas-tietopaketti.pdf"
              className="external-link"
              target="_blank"
              rel="noopener"
            >
              Hitas-tietopaketti
            </a>
          </li>
          <li>
            <a
              href="https://www.hel.fi/fi/asuminen-ja-ymparisto/asunnot/hitas-ja-asuntojen-hintasaantely"
              className="external-link"
              target="_blank"
              rel="noopener"
            >
              Helsingin kaupungin Hitas-sivut
            </a>
          </li>
        </ul>
      </main>

      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={faqJsonLd} />
      <JsonLd data={howToJsonLd} />
      <Footer />
    </>
  )
}
