import { ChartJSNodeCanvas } from 'chartjs-node-canvas'
import * as fs from 'fs'
import * as path from 'path'

// Helper function to find latest indices file
function findLatestIndicesFile(dataPath: string): string {
  const maxDaysBack = 30
  const today = new Date()

  for (let daysBack = 0; daysBack < maxDaysBack; daysBack++) {
    const date = new Date(today)
    date.setDate(date.getDate() - daysBack)

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const filename = path.join(dataPath, `indices-${year}-${month}-${day}.json`)

    if (fs.existsSync(filename)) {
      return filename
    }
  }
  throw new Error('Could not find any indices file within the last 30 days.')
}

// Load indices data
function loadIndicesData(dataPath: string): any {
  const indicesFile = findLatestIndicesFile(dataPath)
  const data = fs.readFileSync(indicesFile, 'utf-8')
  return JSON.parse(data)
}

// Generate chart image
async function generateChartImage(
  chartJSNodeCanvas: ChartJSNodeCanvas,
  chartConfig: any,
  outputPath: string,
  width: number = 1200,
  height: number = 600
): Promise<void> {
  const imageBuffer = await chartJSNodeCanvas.renderToBuffer(chartConfig)
  fs.writeFileSync(outputPath, imageBuffer)
  console.log(`Generated: ${outputPath}`)
}

async function main() {
  const dataPath = path.join(process.cwd(), 'public', 'data')
  const outputPath = path.join(process.cwd(), 'public', 'chart-placeholders')
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true })
  }

  // Load indices data
  const data = loadIndicesData(dataPath)

  // Chart configuration
  const width = 1200
  const height = 600
  const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height })

  // Chart colors (light mode)
  const textColor = '#333'
  const gridColor = 'rgba(0, 0, 0, 0.15)'

  // Chart 1: New indices (after 2011)
  const rakennuskustannus: number[] = []
  const markkinahinta: number[] = []
  const newLabels: string[] = []

  try {
    for (const yearStr in data.rakennuskustannusindeksi) {
      const year = parseInt(yearStr)
      for (const monthStr in data.rakennuskustannusindeksi[yearStr]) {
        const month = parseInt(monthStr)
        const value = data.rakennuskustannusindeksi[yearStr][monthStr]
        if (typeof value === 'number' && !isNaN(value)) {
          newLabels.push(`${year}-${String(month).padStart(2, '0')}`)
          rakennuskustannus.push(value)
        }
      }
    }
    for (const yearStr in data.markkinahintaindeksi) {
      const year = parseInt(yearStr)
      for (const monthStr in data.markkinahintaindeksi[yearStr]) {
        const month = parseInt(monthStr)
        const value = data.markkinahintaindeksi[yearStr][monthStr]
        if (typeof value === 'number' && !isNaN(value)) {
          markkinahinta.push(value)
        }
      }
    }
  } catch (error) {
    console.error('Error parsing new indices data:', error)
    throw new Error('Failed to parse indices data')
  }

  await generateChartImage(
    chartJSNodeCanvas,
    {
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
        responsive: false,
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
    },
    path.join(outputPath, 'new-indices-chart.png')
  )

  // Chart 2: Old market index (before 2011)
  const vanhatMarkkinahinta: number[] = []
  const oldLabels: string[] = []

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

  if (oldLabels.length > 0 && vanhatMarkkinahinta.length > 0) {
    await generateChartImage(
      chartJSNodeCanvas,
      {
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
          responsive: false,
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
      },
      path.join(outputPath, 'old-indices-chart.png')
    )
  }

  // Chart 3: Rajaneliöhinta
  const rajaneliohinta: number[] = []
  const rajaneliohintaLabels: string[] = []

  if (data.rajaneliohinta_tilasto) {
    try {
      for (const yearStr in data.rajaneliohinta_tilasto) {
        const year = parseInt(yearStr)
        for (const monthStr in data.rajaneliohinta_tilasto[yearStr]) {
          const month = parseInt(monthStr)
          const value = data.rajaneliohinta_tilasto[yearStr][monthStr]
          if (typeof value === 'number' && !isNaN(value)) {
            rajaneliohintaLabels.push(`${year}-${String(month).padStart(2, '0')}`)
            rajaneliohinta.push(value)
          }
        }
      }
    } catch (error) {
      console.error('Error parsing rajaneliöhinta tilasto data:', error)
    }
  }

  if (rajaneliohintaLabels.length > 0 && rajaneliohinta.length > 0) {
    await generateChartImage(
      chartJSNodeCanvas,
      {
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
          responsive: false,
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
      },
      path.join(outputPath, 'rajaneliohinta-chart.png')
    )
  }

  console.log('All chart placeholders generated successfully!')
}

main().catch((error) => {
  console.error('Error generating chart placeholders:', error)
  process.exit(1)
})

