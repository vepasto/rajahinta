import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'
import '@/styles/info.css'
import '@/styles/calculator.css'

export default function InfoPage() {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Siirry sisältöön
      </a>
      <Navigation />
      <header className="header" style={{ paddingBottom: '10px', marginBottom: '20px' }}>
        <h1>Tietoa Hitas-asunnoista</h1>
        <p className="subtitle" style={{ marginBottom: '10px' }}>Lue lisää Hitas-järjestelmästä ja hinnoittelusta</p>
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
          <strong>Nykyinen rajaneliöhinta:</strong> 4 159 €/m²
          <br />
          <strong>Voimassa:</strong> 1.11.2025 - 31.1.2026
          <br />
          <strong>Päivitetään:</strong> Neljännesvuosittain (helmikuu, toukokuu, elokuu, marraskuu)
        </div>

        <div className="formula">
          Rajaneliöhinta:
          <br />
          Asunnon pinta-ala (m²) × 4 159 €/m²
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
            Rajaneliöhinta (pinta-ala × 4 159 €/m²) - <em>ilman parannuksia</em>
          </li>
        </ul>

        <h2>Mitä tämä lomake ei huomioi</h2>

        <div className="warning-box">
          <strong>⚠️ Tärkeää:</strong> Tämä laskuri antaa vain <strong>karkean suuntaa antavan</strong>{' '}
          arvion. Virallinen enimmäishinta vahvistetaan aina kaupungin toimesta.
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

        <h2>Lisätietoa</h2>

        <p>Lisätietoja Hitas-asunnoista ja hinnoittelusta:</p>

        <ul>
          <li>
            <a href="https://fi.wikipedia.org/wiki/Hitas" className="external-link" target="_blank" rel="noopener">
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

      <Footer />
    </>
  )
}

