# Muutosloki

## 2025-11-15: Tuki ennen 2011 valmistuneille asunnoille

### Lisätyt ominaisuudet

1. **Uusi importteri vanhalle markkinahintaindeksille**
   - Luotu `scripts/import_old_market_index.py`
   - Lataa ja parsii vanhojen osakeasuntojen hintaindeksin (1978-2026)
   - Lähde: https://www.hel.fi/static/kv/asunto-osasto/hitas-markkinahintaindeksi.pdf

2. **Päivitetty indeksien päivitysscripti**
   - `scripts/update_indices.py` nyt lataa kolme indeksiä:
     - Rakennuskustannusindeksi (2011→)
     - Markkinahintaindeksi (2011→)
     - Vanhat markkinahintaindeksi (1978-2026)

3. **Päivitetty JSON-rakenne**
   - `data/indices-2025-11-15.json` sisältää nyt:
     - `rakennuskustannusindeksi`: 21 vuotta (2005-2025)
     - `markkinahintaindeksi`: 22 vuotta (2005-2026)
     - `vanhat_markkinahintaindeksi`: 49 vuotta (1978-2026)

4. **Päivitetty web-sovellus**
   - Vuosivalinta laajennettu: 1978-2025 (aiemmin 2011-2025)
   - Automaattinen indeksin valinta:
     - **Ennen 2011**: Käytetään yhtä vanhojen osakeasuntojen hintaindeksiä
     - **2011 alkaen**: Käytetään kahta indeksiä (rakennuskustannus ja markkinahinta) ja valitaan korkeampi
   - Päivitetty UI kertomaan tuesta molemmille asuntotyypeille
   - Päivitetty laskentanäkymä näyttämään käytetty indeksi ja kaava

### Laskentatapa

#### Ennen 1.1.2011 valmistuneet asunnot

Käytetään yhtä vanhojen osakeasuntojen hintaindeksiä (markkinahintaindeksi):

```
Enimmäishinta = (Nykyinen indeksi / Valmistumishetken indeksi) × Alkuperäinen hinta
```

Esimerkki (PDF:n mukainen):
- Asunto valmistunut 1/1999, alkuperäinen hinta 95 000 €
- Valmistumishetken indeksi: 196.0
- Nykyinen indeksi (1/2025): 501.6
- Laskelma: 501.6 / 196.0 × 95 000 € = 243 122 €

#### 1.1.2011 alkaen valmistuneet asunnot

Lasketaan molemmilla indekseillä ja valitaan korkeampi:
1. Rakennuskustannusindeksi (2005=100)
2. Markkinahintaindeksi (2005=100)

### Tekniset tiedot

- Indeksit päivitetään automaattisesti PDF-tiedostoista
- SSL-sertifikaattien käsittely lisätty yhteensopivuuden vuoksi
- JSON-tiedosto sisältää päivityspäivämäärän
- Laskelmat pyöristetään kokonaislukuihin (euroina)

### Lähteet

1. **2011 alkaen valmistuneet**:
   - https://www.hel.fi/static/kv/asunto-osasto/hitas-indeksit-2005-100.pdf
   
2. **Ennen 2011 valmistuneet**:
   - https://www.hel.fi/static/kv/asunto-osasto/hitas-markkinahintaindeksi.pdf

3. **Ohjeistus**:
   - https://hartela.fi/media/ulvcbt2x/helsingin_kaupunki_hitas-tietopaketti.pdf

### Käyttöönotto

1. Päivitä indeksit:
   ```bash
   cd scripts
   python3 update_indices.py
   ```

2. Avaa `index.html` selaimessa

### Testaus

Testattu PDF:n esimerkilaskelmalla:
- Input: 1/1999, 95 000 €
- Output: 243 122 €
- Tulos: ✓ Täsmää PDF:n kanssa

