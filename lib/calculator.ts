// Calculator utility functions
import { indicesState } from './calculator-indices'

export interface Improvement {
  price: number
  year: number
  month: number
}

export interface CalculationResult {
  rakennuskustannus: {
    price: number
    currentIndex: { value: number; year: number; month: number }
    purchaseIndex: number
  } | null
  markkinahinta: {
    price: number
    currentIndex: { value: number; year: number; month: number }
    purchaseIndex: number
  } | null
  vanhatMarkkinahinta: {
    price: number
    currentIndex: { value: number; year: number; month: number }
    purchaseIndex: number
  } | null
  rajaneliohinta: {
    price: number
    pricePerSqm: number
    apartmentSize: number
    validFrom: string
    validUntil: string
  } | null
  improvements: {
    totalIndexedValue: number
    improvements: any[]
  } | null
}

// Get the latest available index value (not in the future)
export function getLatestIndex(
  indexData: Record<number, Record<number, number>>
): { value: number; year: number; month: number } | null {
  if (!indexData || typeof indexData !== 'object' || Object.keys(indexData).length === 0) {
    return null
  }

  try {
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth() + 1

    const years = Object.keys(indexData)
      .map(Number)
      .filter((y) => !isNaN(y))
      .sort((a, b) => b - a)

    for (const year of years) {
      if (year > currentYear) continue

      if (!indexData[year] || typeof indexData[year] !== 'object') {
        continue
      }

      const months = Object.keys(indexData[year])
        .map(Number)
        .filter((m) => !isNaN(m))
        .sort((a, b) => b - a)
      for (const month of months) {
        if (year === currentYear && month > currentMonth) continue

        const value = indexData[year][month]
        if (typeof value === 'number' && !isNaN(value)) {
          return {
            value: value,
            year: year,
            month: month,
          }
        }
      }
    }
  } catch (error) {
    console.error('Error in getLatestIndex:', error)
  }

  return null
}

// Get index value for a specific date
export function getIndexValue(
  indexData: Record<number, Record<number, number>>,
  year: number,
  month: number
): number | null {
  if (!indexData || typeof indexData !== 'object') {
    return null
  }

  if (typeof year !== 'number' || isNaN(year) || typeof month !== 'number' || isNaN(month)) {
    return null
  }

  try {
    if (indexData[year] && typeof indexData[year] === 'object' && indexData[year][month] !== undefined) {
      const value = indexData[year][month]
      if (typeof value === 'number' && !isNaN(value)) {
        return value
      }
    }
  } catch (error) {
    console.error('Error in getIndexValue:', error)
  }

  return null
}

// Format price in euros
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('fi-FI', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

// Format price compactly for charts (e.g., 305000 -> 305k €)
export function formatPriceCompact(price: number): string {
  if (price >= 1000) {
    return Math.round(price / 1000) + 'k €'
  }
  return Math.round(price) + ' €'
}

// Calculate indexed value for a single improvement
export function getImprovementIndexedValue(improvement: Improvement, apartmentSize: number) {
  const omavastuu = apartmentSize * 30 // 30 €/m²

  if (improvement.price <= omavastuu) {
    return {
      originalPrice: improvement.price,
      omavastuu: omavastuu,
      indexedValue: 0,
      indexedAmount: 0,
      usedIndex: null,
      improvementYear: improvement.year,
      improvementMonth: improvement.month,
    }
  }

  const amountToIndex = improvement.price - omavastuu
  const isBefore2011 = improvement.year < 2011

  let indexedValue = 0
  let usedIndex: any = null

  if (isBefore2011) {
    const improvementOldMarket = getIndexValue(
      indicesState.vanhatMarkkinahintaindeksi,
      improvement.year,
      improvement.month
    )
    const currentOldMarket = getLatestIndex(indicesState.vanhatMarkkinahintaindeksi)

    if (improvementOldMarket && currentOldMarket) {
      indexedValue = (amountToIndex * currentOldMarket.value) / improvementOldMarket
      usedIndex = {
        name: 'Vanhojen osakeasuntojen hintaindeksi',
        type: 'vanhatMarkkinahinta',
        improvementIndex: improvementOldMarket,
        currentIndex: currentOldMarket,
      }
    }
  } else {
    const improvementRk = getIndexValue(indicesState.rakennuskustannusindeksi, improvement.year, improvement.month)
    const improvementMh = getIndexValue(indicesState.markkinahintaindeksi, improvement.year, improvement.month)
    const currentRk = getLatestIndex(indicesState.rakennuskustannusindeksi)
    const currentMh = getLatestIndex(indicesState.markkinahintaindeksi)

    let rkValue = 0
    let mhValue = 0

    if (improvementRk && currentRk) {
      rkValue = (amountToIndex * currentRk.value) / improvementRk
    }

    if (improvementMh && currentMh) {
      mhValue = (amountToIndex * currentMh.value) / improvementMh
    }

    if (rkValue >= mhValue && rkValue > 0) {
      indexedValue = rkValue
      usedIndex = {
        name: 'Rakennuskustannusindeksi',
        type: 'rakennuskustannus',
        improvementIndex: improvementRk,
        currentIndex: currentRk,
      }
    } else if (mhValue > 0) {
      indexedValue = mhValue
      usedIndex = {
        name: 'Markkinahintaindeksi',
        type: 'markkinahinta',
        improvementIndex: improvementMh,
        currentIndex: currentMh,
      }
    }
  }

  return {
    originalPrice: improvement.price,
    omavastuu: omavastuu,
    indexedValue: indexedValue,
    indexedAmount: amountToIndex,
    usedIndex: usedIndex,
    improvementYear: improvement.year,
    improvementMonth: improvement.month,
  }
}

// Calculate total improvements impact
export function calculateImprovements(improvements: Improvement[], apartmentSize: number) {
  if (!improvements || improvements.length === 0) {
    return {
      totalIndexedValue: 0,
      improvements: [],
    }
  }

  const improvementResults = improvements.map((improvement) =>
    getImprovementIndexedValue(improvement, apartmentSize)
  )

  const totalIndexedValue = improvementResults.reduce((sum, result) => sum + result.indexedValue, 0)

  return {
    totalIndexedValue: totalIndexedValue,
    improvements: improvementResults,
  }
}

// Calculate rajahinta
export function calculateRajahinta(
  originalPrice: number,
  purchaseYear: number,
  purchaseMonth: number,
  apartmentSize: number,
  improvements: Improvement[] = []
): CalculationResult {
  const results: CalculationResult = {
    rakennuskustannus: null,
    markkinahinta: null,
    vanhatMarkkinahinta: null,
    rajaneliohinta: null,
    improvements: null,
  }

  const isBefore2011 = purchaseYear < 2011

  if (isBefore2011) {
    const purchaseOldMarket = getIndexValue(
      indicesState.vanhatMarkkinahintaindeksi,
      purchaseYear,
      purchaseMonth
    )
    const currentOldMarket = getLatestIndex(indicesState.vanhatMarkkinahintaindeksi)

    if (purchaseOldMarket && currentOldMarket) {
      results.vanhatMarkkinahinta = {
        price: (originalPrice * currentOldMarket.value) / purchaseOldMarket,
        currentIndex: currentOldMarket,
        purchaseIndex: purchaseOldMarket,
      }
    }
  } else {
    const purchaseRakennuskustannus = getIndexValue(
      indicesState.rakennuskustannusindeksi,
      purchaseYear,
      purchaseMonth
    )
    const purchaseMarkkinahinta = getIndexValue(indicesState.markkinahintaindeksi, purchaseYear, purchaseMonth)

    const currentRakennuskustannus = getLatestIndex(indicesState.rakennuskustannusindeksi)
    const currentMarkkinahinta = getLatestIndex(indicesState.markkinahintaindeksi)

    if (purchaseRakennuskustannus && currentRakennuskustannus) {
      results.rakennuskustannus = {
        price: (originalPrice * currentRakennuskustannus.value) / purchaseRakennuskustannus,
        currentIndex: currentRakennuskustannus,
        purchaseIndex: purchaseRakennuskustannus,
      }
    }

    if (purchaseMarkkinahinta && currentMarkkinahinta) {
      results.markkinahinta = {
        price: (originalPrice * currentMarkkinahinta.value) / purchaseMarkkinahinta,
        currentIndex: currentMarkkinahinta,
        purchaseIndex: purchaseMarkkinahinta,
      }
    }
  }

  if (improvements && improvements.length > 0) {
    const improvementsResult = calculateImprovements(improvements, apartmentSize)
    results.improvements = improvementsResult

    if (results.rakennuskustannus) {
      results.rakennuskustannus.price += improvementsResult.totalIndexedValue
    }
    if (results.markkinahinta) {
      results.markkinahinta.price += improvementsResult.totalIndexedValue
    }
    if (results.vanhatMarkkinahinta) {
      results.vanhatMarkkinahinta.price += improvementsResult.totalIndexedValue
    }
  }

  if (indicesState.rajaneliohinta && apartmentSize) {
    results.rajaneliohinta = {
      price: apartmentSize * indicesState.rajaneliohinta.price_per_sqm,
      pricePerSqm: indicesState.rajaneliohinta.price_per_sqm,
      apartmentSize: apartmentSize,
      validFrom: indicesState.rajaneliohinta.valid_from,
      validUntil: indicesState.rajaneliohinta.valid_until,
    }
  }

  return results
}

