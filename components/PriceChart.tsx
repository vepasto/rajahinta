'use client'

import { useEffect, useRef } from 'react'
import { indicesState } from '@/lib/calculator-indices'
import { formatPrice, formatPriceCompact } from '@/lib/calculator'
import { setOnThemeChange } from '@/lib/theme'

declare global {
  interface Window {
    Chart: any
  }
}

interface PriceChartProps {
  purchaseYear: number
  purchaseMonth: number
  originalPrice: number
  apartmentSize: number | null
  winner: any
}

export function PriceChart({
  purchaseYear,
  purchaseMonth,
  originalPrice,
  apartmentSize,
  winner,
}: PriceChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstanceRef = useRef<any>(null)
  const modalChartRef = useRef<HTMLCanvasElement>(null)
  const modalChartInstanceRef = useRef<any>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.Chart || !chartRef.current) {
      return
    }

    createChart()

    // Set up theme change callback
    const themeCallback = () => {
      setTimeout(() => {
        createChart()
      }, 100)
    }
    setOnThemeChange(themeCallback)

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy()
      }
      if (modalChartInstanceRef.current) {
        modalChartInstanceRef.current.destroy()
      }
    }
  }, [purchaseYear, purchaseMonth, originalPrice, apartmentSize, winner])

  function createChart() {
    if (!chartRef.current || !window.Chart || !indicesState.indicesData) {
      return
    }

    // Destroy existing chart
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy()
      chartInstanceRef.current = null
    }

    const isDark =
      document.body.classList.contains('dark-mode') ||
      (!document.body.classList.contains('light-mode') &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)

    const textColor = isDark ? '#d0d0d0' : '#333'
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.15)'
    const isMobile = window.innerWidth <= 768
    const aspectRatio = isMobile ? 0.8 : 1.2

    // Helper function to convert index object to sorted data points
    function getDataPoints(indexDataObj: any, purchaseIndex: number) {
      const currentDate = new Date()
      const currentYear = currentDate.getFullYear()
      const currentMonth = currentDate.getMonth() + 1

      const dataPoints: Array<{ year: number; month: number; value: number; price: number }> = []
      for (const [year, months] of Object.entries(indexDataObj)) {
        for (const [month, value] of Object.entries(months as any)) {
          const y = parseInt(year)
          const m = parseInt(month)

          const isAfterPurchase = y > purchaseYear || (y === purchaseYear && m >= purchaseMonth)
          const isNotFuture = y < currentYear || (y === currentYear && m <= currentMonth)

          if (isAfterPurchase && isNotFuture) {
            dataPoints.push({
              year: y,
              month: m,
              value: value as number,
              price: ((value as number) / purchaseIndex) * originalPrice,
            })
          }
        }
      }
      dataPoints.sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year
        return a.month - b.month
      })
      return dataPoints
    }

    const datasets: any[] = []
    let labels: string[] = []

    // For post-2011 apartments, show both indices
    if (purchaseYear >= 2011) {
      const rkPurchaseIndex = indicesState.rakennuskustannusindeksi[purchaseYear]?.[purchaseMonth]
      const mhPurchaseIndex = indicesState.markkinahintaindeksi[purchaseYear]?.[purchaseMonth]

      if (rkPurchaseIndex && mhPurchaseIndex) {
        const rkDataPoints = getDataPoints(indicesState.indicesData.rakennuskustannusindeksi, rkPurchaseIndex)
        const mhDataPoints = getDataPoints(indicesState.indicesData.markkinahintaindeksi, mhPurchaseIndex)

        if (rkDataPoints.length > 0 && mhDataPoints.length > 0) {
          const allLabels = new Set<string>()
          rkDataPoints.forEach((dp) => allLabels.add(`${dp.month}/${dp.year}`))
          mhDataPoints.forEach((dp) => allLabels.add(`${dp.month}/${dp.year}`))

          const rkMap = new Map(rkDataPoints.map((dp) => [`${dp.month}/${dp.year}`, dp.price]))
          const mhMap = new Map(mhDataPoints.map((dp) => [`${dp.month}/${dp.year}`, dp.price]))

          labels = Array.from(allLabels).sort((a, b) => {
            const [m1, y1] = a.split('/').map(Number)
            const [m2, y2] = b.split('/').map(Number)
            if (y1 !== y2) return y1 - y2
            return m1 - m2
          })

          labels.unshift(`${purchaseMonth}/${purchaseYear}`)

          const rkColor = isDark ? '#9ca3ff' : '#667eea'
          const mhColor = isDark ? '#ff9cba' : '#e74c3c'

          datasets.push({
            label: 'Rakennuskustannusindeksi',
            data: [originalPrice, ...labels.slice(1).map((l) => rkMap.get(l) || null)],
            borderColor: rkColor,
            backgroundColor: isDark ? 'rgba(156, 163, 255, 0.1)' : 'rgba(102, 126, 234, 0.1)',
            borderWidth: 2,
            fill: false,
            tension: 0.1,
            pointRadius: 0,
            pointHoverRadius: 5,
            spanGaps: true,
            hidden: winner && winner.type !== 'rakennuskustannus',
          })

          datasets.push({
            label: 'Markkinahintaindeksi',
            data: [originalPrice, ...labels.slice(1).map((l) => mhMap.get(l) || null)],
            borderColor: mhColor,
            backgroundColor: isDark ? 'rgba(255, 156, 186, 0.1)' : 'rgba(231, 76, 60, 0.1)',
            borderWidth: 2,
            fill: false,
            tension: 0.1,
            pointRadius: 0,
            pointHoverRadius: 5,
            spanGaps: true,
            hidden: winner && winner.type !== 'markkinahinta',
          })
        }
      }
    } else {
      // For pre-2011 apartments, show only old market index
      const vmPurchaseIndex = indicesState.vanhatMarkkinahintaindeksi[purchaseYear]?.[purchaseMonth]

      if (vmPurchaseIndex && indicesState.indicesData.vanhat_markkinahintaindeksi) {
        const vmDataPoints = getDataPoints(indicesState.indicesData.vanhat_markkinahintaindeksi, vmPurchaseIndex)

        if (vmDataPoints.length > 0) {
          labels = vmDataPoints.map((dp) => `${dp.month}/${dp.year}`)
          const prices = vmDataPoints.map((dp) => dp.price)

          labels.unshift(`${purchaseMonth}/${purchaseYear}`)
          prices.unshift(originalPrice)

          const lineColor = isDark ? '#9ca3ff' : '#667eea'

          datasets.push({
            label: 'Vanhojen osakeasuntojen hintaindeksi',
            data: prices,
            borderColor: lineColor,
            backgroundColor: isDark ? 'rgba(156, 163, 255, 0.1)' : 'rgba(102, 126, 234, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.1,
            pointRadius: 0,
            pointHoverRadius: 5,
            hidden: winner && winner.type !== 'vanhatMarkkinahinta',
          })
        }
      }
    }

    // Add rajaneliöhinta line if apartment size is available
    if (
      apartmentSize &&
      indicesState.indicesData &&
      indicesState.indicesData.rajaneliohinta_tilasto &&
      typeof indicesState.indicesData.rajaneliohinta_tilasto === 'object'
    ) {
      try {
        const currentDate = new Date()
        const currentYear = currentDate.getFullYear()
        const currentMonth = currentDate.getMonth() + 1

        let lastRajahintaBeforePurchase: any = null
        const rajahintaYears = Object.keys(indicesState.indicesData.rajaneliohinta_tilasto)
          .map(Number)
          .filter((y) => !isNaN(y))
          .sort((a, b) => b - a)

        for (const year of rajahintaYears) {
          if (
            !indicesState.indicesData.rajaneliohinta_tilasto[year] ||
            typeof indicesState.indicesData.rajaneliohinta_tilasto[year] !== 'object'
          ) {
            continue
          }

          const months = Object.keys(indicesState.indicesData.rajaneliohinta_tilasto[year])
            .map(Number)
            .filter((m) => !isNaN(m) && m >= 1 && m <= 12)
            .sort((a, b) => b - a)

          for (const month of months) {
            const pricePerSqm = indicesState.indicesData.rajaneliohinta_tilasto[year][month]
            if (typeof pricePerSqm === 'number' && !isNaN(pricePerSqm)) {
              const isBeforePurchase = year < purchaseYear || (year === purchaseYear && month < purchaseMonth)

              if (isBeforePurchase) {
                lastRajahintaBeforePurchase = {
                  year: year,
                  month: month,
                  pricePerSqm: pricePerSqm,
                  price: apartmentSize * pricePerSqm,
                }
                break
              }
            }
          }
          if (lastRajahintaBeforePurchase) break
        }

        const rajahintaDataPoints: Array<{ year: number; month: number; price: number }> = []

        if (lastRajahintaBeforePurchase) {
          rajahintaDataPoints.push({
            year: purchaseYear,
            month: purchaseMonth,
            price: lastRajahintaBeforePurchase.price,
          })
        }

        for (const year of rajahintaYears.slice().reverse()) {
          if (
            !indicesState.indicesData.rajaneliohinta_tilasto[year] ||
            typeof indicesState.indicesData.rajaneliohinta_tilasto[year] !== 'object'
          ) {
            continue
          }

          const months = Object.keys(indicesState.indicesData.rajaneliohinta_tilasto[year])
            .map(Number)
            .filter((m) => !isNaN(m) && m >= 1 && m <= 12)
            .sort((a, b) => a - b)

          for (const month of months) {
            const pricePerSqm = indicesState.indicesData.rajaneliohinta_tilasto[year][month]
            if (typeof pricePerSqm === 'number' && !isNaN(pricePerSqm)) {
              const isAfterPurchase = year > purchaseYear || (year === purchaseYear && month >= purchaseMonth)
              const isNotFuture = year < currentYear || (year === currentYear && month <= currentMonth)

              if (isAfterPurchase && isNotFuture) {
                rajahintaDataPoints.push({
                  year: year,
                  month: month,
                  price: apartmentSize * pricePerSqm,
                })
              }
            }
          }
        }

        rajahintaDataPoints.sort((a, b) => {
          if (a.year !== b.year) return a.year - b.year
          return a.month - b.month
        })

        if (rajahintaDataPoints.length > 0) {
          const originalLabels = [...labels]
          const originalDatasets = datasets.map((ds) => ({
            data: [...ds.data],
            label: ds.label,
          }))

          const rajahintaLabels = rajahintaDataPoints.map((dp) => `${dp.month}/${dp.year}`)

          const allLabelsSet = new Set(labels)
          rajahintaLabels.forEach((l) => allLabelsSet.add(l))

          const allLabelsArray = Array.from(allLabelsSet).sort((a, b) => {
            const [m1, y1] = a.split('/').map(Number)
            const [m2, y2] = b.split('/').map(Number)
            if (y1 !== y2) return y1 - y2
            return m1 - m2
          })

          const rajahintaMap = new Map(rajahintaDataPoints.map((dp) => [`${dp.month}/${dp.year}`, dp.price]))

          const rajahintaPrices = allLabelsArray.map((l) => rajahintaMap.get(l) || null)

          labels = allLabelsArray

          datasets.forEach((dataset, index) => {
            const originalData = originalDatasets[index].data
            const newData = allLabelsArray.map((l) => {
              const oldIndex = originalLabels.indexOf(l)
              return oldIndex >= 0 ? originalData[oldIndex] : null
            })
            dataset.data = newData
          })

          const rajahintaColor = isDark ? '#ffa94d' : '#ff8c00'

          datasets.push({
            label: 'Rajaneliöhinta',
            data: rajahintaPrices,
            borderColor: rajahintaColor,
            backgroundColor: isDark ? 'rgba(255, 169, 77, 0.1)' : 'rgba(255, 140, 0, 0.1)',
            borderWidth: 2,
            fill: false,
            tension: 0.1,
            pointRadius: 0,
            pointHoverRadius: 5,
            spanGaps: true,
            borderDash: [5, 5],
            hidden: winner && winner.type !== 'rajaneliohinta',
          })
        }
      } catch (error) {
        console.error('Error adding rajaneliöhinta to chart:', error)
      }
    }

    if (datasets.length === 0 || labels.length === 0) {
      return
    }

    const ctx = chartRef.current.getContext('2d')
    chartInstanceRef.current = new window.Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: aspectRatio,
        plugins: {
          legend: {
            display: datasets.length > 1,
            position: 'top',
            labels: {
              color: textColor,
              usePointStyle: true,
              padding: 15,
              font: {
                size: 12,
              },
            },
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: function (context: any) {
                return formatPrice(context.parsed.y)
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
                return formatPriceCompact(value)
              },
            },
            grid: {
              color: gridColor,
            },
          },
        },
      },
    })
  }

  function openModal() {
    if (!modalRef.current || !chartInstanceRef.current) return

    // Destroy existing modal chart
    if (modalChartInstanceRef.current) {
      modalChartInstanceRef.current.destroy()
      modalChartInstanceRef.current = null
    }

    // Remove old canvas
    const oldCanvas = document.getElementById('priceChartModal')
    if (oldCanvas) {
      oldCanvas.remove()
    }

    // Create new canvas
    const modalCanvas = document.createElement('canvas')
    modalCanvas.id = 'priceChartModal'
    const modalChartContainer = modalRef.current.querySelector('.chart-modal-chart-container')
    if (modalChartContainer) {
      modalChartContainer.appendChild(modalCanvas)
    }

    modalRef.current.style.display = 'flex'
    document.body.classList.add('modal-open')
    document.body.style.overflow = 'hidden'

    // Request fullscreen
    if (modalRef.current.requestFullscreen) {
      modalRef.current.requestFullscreen().catch((err: any) => {
        console.log('Fullscreen request failed:', err)
      })
    }

    // Clone chart data
    const chartData = chartInstanceRef.current.data
    const clonedLabels = [...chartData.labels]
    const clonedDatasets = chartData.datasets.map((dataset: any) => ({
      ...dataset,
      data: [...dataset.data],
      hidden: false,
    }))

    const isDark =
      document.body.classList.contains('dark-mode') ||
      (!document.body.classList.contains('light-mode') &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)

    const textColor = isDark ? '#d0d0d0' : '#333'
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.15)'

    const ctx = modalCanvas.getContext('2d')
    modalChartInstanceRef.current = new window.Chart(ctx, {
      type: 'line',
      data: {
        labels: clonedLabels,
        datasets: clonedDatasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 0.7,
        plugins: {
          legend: {
            display: chartData.datasets.length > 1,
            position: 'top',
            labels: {
              color: textColor,
              usePointStyle: true,
              padding: 15,
              font: {
                size: 14,
              },
            },
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: function (context: any) {
                return formatPrice(context.parsed.y)
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
              maxTicksLimit: 30,
              font: {
                size: 12,
              },
            },
            grid: {
              color: gridColor,
            },
          },
          y: {
            ticks: {
              color: textColor,
              callback: function (value: any) {
                return formatPriceCompact(value)
              },
              font: {
                size: 12,
              },
            },
            grid: {
              color: gridColor,
            },
          },
        },
      },
    })
  }

  function closeModal() {
    if (!modalRef.current) return

    // Exit fullscreen
    if (document.fullscreenElement) {
      document.exitFullscreen()
    }

    // Destroy modal chart
    if (modalChartInstanceRef.current) {
      modalChartInstanceRef.current.destroy()
      modalChartInstanceRef.current = null
    }

    // Remove canvas
    const modalCanvas = document.getElementById('priceChartModal')
    if (modalCanvas) {
      modalCanvas.remove()
    }

    // Hide modal
    modalRef.current.style.display = 'none'
    document.body.classList.remove('modal-open')
    document.body.style.overflow = ''
  }

  useEffect(() => {
    const fullscreenBtn = document.getElementById('fullscreenChartBtn')
    const closeModalBtn = document.getElementById('closeChartModal')

    if (fullscreenBtn) {
      fullscreenBtn.addEventListener('click', openModal)
    }
    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', closeModal)
    }

    // Close on ESC
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && modalRef.current && modalRef.current.style.display === 'flex') {
        closeModal()
      }
    }
    document.addEventListener('keydown', handleEsc)

    // Close on outside click
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && e.target === modalRef.current) {
        closeModal()
      }
    }
    if (modalRef.current) {
      modalRef.current.addEventListener('click', handleClickOutside)
    }

    return () => {
      if (fullscreenBtn) {
        fullscreenBtn.removeEventListener('click', openModal)
      }
      if (closeModalBtn) {
        closeModalBtn.removeEventListener('click', closeModal)
      }
      document.removeEventListener('keydown', handleEsc)
      if (modalRef.current) {
        modalRef.current.removeEventListener('click', handleClickOutside)
      }
    }
  }, [])

  return (
    <>
      <div className="price-chart-container" id="priceChartContainer">
        <button
          className="fullscreen-chart-btn"
          id="fullscreenChartBtn"
          aria-label="Avaa graafi täysikokoisena"
          title="Avaa graafi täysikokoisena"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
          </svg>
        </button>
        <canvas id="priceChart" ref={chartRef}></canvas>
      </div>

      <div className="chart-modal" id="chartModal" ref={modalRef} style={{ display: 'none' }}>
        <div className="chart-modal-content">
          <button className="close-chart-modal" id="closeChartModal" aria-label="Sulje graafi">
            ×
          </button>
          <div className="chart-modal-chart-container"></div>
        </div>
      </div>
    </>
  )
}



