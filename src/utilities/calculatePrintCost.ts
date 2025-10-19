interface PrintAnalysis {
  volume: number // cm³ (cubic centimeters)
  estimatedPrintTime: number // minutes
}

interface PrintSettings {
  baseOrderFee: number
  pricePerGram: number
  hourlyMachineRate: number
  minimumCharge: number
  materialDensity: number // g/cm³
}

interface CostBreakdown {
  materialCost: number
  timeCost: number
  baseFee: number
  subtotal: number
  total: number // Max of subtotal or minimum charge
}

/**
 * Calculate the cost to print a 3D model
 * @param analysis - File analysis data (volume, print time)
 * @param settings - Print settings from admin dashboard
 * @returns Cost breakdown
 */
export function calculatePrintCost(
  analysis: PrintAnalysis,
  settings: PrintSettings,
): CostBreakdown {
  // Volume is already in cm³ from node-stl
  const volumeInCm3 = analysis.volume

  // Calculate material weight in grams
  const materialWeightGrams = volumeInCm3 * settings.materialDensity

  // Calculate material cost
  const materialCost = materialWeightGrams * settings.pricePerGram

  // Calculate time cost (convert minutes to hours)
  const printTimeHours = analysis.estimatedPrintTime / 60
  const timeCost = printTimeHours * settings.hourlyMachineRate

  // Calculate subtotal
  const subtotal = settings.baseOrderFee + materialCost + timeCost

  // Apply minimum charge if needed
  const total = Math.max(subtotal, settings.minimumCharge)

  return {
    materialCost: Number(materialCost.toFixed(2)),
    timeCost: Number(timeCost.toFixed(2)),
    baseFee: settings.baseOrderFee,
    subtotal: Number(subtotal.toFixed(2)),
    total: Number(total.toFixed(2)),
  }
}

/**
 * Estimate print time based on volume and print settings
 * This is a rough estimation - actual time depends on many factors
 * @param volume - Volume in cm³ (cubic centimeters)
 * @param layerHeight - Layer height in mm
 * @param printSpeed - Print speed in mm/s
 * @param infill - Infill percentage (0-100)
 * @returns Estimated print time in minutes
 */
export function estimatePrintTime(
  volume: number,
  layerHeight: number,
  printSpeed: number,
  infill: number,
): number {
  // Very rough estimation formula
  // Actual print time depends on geometry, supports, travel moves, etc.

  // Volume is already in cm³ from node-stl
  const volumeCm3 = volume

  // Estimate number of layers (assuming average height of 50mm for typical prints)
  const estimatedHeight = Math.pow(volumeCm3, 1 / 3) * 10 // rough cube root scaled
  const numberOfLayers = estimatedHeight / layerHeight

  // Estimate extrusion length based on volume and infill
  const infillFactor = infill / 100
  const extrusionVolume = volumeCm3 * (0.4 + (infillFactor * 0.6)) // shells + infill

  // Rough estimation of print path length (this is very approximate)
  const extrusionLength = extrusionVolume * 1000 // mm

  // Calculate time in seconds
  const printTimeSeconds = (extrusionLength / printSpeed) + (numberOfLayers * 2) // +2s per layer for travel/retraction

  // Convert to minutes and add 10% overhead for acceleration, retractions, etc.
  const printTimeMinutes = (printTimeSeconds / 60) * 1.1

  return Math.ceil(printTimeMinutes)
}
