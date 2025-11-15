# Käyttöönotto-ohjeet

## 1. GitHub Pages -julkaisu

1. **Push koodi GitHubiin:**
   ```bash
   git add .
   git commit -m "Initial commit: HITAS rajahintalaskuri"
   git push origin main
   ```

2. **Aktivoi GitHub Pages:**
   - Mene repositoryn asetuksiin: `https://github.com/<käyttäjänimi>/rajahinta/settings`
   - Valitse vasemmalta **"Pages"**
   - **Source**: Deploy from a branch
   - **Branch**: `main`
   - **Folder**: `/ (root)`
   - Klikkaa **"Save"**

3. **Odota julkaisua:**
   - Sivusto on valmis muutamassa minuutissa
   - URL: `https://<käyttäjänimi>.github.io/rajahinta/`
   - Tarkista status "Actions"-välilehdeltä

## 2. GitHub Actions -oikeudet

GitHub Actions tarvitsee oikeuden tehdä committeja:

1. Mene repositoryn asetuksiin
2. Valitse **"Actions"** → **"General"**
3. Scrollaa alas kohtaan **"Workflow permissions"**
4. Valitse **"Read and write permissions"**
5. Tallenna muutokset

Nyt automatisoitu indeksien päivitys toimii!

## 3. Manuaalinen indeksien päivitys (valinnainen)

Jos haluat testata päivitysscriptiä paikallisesti:

```bash
# Asenna riippuvuudet
pip install -r requirements.txt

# Aja päivitysscripti
python scripts/update_indices.py
```

## 4. Pakota päivitys GitHubissa

Voit ajaa päivityksen milloin tahansa:

1. Mene repositoryn **"Actions"**-välilehdelle
2. Valitse **"Update HITAS Indices"**
3. Klikkaa **"Run workflow"**
4. Valitse branch (**main**)
5. Klikkaa **"Run workflow"** -nappia

## 5. Testaa sovellus

Kun GitHub Pages on aktiivinen:

1. Avaa sivusto selaimessa
2. Syötä testidata:
   - Alkuperäinen hinta: 240000 €
   - Ostopäivä: Tammikuu 2011
3. Klikkaa "Laske rajahinta"
4. Tuloksen pitäisi näyttää noin 313 719 € (Rakennuskustannusindeksi) tai 294 966 € (Markkinahintaindeksi)

## 6. Päivitä README:n linkki

Kun sivusto on julkaistu, päivitä README.md:ssä oleva GitHub Pages -linkki oikeaksi:

```markdown
Sovellus on käytettävissä osoitteessa: https://<käyttäjänimi>.github.io/rajahinta/
```

## Ongelmanratkaisu

### Sivusto ei näy

- Tarkista että GitHub Pages on aktivoitu
- Odota 5-10 minuuttia
- Tarkista Actions-välilehdeltä että deploy onnistui

### Automaattinen päivitys ei toimi

- Varmista että Actions-oikeudet on asetettu (kohta 2)
- Tarkista Actions-välilehden lokista mahdolliset virheet
- Kokeile manuaalista ajoa (kohta 4)

### Python-scripti ei toimi

- Varmista että pdfplumber on asennettu: `pip install pdfplumber`
- Tarkista että PDF latautuu: `data/hitas-indeksit-2005-100.pdf`
- Kokeile ladata PDF manuaalisesti ja aja scripti uudestaan

## Ylläpito

- Indeksit päivittyvät automaattisesti kuukausittain (1. päivä)
- Voit myös ajaa päivityksen manuaalisesti GitHub Actionsista
- PDF ladataan aina Helsingin kaupungin viralliselta sivustolta
- Jos PDF:n rakenne muuttuu, scripti saattaa tarvita päivitystä

