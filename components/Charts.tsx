'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  BarElement,
  BarController,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { loadIndicesData } from '@/lib/indices'
import { setOnThemeChange } from '@/lib/theme'
import { ChartSection } from './ChartSection'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  BarElement,
  BarController,
  Title,
  Tooltip,
  Legend
)

export function Charts() {
  const newChartRef = useRef<HTMLCanvasElement>(null)
  const oldChartRef = useRef<HTMLCanvasElement>(null)
  const rajaneliohintaChartRef = useRef<HTMLCanvasElement>(null)
  const chartInstancesRef = useRef<{
    new: any
    old: any
    rajaneliohinta: any
  }>({
    new: null,
    old: null,
    rajaneliohinta: null,
  })
  const [chartInstances, setChartInstances] = useState<{
    new: any
    old: any
    rajaneliohinta: any
  }>({
    new: null,
    old: null,
    rajaneliohinta: null,
  })

  const loadCharts = async () => {

    try {
      // Destroy existing charts
      if (chartInstancesRef.current.new) {
        chartInstancesRef.current.new.destroy()
        chartInstancesRef.current.new = null
      }
      if (chartInstancesRef.current.old) {
        chartInstancesRef.current.old.destroy()
        chartInstancesRef.current.old = null
      }
      if (chartInstancesRef.current.rajaneliohinta) {
        chartInstancesRef.current.rajaneliohinta.destroy()
        chartInstancesRef.current.rajaneliohinta = null
      }
      setChartInstances({ new: null, old: null, rajaneliohinta: null })

      const data = await loadIndicesData('/data/')

      if (!data.rakennuskustannusindeksi || typeof data.rakennuskustannusindeksi !== 'object') {
        throw new Error('Invalid data: rakennuskustannusindeksi is missing or invalid')
      }

      if (!data.markkinahintaindeksi || typeof data.markkinahintaindeksi !== 'object') {
        throw new Error('Invalid data: markkinahintaindeksi is missing or invalid')
      }

      const isDark =
        document.body.classList.contains('dark-mode') ||
        (!document.body.classList.contains('light-mode') &&
          window.matchMedia('(prefers-color-scheme: dark)').matches)

      const textColor = isDark ? '#e0e0e0' : '#333'
      const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.15)'

      const isMobile = window.innerWidth <= 768
      const aspectRatio = isMobile ? 1.2 : 2

      // Chart 1: New indices (2011 onwards)
      const newLabels: string[] = []
      const rakennuskustannus: number[] = []
      const markkinahinta: (number | null)[] = []

      try {
        const newYears = Object.keys(data.rakennuskustannusindeksi)
          .map(Number)
          .filter((y) => !isNaN(y))
          .sort((a, b) => a - b)

        for (const year of newYears) {
          if (!data.rakennuskustannusindeksi[year] || typeof data.rakennuskustannusindeksi[year] !== 'object') {
            continue
          }

          const months = Object.keys(data.rakennuskustannusindeksi[year])
            .map(Number)
            .filter((m) => !isNaN(m) && m >= 1 && m <= 12)
            .sort((a, b) => a - b)

          for (const month of months) {
            const rkValue = data.rakennuskustannusindeksi[year][month]
            const mhValue = data.markkinahintaindeksi[year]?.[month]

            if (typeof rkValue === 'number' && !isNaN(rkValue)) {
              newLabels.push(`${year}-${String(month).padStart(2, '0')}`)
              rakennuskustannus.push(rkValue)
              markkinahinta.push(typeof mhValue === 'number' && !isNaN(mhValue) ? mhValue : null)
            }
          }
        }
      } catch (error) {
        console.error('Error parsing new indices data:', error)
        throw new Error('Failed to parse indices data')
      }

      if (newChartRef.current) {
        const ctxNew = newChartRef.current.getContext('2d')
        if (!ctxNew) return
        const newChartInstance = new ChartJS(ctxNew, {
          type: 'line',
          data: {
            labels: newLabels,
            datasets: [
              {
                label: 'Rakennuskustannusindeksi',
                data: rakennuskustannus,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderWidth: 2,
                tension: 0.1,
                pointRadius: 0,
              },
              {
                label: 'Markkinahintaindeksi',
                data: markkinahinta,
                borderColor: '#51cf66',
                backgroundColor: 'rgba(81, 207, 102, 0.1)',
                borderWidth: 2,
                tension: 0.1,
                pointRadius: 0,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            aspectRatio: aspectRatio,
            plugins: {
              legend: {
                display: true,
                position: 'top',
                labels: {
                  color: textColor,
                  font: {
                    size: 12,
                  },
                  padding: 15,
                },
              },
              tooltip: {
                mode: 'index',
                intersect: false,
                callbacks: {
                  label: function (context: any) {
                    return context.dataset.label + ': ' + context.parsed.y.toFixed(2)
                  },
                },
              },
            },
            scales: {
              x: {
                ticks: {
                  color: textColor,
                  maxRotation: 45,
                  minRotation: 45,
                  autoSkip: true,
                  maxTicksLimit: 20,
                },
                grid: {
                  color: gridColor,
                },
              },
              y: {
                ticks: {
                  color: textColor,
                },
                grid: {
                  color: gridColor,
                },
                beginAtZero: false,
              },
            },
          },
        })
        chartInstancesRef.current.new = newChartInstance
        setChartInstances((prev) => ({ ...prev, new: newChartInstance }))
      }

      // Chart 2: Old market index (before 2011)
      const oldLabels: string[] = []
      const vanhatMarkkinahinta: number[] = []

      if (data.vanhat_markkinahintaindeksi && typeof data.vanhat_markkinahintaindeksi === 'object') {
        try {
          const oldYears = Object.keys(data.vanhat_markkinahintaindeksi)
            .map(Number)
            .filter((y) => !isNaN(y))
            .sort((a, b) => a - b)

          for (const year of oldYears) {
            if (!data.vanhat_markkinahintaindeksi[year] || typeof data.vanhat_markkinahintaindeksi[year] !== 'object') {
              continue
            }

            const months = Object.keys(data.vanhat_markkinahintaindeksi[year])
              .map(Number)
              .filter((m) => !isNaN(m) && m >= 1 && m <= 12)
              .sort((a, b) => a - b)

            for (const month of months) {
              const value = data.vanhat_markkinahintaindeksi[year][month]
              if (typeof value === 'number' && !isNaN(value)) {
                oldLabels.push(`${year}-${String(month).padStart(2, '0')}`)
                vanhatMarkkinahinta.push(value)
              }
            }
          }
        } catch (error) {
          console.error('Error parsing old indices data:', error)
        }
      }

      if (oldChartRef.current) {
        const ctxOld = oldChartRef.current.getContext('2d')
        if (!ctxOld) return
        const oldChartInstance = new ChartJS(ctxOld, {
          type: 'line',
          data: {
            labels: oldLabels,
            datasets: [
              {
                label: 'Vanhat markkinahintaindeksi',
                data: vanhatMarkkinahinta,
                borderColor: '#ff6b6b',
                backgroundColor: 'rgba(255, 107, 107, 0.1)',
                borderWidth: 2,
                tension: 0.1,
                pointRadius: 0,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            aspectRatio: aspectRatio,
            plugins: {
              legend: {
                display: true,
                position: 'top',
                labels: {
                  color: textColor,
                  font: {
                    size: 12,
                  },
                  padding: 15,
                },
              },
              tooltip: {
                mode: 'index',
                intersect: false,
                callbacks: {
                  label: function (context: any) {
                    return context.dataset.label + ': ' + context.parsed.y.toFixed(2)
                  },
                },
              },
            },
            scales: {
              x: {
                ticks: {
                  color: textColor,
                  maxRotation: 45,
                  minRotation: 45,
                  autoSkip: true,
                  maxTicksLimit: 20,
                },
                grid: {
                  color: gridColor,
                },
              },
              y: {
                ticks: {
                  color: textColor,
                },
                grid: {
                  color: gridColor,
                },
                beginAtZero: false,
              },
            },
          },
        })
        chartInstancesRef.current.old = oldChartInstance
        setChartInstances((prev) => ({ ...prev, old: oldChartInstance }))
      }

      // Chart 3: Rajaneliöhinta
      const rajaneliohintaLabels: string[] = []
      const rajaneliohinta: number[] = []

      if (data.rajaneliohinta_tilasto && typeof data.rajaneliohinta_tilasto === 'object') {
        try {
          const rajahintaYears = Object.keys(data.rajaneliohinta_tilasto)
            .map(Number)
            .filter((y) => !isNaN(y))
            .sort((a, b) => a - b)

          for (const year of rajahintaYears) {
            if (!data.rajaneliohinta_tilasto[year] || typeof data.rajaneliohinta_tilasto[year] !== 'object') {
              continue
            }

            const months = Object.keys(data.rajaneliohinta_tilasto[year])
              .map(Number)
              .filter((m) => !isNaN(m) && m >= 1 && m <= 12)
              .sort((a, b) => a - b)

            for (const month of months) {
              const value = data.rajaneliohinta_tilasto[year][month]
              if (typeof value === 'number' && !isNaN(value)) {
                rajaneliohintaLabels.push(`${year}-${String(month).padStart(2, '0')}`)
                rajaneliohinta.push(value)
              }
            }
          }
        } catch (error) {
          console.error('Error parsing rajaneliohinta_tilasto data:', error)
        }
      }

      if (rajaneliohintaChartRef.current) {
        const ctxRajahinta = rajaneliohintaChartRef.current.getContext('2d')
        if (!ctxRajahinta) return
        const rajaneliohintaChartInstance = new ChartJS(ctxRajahinta, {
          type: 'line',
          data: {
            labels: rajaneliohintaLabels,
            datasets: [
              {
                label: 'Rajaneliöhinta (€/m²)',
                data: rajaneliohinta,
                borderColor: '#ffa94d',
                backgroundColor: 'rgba(255, 169, 77, 0.1)',
                borderWidth: 2,
                tension: 0.1,
                pointRadius: 0,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            aspectRatio: aspectRatio,
            plugins: {
              legend: {
                display: true,
                position: 'top',
                labels: {
                  color: textColor,
                  font: {
                    size: 12,
                  },
                  padding: 15,
                },
              },
              tooltip: {
                mode: 'index',
                intersect: false,
                callbacks: {
                  label: function (context: any) {
                    return context.dataset.label + ': ' + context.parsed.y.toFixed(0) + ' €/m²'
                  },
                },
              },
            },
            scales: {
              x: {
                ticks: {
                  color: textColor,
                  maxRotation: 45,
                  minRotation: 45,
                  autoSkip: true,
                  maxTicksLimit: 20,
                },
                grid: {
                  color: gridColor,
                },
              },
              y: {
                ticks: {
                  color: textColor,
                  callback: function (value: any) {
                    return value.toFixed(0) + ' €/m²'
                  },
                },
                grid: {
                  color: gridColor,
                },
                beginAtZero: false,
              },
            },
          },
        })
        chartInstancesRef.current.rajaneliohinta = rajaneliohintaChartInstance
        setChartInstances((prev) => ({ ...prev, rajaneliohinta: rajaneliohintaChartInstance }))
      }
    } catch (error) {
      console.error('Error loading chart data:', error)
    }
    return Promise.resolve()
  }

  const scrollToHash = () => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.substring(1) // Remove the #
      const element = document.getElementById(hash)
      if (element) {
        // Small delay to ensure everything is rendered
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 100)
      }
    }
  }

  useEffect(() => {
    // Load charts immediately since Chart.js is now imported
    loadCharts().then(() => {
      // After charts are loaded, check if there's a hash in the URL and scroll to it
      scrollToHash()
    })

    // Listen for hash changes (e.g., when clicking links)
    const handleHashChange = () => {
      scrollToHash()
    }
    window.addEventListener('hashchange', handleHashChange)

    // Set up theme change callback
    setOnThemeChange(() => {
      setTimeout(loadCharts, 100)
    })

    return () => {
      window.removeEventListener('hashchange', handleHashChange)
      // Cleanup charts
      if (chartInstancesRef.current.new) {
        chartInstancesRef.current.new.destroy()
      }
      if (chartInstancesRef.current.old) {
        chartInstancesRef.current.old.destroy()
      }
      if (chartInstancesRef.current.rajaneliohinta) {
        chartInstancesRef.current.rajaneliohinta.destroy()
      }
    }
  }, [])

  return (
    <>
      <ChartSection
        title="Indeksien kehitys (asunnot valmistuneet 2011 jälkeen)"
        description={
          <>
            <strong>Vuodesta 2011 alkaen valmistuneille asunnoille</strong> käytetään kahta indeksiä:
            <ul style={{ marginTop: '8px', marginLeft: '20px' }}>
              <li>
                <strong>Rakennuskustannusindeksi</strong> (sininen) - Mittaa rakentamisen kustannusten
                kehitystä
              </li>
              <li>
                <strong>Markkinahintaindeksi</strong> (vihreä) - Perustuu asuntojen markkinahintoihin
              </li>
            </ul>
            Enimmäishinta lasketaan molemmilla indekseillä ja käytetään korkeampaa arvoa.
          </>
        }
        chartRef={newChartRef}
        chartInstance={chartInstances.new}
        chartId="newIndicesChart"
        buttonId="fullscreenNewChartBtn"
        modalId="newChartModal"
        chartType="line"
        aspectRatio={1.2}
        placeholderImage="/chart-placeholders/new-indices-chart.png"
      />

      <ChartSection
        title="Indeksien kehitys (asunnot valmistuneet ennen 2011)"
        description={
          <>
            <strong>Ennen vuotta 2011 valmistuneille asunnoille</strong> käytetään yhtä indeksiä:
            <ul style={{ marginTop: '8px', marginLeft: '20px' }}>
              <li>
                <strong>Vanhat markkinahintaindeksi</strong> (punainen) - Aikaisempi markkinahintaindeksi
              </li>
            </ul>
            Tätä indeksiä sovelletaan kaikkiin ennen 1.1.2011 valmistuneisiin Hitas-asuntoihin.
          </>
        }
        chartRef={oldChartRef}
        chartInstance={chartInstances.old}
        chartId="oldIndicesChart"
        buttonId="fullscreenOldChartBtn"
        modalId="oldChartModal"
        chartType="line"
        aspectRatio={1.2}
        placeholderImage="/chart-placeholders/old-indices-chart.png"
      />

      <ChartSection
        title="Rajaneliöhinta"
        description={
          <>
            <strong>Rajaneliöhinta</strong> on neliömetrihinta, jota käytetään asunnon enimmäishinnan
            laskennassa.
            <ul style={{ marginTop: '8px', marginLeft: '20px' }}>
              <li>Rajaneliöhinta määritetään neljännesvuosittain (helmikuu, toukokuu, elokuu, marraskuu)</li>
              <li>Rajaneliöhinta kerrotaan asunnon pinta-alalla saadakseen rajahinnan</li>
              <li>Rajahinta on yksi neljästä mahdollisesta enimmäishinnasta</li>
            </ul>
            <a
              href="https://www.hel.fi/static/kv/asunto-osasto/hitas-rajahintatilasto.pdf"
              className="external-link"
              target="_blank"
              rel="noopener"
              style={{ marginTop: '8px', display: 'inline-block', color: '#667eea', textDecoration: 'underline' }}
            >
              Lisätietoja Helsingin kaupungin sivuilta →
            </a>
          </>
        }
        chartRef={rajaneliohintaChartRef}
        chartInstance={chartInstances.rajaneliohinta}
        chartId="rajaneliohintaChart"
        buttonId="fullscreenRajaneliohintaChartBtn"
        modalId="rajaneliohintaChartModal"
        chartType="line"
        aspectRatio={1.2}
        placeholderImage="/chart-placeholders/rajaneliohinta-chart.png"
      />
    </>
  )
}

