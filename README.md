# HITAS Rajahintalaskuri

HITAS-asuntojen rajahinnan laskemiseen tarkoitettu web-sovellus. Laskuri käyttää Helsingin kaupungin virallisia rakennuskustannus- ja markkinahintaindeksejä.

## Käyttö

Sovellus on käytettävissä osoitteessa: [GitHub Pages](https://veikko.karsikko.github.io/rajahinta/) *(päivitä linkki oikeaksi)*

### Rajahinnan laskeminen

1. Syötä asunnon alkuperäinen velaton hankintahinta (€)
2. Valitse ostovuosi ja -kuukausi
3. Klikkaa "Laske rajahinta"

Sovellus laskee rajahinnan molemmilla indekseillä ja näyttää korkeamman arvon.

### Tietojen tallennus

Sovellus tallentaa syöttämäsi tiedot selaimen paikalliseen muistiin (localStorage). Kun palaat sivulle, rajahinta lasketaan automaattisesti uusimmilla indeksiarvoilla.

## Indeksit

Laskuri käyttää kahta indeksiä:
- **Rakennuskustannusindeksi 2005=100** - Tilastokeskus
- **Markkinahintaindeksi 2005=100** - Vanhojen osakeasuntojen hintaindeksi, Tilastokeskus

Indeksit päivitetään automaattisesti Helsingin kaupungin [virallisesta PDF-tiedostosta](https://www.hel.fi/static/kv/asunto-osasto/hitas-indeksit-2005-100.pdf).

## Tekninen toteutus

- Yksisivuinen HTML/JavaScript-sovellus
- Ei vaadi palvelinta, toimii täysin selaimessa
- Responsiivinen design (toimii myös mobiililaitteilla)
- Indeksit upotettu JavaScript-koodiin
- Automaattinen päivitys GitHub Actionsilla

## GitHub Pages -julkaisu

1. Mene repositoryn asetuksiin (Settings)
2. Valitse vasemmalta "Pages"
3. Source: Deploy from a branch
4. Branch: `main`, kansio: `/ (root)`
5. Tallenna

Sivusto on käytettävissä muutaman minuutin kuluttua osoitteessa: `https://<käyttäjänimi>.github.io/rajahinta/`

## Indeksien päivitys

Indeksit päivitetään automaattisesti:
- GitHub Actions ajaa päivitysscriptin päivittäin klo 06:00 (Suomen aika)
- Scripti hakee uusimman PDF:n Helsingin kaupungin sivuilta
- Jos dataa on päivittynyt, se commitoidaan automaattisesti

Voit myös pakottaa päivityksen manuaalisesti:
1. Mene repositoryn "Actions"-välilehdelle
2. Valitse "Update HITAS Indices"
3. Klikkaa "Run workflow"

## Kehitys

### Vaatimukset
- Python 3.8+
- `pdfplumber` ja `beautifulsoup4` (katso `requirements.txt`)

### Paikallinen testaus

Avaa `index.html` suoraan selaimessa:
```bash
open index.html  # macOS
xdg-open index.html  # Linux
start index.html  # Windows
```

Tai käynnistä yksinkertainen HTTP-palvelin:
```bash
python -m http.server 8000
# Avaa selaimessa: http://localhost:8000
```

### Indeksien manuaalinen päivitys

```bash
python scripts/update_indices.py
```

## Lisenssi

MIT License - katso [LICENSE](LICENSE) tiedosto
