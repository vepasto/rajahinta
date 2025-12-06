'use client'

import { ReactNode, RefObject, useState, useEffect } from 'react'
import { FullscreenChart } from './FullscreenChart'

interface ChartSectionProps {
  title: string
  description: ReactNode
  chartRef: RefObject<HTMLCanvasElement>
  chartInstance: any
  chartId: string
  buttonId: string
  modalId: string
  chartType?: 'line' | 'bar'
  aspectRatio?: number
  placeholderImage?: string
}

export function ChartSection({
  title,
  description,
  chartRef,
  chartInstance,
  chartId,
  buttonId,
  modalId,
  chartType = 'line',
  aspectRatio = 1.2,
  placeholderImage,
}: ChartSectionProps) {
  const [showPlaceholder, setShowPlaceholder] = useState(true)

  useEffect(() => {
    // Hide placeholder when chart is loaded
    if (chartInstance) {
      setShowPlaceholder(false)
    }
  }, [chartInstance])

  return (
    <>
      <div className="chart-container" id={`${chartId}-chart`}>
        <h3>{title}</h3>
        <div className="chart-description">{description}</div>
        <div style={{ position: 'relative', paddingTop: '35px', minHeight: '400px' }}>
          {showPlaceholder && placeholderImage && (
            <img
              src={placeholderImage}
              alt={`${title} - placeholder`}
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                opacity: 0.7,
                position: 'absolute',
                top: '35px',
                left: 0,
              }}
              className="chart-placeholder"
            />
          )}
          <canvas
            id={chartId}
            ref={chartRef}
            style={{
              display: chartInstance ? 'block' : 'none',
              width: '100%',
              height: 'auto',
            }}
          ></canvas>
          <button
            className="fullscreen-chart-btn"
            id={buttonId}
            aria-label="Avaa graafi täysikokoisena"
            title="Avaa graafi täysikokoisena"
            style={{
              display: chartInstance ? 'flex' : 'none',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
            </svg>
          </button>
        </div>
      </div>
      {chartInstance && (
        <FullscreenChart
          chartInstance={chartInstance}
          chartType={chartType}
          aspectRatio={aspectRatio}
          buttonId={buttonId}
          modalId={modalId}
        />
      )}
    </>
  )
}

