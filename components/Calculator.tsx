'use client'

import { useState, useEffect, useRef } from 'react'
import { loadIndices, indicesState } from '@/lib/calculator-indices'
import { calculateRajahinta, formatPrice, Improvement, CalculationResult } from '@/lib/calculator'
import { trackEvent } from '@/lib/analytics'
import { setOnThemeChange } from '@/lib/theme'
import { PriceChart } from './PriceChart'

const monthNames = [
  'Tammikuu',
  'Helmikuu',
  'Maaliskuu',
  'Huhtikuu',
  'Toukokuu',
  'Kesäkuu',
  'Heinäkuu',
  'Elokuu',
  'Syyskuu',
  'Lokakuu',
  'Marraskuu',
  'Joulukuu',
]

interface SavedData {
  originalPrice: number
  apartmentSize: number
  purchaseYear: number
  purchaseMonth: number
  improvements?: Improvement[]
}

export function Calculator() {
  const [originalPrice, setOriginalPrice] = useState('')
  const [apartmentSize, setApartmentSize] = useState('')
  const [purchaseYear, setPurchaseYear] = useState(new Date().getFullYear())
  const [purchaseMonth, setPurchaseMonth] = useState(1)
  const [improvements, setImprovements] = useState<Array<Improvement & { id: number }>>([])
  const [improvementCounter, setImprovementCounter] = useState(0)
  const [results, setResults] = useState<CalculationResult | null>(null)
  const [finalPrice, setFinalPrice] = useState<number | null>(null)
  const [usedIndex, setUsedIndex] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [chartData, setChartData] = useState<{
    purchaseYear: number
    purchaseMonth: number
    originalPrice: number
    apartmentSize: number | null
    winner: any
  } | null>(null)
  const [indicesLoaded, setIndicesLoaded] = useState(false)

  const resultInfoRef = useRef<HTMLDivElement>(null)

  // Initialize year dropdown options
  const currentYear = new Date().getFullYear()
  const startYear = 1978
  const yearOptions: number[] = []
  for (let year = currentYear; year >= startYear; year--) {
    yearOptions.push(year)
  }

  // Load indices on mount
  useEffect(() => {
    loadIndices().then((success) => {
      if (success) {
        setIndicesLoaded(true)
      }
    })
  }, [])

  // Load from localStorage on mount
  useEffect(() => {
    const savedData = loadFromLocalStorage()
    if (savedData && indicesLoaded) {
      setOriginalPrice(String(savedData.originalPrice))
      if (savedData.apartmentSize) {
        setApartmentSize(String(savedData.apartmentSize))
      }
      setPurchaseYear(savedData.purchaseYear)
      setPurchaseMonth(savedData.purchaseMonth)

      if (savedData.improvements && savedData.improvements.length > 0) {
        const improvementsWithIds = savedData.improvements.map((imp, idx) => ({
          ...imp,
          id: idx,
        }))
        setImprovements(improvementsWithIds)
        setImprovementCounter(savedData.improvements.length)
      }

      // Auto-calculate if apartment size is available
      if (savedData.apartmentSize) {
        const calcResults = calculateRajahinta(
          savedData.originalPrice,
          savedData.purchaseYear,
          savedData.purchaseMonth,
          savedData.apartmentSize,
          savedData.improvements || []
        )
        displayResults(calcResults, savedData.originalPrice, savedData.purchaseYear, savedData.purchaseMonth, false)
      }
    }
  }, [indicesLoaded])

  // Theme change callback for chart reloading
  useEffect(() => {
    setOnThemeChange(() => {
      if (chartData) {
        setTimeout(() => {
          setChartData({ ...chartData }) // Force re-render
        }, 100)
      }
    })
  }, [chartData])

  function saveToLocalStorage(data: SavedData) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('hitasCalculatorData', JSON.stringify(data))
    }
  }

  function loadFromLocalStorage(): SavedData | null {
    if (typeof window === 'undefined') return null
    const data = localStorage.getItem('hitasCalculatorData')
    return data ? JSON.parse(data) : null
  }

  function addImprovement(improvementData?: Improvement) {
    const newId = improvementCounter
    setImprovementCounter(newId + 1)
    setImprovements([
      ...improvements,
      {
        id: newId,
        price: improvementData?.price || 0,
        year: improvementData?.year || new Date().getFullYear(),
        month: improvementData?.month || 1,
      },
    ])
  }

  function removeImprovement(id: number) {
    setImprovements(improvements.filter((imp) => imp.id !== id))
  }

  function updateImprovement(id: number, field: keyof Improvement, value: number) {
    setImprovements(
      improvements.map((imp) => (imp.id === id ? { ...imp, [field]: value } : imp))
    )
  }

  function displayResults(
    calcResults: CalculationResult,
    origPrice: number,
    purchYear: number,
    purchMonth: number,
    shouldScroll = true
  ) {
    setResults(calcResults)

    // Find highest price
    const candidates: Array<{ price: number; name: string; type: string; data: any }> = []

    if (calcResults.vanhatMarkkinahinta) {
      candidates.push({
        price: calcResults.vanhatMarkkinahinta.price,
        name: 'Vanhojen osakeasuntojen hintaindeksi (markkinahintaindeksi)',
        type: 'vanhatMarkkinahinta',
        data: calcResults.vanhatMarkkinahinta,
      })
    }

    if (calcResults.rakennuskustannus) {
      candidates.push({
        price: calcResults.rakennuskustannus.price,
        name: 'Rakennuskustannusindeksi',
        type: 'rakennuskustannus',
        data: calcResults.rakennuskustannus,
      })
    }

    if (calcResults.markkinahinta) {
      candidates.push({
        price: calcResults.markkinahinta.price,
        name: 'Markkinahintaindeksi',
        type: 'markkinahinta',
        data: calcResults.markkinahinta,
      })
    }

    if (calcResults.rajaneliohinta) {
      candidates.push({
        price: calcResults.rajaneliohinta.price,
        name: 'Rajaneliöhinta',
        type: 'rajaneliohinta',
        data: calcResults.rajaneliohinta,
      })
    }

    if (candidates.length === 0) {
      return
    }

    const winner = candidates.reduce((max, current) => (current.price > max.price ? current : max))

    setFinalPrice(winner.price)
    setUsedIndex(winner.name)

    // Set chart data
    const apartmentSizeNum = calcResults.rajaneliohinta ? calcResults.rajaneliohinta.apartmentSize : null
    setChartData({
      purchaseYear: purchYear,
      purchaseMonth: purchMonth,
      originalPrice: origPrice,
      apartmentSize: apartmentSizeNum,
      winner: winner,
    })

    if (shouldScroll && resultInfoRef.current) {
      setTimeout(() => {
        resultInfoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }, 100)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!indicesLoaded) {
      alert('Virhe: Indeksit eivät ole vielä ladattu. Odota hetki ja yritä uudelleen.')
      return
    }

    const origPrice = parseFloat(originalPrice)
    const aptSize = parseFloat(apartmentSize)
    const purchYear = purchaseYear
    const purchMonth = purchaseMonth

    if (isNaN(origPrice) || isNaN(aptSize) || !purchYear || !purchMonth) {
      alert('Täytä kaikki pakolliset kentät.')
      return
    }

    const improvementsList: Improvement[] = improvements.map(({ id, ...rest }) => rest)

    const calcResults = calculateRajahinta(origPrice, purchYear, purchMonth, aptSize, improvementsList)

    // Track calculation
    const candidates: Array<{ price: number }> = []
    if (calcResults.vanhatMarkkinahinta) candidates.push({ price: calcResults.vanhatMarkkinahinta.price })
    if (calcResults.rakennuskustannus) candidates.push({ price: calcResults.rakennuskustannus.price })
    if (calcResults.markkinahinta) candidates.push({ price: calcResults.markkinahinta.price })
    if (calcResults.rajaneliohinta) candidates.push({ price: calcResults.rajaneliohinta.price })

    const finalPriceValue = candidates.length > 0 ? Math.max(...candidates.map((c) => c.price)) : 0
    trackEvent('calculation', {
      event_category: 'calculator',
      event_label: 'price_calculation',
      value: Math.round(finalPriceValue),
      non_interaction: false,
    })

    displayResults(calcResults, origPrice, purchYear, purchMonth, true)

    // Save to localStorage
    saveToLocalStorage({
      originalPrice: origPrice,
      apartmentSize: aptSize,
      purchaseYear: purchYear,
      purchaseMonth: purchMonth,
      improvements: improvementsList,
    })
  }

  // Calculate price change
  const improvementsTotal = results?.improvements?.totalIndexedValue || 0
  const basePrice = finalPrice ? finalPrice - improvementsTotal : 0
  const priceChange = basePrice - parseFloat(originalPrice || '0')
  const percentageChange = originalPrice ? ((priceChange / parseFloat(originalPrice)) * 100).toFixed(1) : '0'
  const changeSign = priceChange >= 0 ? '+' : ''
  const changeColor = priceChange >= 0 ? '#27ae60' : '#e74c3c'

  return (
    <>
      <form id="calculatorForm" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="originalPrice">Alkuperäinen velaton hankintahinta (€)</label>
          <input
            type="number"
            id="originalPrice"
            name="originalPrice"
            required
            min="0"
            max="999999999"
            value={originalPrice}
            onChange={(e) => setOriginalPrice(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="apartmentSize">Asunnon pinta-ala (m²)</label>
          <input
            type="number"
            id="apartmentSize"
            name="apartmentSize"
            required
            min="1"
            step="0.5"
            max="9999"
            value={apartmentSize}
            onChange={(e) => setApartmentSize(e.target.value)}
          />
        </div>

        <div className="form-section-title">Valmistumisaika</div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="purchaseYear">Vuosi</label>
            <select
              id="purchaseYear"
              name="purchaseYear"
              required
              value={purchaseYear}
              onChange={(e) => setPurchaseYear(parseInt(e.target.value))}
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="purchaseMonth">Kuukausi</label>
            <select
              id="purchaseMonth"
              name="purchaseMonth"
              required
              value={purchaseMonth}
              onChange={(e) => setPurchaseMonth(parseInt(e.target.value))}
            >
              {monthNames.map((month, index) => (
                <option key={index + 1} value={index + 1}>
                  {month}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="improvements-section">
          <div className="form-section-title">Yhtiön parannukset</div>
          <div id="improvementsList">
            {improvements.map((improvement) => (
              <div key={improvement.id} className="improvement-item">
                <div className="improvement-item-header">
                  <span className="improvement-item-title">
                    Parannus {improvements.indexOf(improvement) + 1}
                  </span>
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => removeImprovement(improvement.id)}
                  >
                    Poista
                  </button>
                </div>
                <div className="form-group">
                  <label htmlFor={`improvementPrice_${improvement.id}`} className="label-with-tooltip">
                    <span>Huoneistoon kohdistuva hinta (€)</span>
                    <span className="info-tooltip">
                      <span className="info-icon">?</span>
                      <span className="tooltip-content">
                        Huoneiston osuus lasketaan huoneiston ja yhtiön pinta-alojen suhteessa.
                        <br />
                        Esim. huoneisto 60 m² / yhtiö 2400 m² = 2,5%
                      </span>
                    </span>
                  </label>
                  <input
                    type="number"
                    id={`improvementPrice_${improvement.id}`}
                    className="improvement-price"
                    min="0"
                    step="1"
                    value={improvement.price}
                    onChange={(e) =>
                      updateImprovement(improvement.id, 'price', parseFloat(e.target.value) || 0)
                    }
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor={`improvementYear_${improvement.id}`}>Valmistumisvuosi</label>
                    <select
                      id={`improvementYear_${improvement.id}`}
                      className="improvement-year"
                      value={improvement.year}
                      onChange={(e) =>
                        updateImprovement(improvement.id, 'year', parseInt(e.target.value))
                      }
                    >
                      {yearOptions.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor={`improvementMonth_${improvement.id}`}>Valmistumiskuukausi</label>
                    <select
                      id={`improvementMonth_${improvement.id}`}
                      className="improvement-month"
                      value={improvement.month}
                      onChange={(e) =>
                        updateImprovement(improvement.id, 'month', parseInt(e.target.value))
                      }
                    >
                      {monthNames.map((month, index) => (
                        <option key={index + 1} value={index + 1}>
                          {month}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="btn-add-improvement"
            id="addImprovementBtn"
            onClick={() => addImprovement()}
          >
            + Lisää parannus
          </button>
        </div>

        <div className="button-group">
          <button type="submit" className="btn-primary">
            Laske enimmäishinta
          </button>
        </div>

        <div
          className="disclaimer"
          style={{
            marginTop: '8px',
            padding: '8px 12px',
            background: 'rgba(255, 255, 255, 0.5)',
            borderRadius: '8px',
            textAlign: 'center',
            fontSize: '13px',
            color: '#666',
          }}
        >
          <em>Huom! Tämä on epävirallinen lomake ja tarkoitettu vain suuntaa antavaksi.</em>
        </div>
      </form>

      {results && finalPrice && (
        <div id="result" className="result show" role="region" aria-live="polite" aria-atomic="true">
          <div className="result-title">Velaton enimmäishinta</div>
          <div className="result-price" id="resultPrice" aria-label="Laskettu enimmäishinta">
            {formatPrice(finalPrice)}
          </div>
          <div className="result-change" id="resultChange" aria-label="Hinnanmuutos">
            <span style={{ color: changeColor }}>
              {changeSign}
              {formatPrice(Math.abs(priceChange))} ({changeSign}
              {percentageChange}%)
            </span>
          </div>
          {improvementsTotal > 0 && (
            <div className="result-improvements" id="resultImprovements" aria-label="Parannukset">
              <span style={{ color: '#666' }}>sis. {formatPrice(improvementsTotal)} parannukset</span>
            </div>
          )}
          {chartData && (
            <div className="price-chart-container" id="priceChartContainer">
              <PriceChart
                purchaseYear={chartData.purchaseYear}
                purchaseMonth={chartData.purchaseMonth}
                originalPrice={chartData.originalPrice}
                apartmentSize={chartData.apartmentSize}
                winner={chartData.winner}
              />
            </div>
          )}
          <button
            className="calculation-toggle"
            id="calculationToggle"
            aria-expanded={isExpanded}
            aria-controls="resultInfo"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <strong>Laskenta</strong>
            <span className={`toggle-arrow ${isExpanded ? 'expanded' : ''}`} aria-hidden="true">
              ▼
            </span>
          </button>
          <div
            className={`result-info ${isExpanded ? 'expanded' : ''}`}
            id="resultInfo"
            role="region"
            aria-label="Laskentadetaljit"
            aria-hidden={!isExpanded}
            ref={resultInfoRef}
            dangerouslySetInnerHTML={{
              __html: generateResultInfoHTML(results, parseFloat(originalPrice || '0'), purchaseYear, purchaseMonth, usedIndex || ''),
            }}
          />
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <a
          href="/info/"
          style={{
            color: '#667eea',
            textDecoration: 'none',
            fontWeight: 500,
            fontSize: '14px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            opacity: 0.85,
            transition: 'opacity 0.3s',
          }}
        >
          → Lue lisää Hitas-asunnoista ja hinnoittelusta
        </a>
      </div>
    </>
  )
}

function generateResultInfoHTML(
  results: CalculationResult,
  originalPrice: number,
  purchaseYear: number,
  purchaseMonth: number,
  usedIndex: string
): string {
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() + 1

  let html = `
    Alkuperäinen velaton hankintahinta: ${formatPrice(originalPrice)}<br>
    Valmistumispäivä: ${monthNames[purchaseMonth - 1]} ${purchaseYear}<br>
    <br>
  `

  // Show old market index calculation for pre-2011 apartments
  if (results.vanhatMarkkinahinta) {
    const vm = results.vanhatMarkkinahinta
    const basePrice = (originalPrice * vm.currentIndex.value) / vm.purchaseIndex
    const improvementsTotal = results.improvements ? results.improvements.totalIndexedValue : 0

    const vmIsOld =
      vm.currentIndex.year < currentYear ||
      (vm.currentIndex.year === currentYear && vm.currentIndex.month < currentMonth)

    html += `
      <strong>${usedIndex}:</strong> ✓ (käytetty) 
      <a href="/graphs/#old-indices-chart">(katso graafi →)</a><br>
      <div style="padding-left: 20px; margin-top: 8px;">
        <em>Ennen 1.1.2011 valmistuneille Hitas-asunnoille käytetään yhtä indeksiä</em><br>
        <br>
        Valmistumishetken indeksi: ${vm.purchaseIndex.toFixed(2)}<br>
        Nykyinen indeksi: ${vm.currentIndex.value.toFixed(2)} (${monthNames[vm.currentIndex.month - 1]} ${vm.currentIndex.year})<br>
        Kaava: ${vm.currentIndex.value.toFixed(2)} / ${vm.purchaseIndex.toFixed(2)} × ${formatPrice(originalPrice)}<br>
        Indeksipohjainen hinta: ${formatPrice(basePrice)}<br>
    `

    if (improvementsTotal > 0) {
      html += `+ Parannukset: ${formatPrice(improvementsTotal)}<br>`
    }

    html += `Tulos: ${formatPrice(vm.price)}<br></div>`

    if (vmIsOld) {
      html += `
        <div class="warning" style="margin-top: 10px; margin-bottom: 10px;">
          ⚠️ Huom: Laskettu ${monthNames[vm.currentIndex.month - 1]} ${vm.currentIndex.year} indeksin mukaan, 
          koska ${monthNames[currentMonth - 1]} ${currentYear} indeksiä ei ole vielä saatavilla.
        </div>
      `
    }
  }
  // Show both index calculations for post-2011 apartments
  else if (results.rakennuskustannus) {
    const rk = results.rakennuskustannus
    const isSelected = usedIndex === 'Rakennuskustannusindeksi'
    const basePrice = (originalPrice * rk.currentIndex.value) / rk.purchaseIndex
    const improvementsTotal = results.improvements ? results.improvements.totalIndexedValue : 0

    const rkIsOld =
      rk.currentIndex.year < currentYear ||
      (rk.currentIndex.year === currentYear && rk.currentIndex.month < currentMonth)

    html += `
      <strong>Rakennuskustannusindeksi:</strong> ${isSelected ? '✓ (käytetty)' : ''} 
      <a href="/graphs/#new-indices-chart">(katso graafi →)</a><br>
      <div style="padding-left: 20px; margin-top: 8px;">
        Valmistumishetken indeksi: ${rk.purchaseIndex.toFixed(2)}<br>
        Nykyinen indeksi: ${rk.currentIndex.value.toFixed(2)} (${monthNames[rk.currentIndex.month - 1]} ${rk.currentIndex.year})<br>
        Kaava: ${rk.currentIndex.value.toFixed(2)} / ${rk.purchaseIndex.toFixed(2)} × ${formatPrice(originalPrice)}<br>
        Indeksipohjainen hinta: ${formatPrice(basePrice)}<br>
    `

    if (improvementsTotal > 0) {
      html += `+ Parannukset: ${formatPrice(improvementsTotal)}<br>`
    }

    html += `Tulos: ${formatPrice(rk.price)}<br></div>`

    if (rkIsOld) {
      html += `
        <div class="warning" style="margin-top: 10px; margin-bottom: 10px;">
          ⚠️ Huom: Laskettu ${monthNames[rk.currentIndex.month - 1]} ${rk.currentIndex.year} indeksin mukaan, 
          koska ${monthNames[currentMonth - 1]} ${currentYear} indeksiä ei ole vielä saatavilla.
        </div>
      `
    }

    html += '<br>'
  }

  if (results.markkinahinta) {
    const mh = results.markkinahinta
    const isSelected = usedIndex === 'Markkinahintaindeksi'
    const basePrice = (originalPrice * mh.currentIndex.value) / mh.purchaseIndex
    const improvementsTotal = results.improvements ? results.improvements.totalIndexedValue : 0

    const mhIsOld =
      mh.currentIndex.year < currentYear ||
      (mh.currentIndex.year === currentYear && mh.currentIndex.month < currentMonth)

    html += `
      <strong>Markkinahintaindeksi:</strong> ${isSelected ? '✓ (käytetty)' : ''} 
      <a href="/graphs/#new-indices-chart">(katso graafi →)</a><br>
      <div style="padding-left: 20px; margin-top: 8px;">
        Valmistumishetken indeksi: ${mh.purchaseIndex.toFixed(2)}<br>
        Nykyinen indeksi: ${mh.currentIndex.value.toFixed(2)} (${monthNames[mh.currentIndex.month - 1]} ${mh.currentIndex.year})<br>
        Kaava: ${mh.currentIndex.value.toFixed(2)} / ${mh.purchaseIndex.toFixed(2)} × ${formatPrice(originalPrice)}<br>
        Indeksipohjainen hinta: ${formatPrice(basePrice)}<br>
    `

    if (improvementsTotal > 0) {
      html += `+ Parannukset: ${formatPrice(improvementsTotal)}<br>`
    }

    html += `Tulos: ${formatPrice(mh.price)}<br></div>`

    if (mhIsOld) {
      html += `
        <div class="warning" style="margin-top: 10px; margin-bottom: 10px;">
          ⚠️ Huom: Laskettu ${monthNames[mh.currentIndex.month - 1]} ${mh.currentIndex.year} indeksin mukaan, 
          koska ${monthNames[currentMonth - 1]} ${currentYear} indeksiä ei ole vielä saatavilla.
        </div>
      `
    }
  }

  // Show rajaneliöhinta calculation
  if (results.rajaneliohinta) {
    const rh = results.rajaneliohinta
    const isSelected = usedIndex === 'Rajaneliöhinta'

    html += `
      <br>
      <strong>Rajaneliöhinta:</strong> ${isSelected ? '✓ (käytetty)' : ''}<br>
      <div style="padding-left: 20px; margin-top: 8px;">
        <em>Kaikkien Hitas-yhtiöiden keskimääräinen neliöhinta</em><br>
        <a href="/graphs/#rajaneliohinta-chart" target="_blank" rel="noopener" style="font-size: 13px; margin-top: 4px; display: inline-block;">Katso graafi →</a><br>
        <br>
        Asunnon pinta-ala: ${rh.apartmentSize} m²<br>
        Rajaneliöhinta: ${formatPrice(rh.pricePerSqm)}/m² (voimassa ${rh.validFrom} - ${rh.validUntil})<br>
        Kaava: ${rh.apartmentSize} m² × ${formatPrice(rh.pricePerSqm)}/m²<br>
        Tulos: ${formatPrice(rh.price)}<br>
      </div>
    `
  }

  // Show improvements
  if (results.improvements && results.improvements.improvements.length > 0) {
    const improvementsData = results.improvements
    html += `
      <br>
      <strong>Parannukset:</strong><br>
      <div style="padding-left: 20px; margin-top: 8px;">
        <em>Parannukset lisätään vain indeksihintoihin, ei rajaneliöhintaan</em><br>
        <br>
    `

    improvementsData.improvements.forEach((imp: any, index: number) => {
      html += `
        <div class="improvement-detail-box">
          <strong>Parannus ${index + 1}</strong> (${monthNames[imp.improvementMonth - 1]} ${imp.improvementYear})<br>
          Parannuksen hinta: ${formatPrice(imp.originalPrice)}<br>
          Omavastuu (30 €/m²): ${formatPrice(imp.omavastuu)}<br>
      `

      if (imp.indexedValue > 0) {
        html += `
          Indeksitarkistettava summa: ${formatPrice(imp.indexedAmount)}<br>
          Käytetty indeksi: ${imp.usedIndex.name}<br>
          Indeksitarkistettu arvo: ${formatPrice(imp.indexedValue)}<br>
        `
      } else {
        html += `<em>Ei indeksitarkistusta (hinta ≤ omavastuu)</em><br>`
      }

      html += `</div>`
    })

    html += `
        <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(0,0,0,0.1);">
          <strong>Parannusten yhteensä indeksitarkistettu arvo: ${formatPrice(improvementsData.totalIndexedValue)}</strong><br>
          <em>Tämä summa on lisätty kaikkiin indeksihintoihin</em>
        </div>
      </div>
    `
  }

  return html.trim()
}
