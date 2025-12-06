'use client'

import { ReactNode, RefObject } from 'react'
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
}: ChartSectionProps) {
  return (
    <>
      <div className="chart-container" id={`${chartId}-chart`}>
        <h3>{title}</h3>
        <div className="chart-description">{description}</div>
        <div style={{ position: 'relative', paddingTop: '35px' }}>
          <canvas id={chartId} ref={chartRef}></canvas>
          <button
            className="fullscreen-chart-btn"
            id={buttonId}
            aria-label="Avaa graafi täysikokoisena"
            title="Avaa graafi täysikokoisena"
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

