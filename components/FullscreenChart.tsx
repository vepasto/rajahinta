'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
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
import styles from './FullscreenChart.module.css'

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

interface FullscreenChartProps {
  chartInstance: any // Chart.js instance
  chartType?: 'line' | 'bar'
  aspectRatio?: number
  buttonId?: string
  modalId?: string
}

export function FullscreenChart({
  chartInstance,
  chartType = 'line',
  aspectRatio = 0.7,
  buttonId,
  modalId,
}: FullscreenChartProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const modalChartInstanceRef = useRef<any>(null)
  const [isOpen, setIsOpen] = useState(false)
  const chartInstanceRef = useRef(chartInstance)

  // Update ref when chartInstance changes
  useEffect(() => {
    chartInstanceRef.current = chartInstance
  }, [chartInstance])

  const openModal = useCallback(() => {
    if (!modalRef.current || !chartInstanceRef.current) return

    // Destroy existing modal chart
    if (modalChartInstanceRef.current) {
      modalChartInstanceRef.current.destroy()
      modalChartInstanceRef.current = null
    }

    // Remove old canvas
    const oldCanvas = modalRef.current.querySelector('canvas')
    if (oldCanvas) {
      oldCanvas.remove()
    }

    // Create new canvas
    const modalCanvas = document.createElement('canvas')
    const modalChartContainer = modalRef.current.querySelector(`.${styles.chartContainer}`)
    if (modalChartContainer) {
      modalChartContainer.appendChild(modalCanvas)
    }

    modalRef.current.style.display = 'flex'
    document.body.classList.add('modal-open')
    document.body.style.overflow = 'hidden'
    setIsOpen(true)

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
    if (!ctx) return

    // Get original chart options
    const originalOptions = chartInstanceRef.current.options

    modalChartInstanceRef.current = new ChartJS(ctx, {
      type: chartType,
      data: {
        labels: clonedLabels,
        datasets: clonedDatasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: aspectRatio,
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
          tooltip: originalOptions?.plugins?.tooltip || {},
        },
        scales: {
          x: {
            ticks: {
              color: textColor,
              maxRotation: originalOptions?.scales?.x?.ticks?.maxRotation || 45,
              minRotation: originalOptions?.scales?.x?.ticks?.minRotation || 45,
              autoSkip: true,
              maxTicksLimit: originalOptions?.scales?.x?.ticks?.maxTicksLimit || 20,
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
              callback: originalOptions?.scales?.y?.ticks?.callback,
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
  }, [])

  const closeModal = useCallback(() => {
    if (!modalRef.current) return

    // Destroy modal chart
    if (modalChartInstanceRef.current) {
      modalChartInstanceRef.current.destroy()
      modalChartInstanceRef.current = null
    }

    // Exit fullscreen
    if (document.fullscreenElement) {
      document.exitFullscreen()
    }

    modalRef.current.style.display = 'none'
    document.body.classList.remove('modal-open')
    document.body.style.overflow = ''
    setIsOpen(false)
  }, [])

  useEffect(() => {
    // Wait a bit for button to be rendered
    const setupButton = () => {
      const button = buttonId ? document.getElementById(buttonId) : null
      const closeModalBtn = modalRef.current?.querySelector(`.${styles.closeButton}`)

      if (button) {
        button.addEventListener('click', openModal)
      }

      if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal)
      }

      return { button, closeModalBtn }
    }

    // Try immediately and also after a short delay to ensure button exists
    let { button, closeModalBtn } = setupButton()
    const timeoutId = setTimeout(() => {
      const result = setupButton()
      button = result.button
      closeModalBtn = result.closeModalBtn
    }, 100)

    // Close on ESC
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
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

    // Handle fullscreen change
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isOpen) {
        closeModal()
      }
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)

    return () => {
      clearTimeout(timeoutId)
      if (button) {
        button.removeEventListener('click', openModal)
      }
      if (closeModalBtn) {
        closeModalBtn.removeEventListener('click', closeModal)
      }
      document.removeEventListener('keydown', handleEsc)
      if (modalRef.current) {
        modalRef.current.removeEventListener('click', handleClickOutside)
      }
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [buttonId, modalId, isOpen, openModal, closeModal, chartInstance])

  return (
    <div className={styles.chartModal} ref={modalRef} style={{ display: 'none' }}>
      <div className={styles.chartModalContent}>
        <button className={styles.closeButton} aria-label="Sulje graafi">
          ×
        </button>
        <div className={styles.chartContainer}></div>
      </div>
    </div>
  )
}

