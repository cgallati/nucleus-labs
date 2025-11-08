import type { Payload } from 'payload'
import { calculatePrintCost, estimatePrintTime } from '@/utilities/calculatePrintCost'
import NodeStl from 'node-stl'
import fs from 'fs'
import _path from 'path'
import Stripe from 'stripe'

interface AnalyzeFileInput {
  fileId: string
  filePath: string
  fileType: 'stl' | '3mf' | 'obj'
}

/**
 * Analyze a 3D print file and calculate costs
 * This runs as a background job after file upload
 */
export const analyzeFileJob = async ({
  input,
  job,
  req,
}: {
  input: AnalyzeFileInput
  job: any
  req: { payload: Payload }
}) => {
  const payload = req.payload
  const { fileId, filePath, fileType } = input
  const jobStartTime = Date.now()

  console.log('[Analysis Job] Starting analysis:', {
    fileId,
    filePath,
    fileType,
    timestamp: new Date().toISOString(),
  })

  try {
    // Update status to analyzing
    console.log('[Analysis Job] Updating status to analyzing...')
    await payload.update({
      collection: 'print-files',
      id: fileId,
      data: {
        analysisStatus: 'analyzing',
      },
    })
    console.log('[Analysis Job] Status updated to analyzing')

    // Get print settings
    console.log('[Analysis Job] Fetching print settings...')
    const settings = await payload.findGlobal({
      slug: 'print-settings',
    })
    console.log('[Analysis Job] Print settings loaded')

    // Parse the file based on type
    console.log('[Analysis Job] Starting file parsing for type:', fileType)
    let analysis
    if (fileType === 'stl') {
      analysis = await analyzeSTL(filePath, settings)
    } else if (fileType === '3mf') {
      // 3MF support is basic for now - treat as STL if possible
      // TODO: Implement full 3MF parsing
      analysis = await analyze3MF(filePath, settings)
    } else if (fileType === 'obj') {
      // TODO: Implement OBJ parsing
      analysis = await analyzeOBJ(filePath, settings)
    } else {
      throw new Error(`Unsupported file type: ${fileType}`)
    }
    console.log('[Analysis Job] File parsing complete:', {
      volume: analysis.volume,
      triangleCount: analysis.triangleCount,
    })

    // Check if file exceeds build volume
    console.log('[Analysis Job] Checking build volume constraints...')
    const buildVolume = settings.buildVolume
    const exceedsBuildVolume =
      analysis.boundingBox.x > buildVolume.x ||
      analysis.boundingBox.y > buildVolume.y ||
      analysis.boundingBox.z > buildVolume.z

    console.log('[Analysis Job] Build volume check:', {
      modelDimensions: analysis.boundingBox,
      buildVolume,
      exceedsBuildVolume,
    })

    if (exceedsBuildVolume && settings.rejectOversizedFiles) {
      console.error('[Analysis Job] File exceeds build volume, marking as failed')
      // Mark as failed
      await payload.update({
        collection: 'print-files',
        id: fileId,
        data: {
          analysisStatus: 'failed',
          scanStatus: 'threat', // Using this to indicate build volume failure
        },
      })

      throw new Error(
        `File exceeds build volume. Maximum dimensions: ${buildVolume.x}×${buildVolume.y}×${buildVolume.z}mm. ` +
        `Your model: ${Math.ceil(analysis.boundingBox.x)}×${Math.ceil(analysis.boundingBox.y)}×${Math.ceil(analysis.boundingBox.z)}mm`,
      )
    }

    // Calculate cost
    console.log('[Analysis Job] Calculating print cost...')
    const costBreakdown = calculatePrintCost(
      {
        volume: analysis.volume,
        estimatedPrintTime: analysis.estimatedPrintTime,
      },
      {
        baseOrderFee: settings.baseOrderFee,
        pricePerGram: settings.pricePerGram,
        hourlyMachineRate: settings.hourlyMachineRate,
        minimumCharge: settings.minimumCharge,
        materialDensity: settings.materialDensity,
      },
    )

    console.log('[Analysis Job] Cost calculated:', {
      total: costBreakdown.total,
      materialCost: costBreakdown.materialCost,
      timeCost: costBreakdown.timeCost,
    })

    // Create Stripe Price for this print file
    let stripePriceId: string | undefined
    if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRINT_SERVICE_PRODUCT_ID) {
      try {
        console.log('[Analysis Job] Creating Stripe Price...')
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
          apiVersion: '2025-08-27.basil',
        })

        // Create a Stripe Price for this specific print file
        const price = await stripe.prices.create({
          currency: 'usd',
          unit_amount: Math.round(costBreakdown.total * 100), // Convert to cents
          product: process.env.STRIPE_PRINT_SERVICE_PRODUCT_ID,
          metadata: {
            printFileId: fileId,
            filename: filePath.split('/').pop() || 'unknown',
          },
        })

        stripePriceId = price.id
        console.log('[Analysis Job] Stripe Price created:', stripePriceId)
      } catch (stripeError) {
        console.error('[Analysis Job] Failed to create Stripe Price:', stripeError)
        // Continue anyway - we can still save the file without Stripe Price
      }
    } else {
      if (!process.env.STRIPE_SECRET_KEY) {
        console.log('[Analysis Job] STRIPE_SECRET_KEY not set, skipping Stripe Price creation')
      }
      if (!process.env.STRIPE_PRINT_SERVICE_PRODUCT_ID) {
        console.log('[Analysis Job] STRIPE_PRINT_SERVICE_PRODUCT_ID not set, skipping Stripe Price creation')
      }
    }

    // Update file with analysis results
    console.log('[Analysis Job] Updating file record with analysis results...')
    await payload.update({
      collection: 'print-files',
      id: fileId,
      data: {
        analysisStatus: 'complete',
        scanStatus: 'clean', // File is safe to print
        estimatedCost: costBreakdown.total,
        stripePriceId,
        analysis: {
          volume: analysis.volume,
          surfaceArea: analysis.surfaceArea,
          boundingBox: analysis.boundingBox,
          estimatedPrintTime: analysis.estimatedPrintTime,
          triangleCount: analysis.triangleCount,
        },
      },
    })

    const jobDuration = Date.now() - jobStartTime
    console.log('[Analysis Job] Analysis completed successfully in', jobDuration, 'ms')

    return {
      output: {
        success: true,
        analysis,
        cost: costBreakdown,
        exceedsBuildVolume,
      },
    }
  } catch (error) {
    const jobDuration = Date.now() - jobStartTime
    console.error('[Analysis Job] Analysis failed after', jobDuration, 'ms')
    console.error('[Analysis Job] Error:', error)
    console.error('[Analysis Job] Error stack:', error instanceof Error ? error.stack : 'No stack trace')

    // Mark as failed
    try {
      await payload.update({
        collection: 'print-files',
        id: fileId,
        data: {
          analysisStatus: 'failed',
        },
      })
      console.log('[Analysis Job] File marked as failed in database')
    } catch (updateError) {
      console.error('[Analysis Job] Failed to update file status:', updateError)
    }

    throw error
  }
}

interface AnalysisResult {
  volume: number // cm³
  surfaceArea: number // mm²
  boundingBox: { x: number; y: number; z: number } // dimensions in mm
  estimatedPrintTime: number // minutes
  triangleCount: number
}

/**
 * Analyze an STL file
 */
async function analyzeSTL(filePath: string, settings: any): Promise<AnalysisResult> {
  console.log('[STL Parser] Starting STL analysis for:', filePath)

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.error('[STL Parser] File does not exist at path:', filePath)
    throw new Error(`File not found: ${filePath}`)
  }

  // Read the file
  console.log('[STL Parser] Reading file from disk...')
  const fileBuffer = fs.readFileSync(filePath)
  console.log('[STL Parser] File read, size:', fileBuffer.length, 'bytes')

  // Parse with node-stl
  console.log('[STL Parser] Parsing STL with node-stl...')
  const stl = new NodeStl(fileBuffer) as any
  console.log('[STL Parser] STL parsed successfully')

  // Get basic properties
  // NOTE: node-stl returns volume in cm³ and boundingBox as [x, y, z] dimensions in mm
  const volumeCm3 = stl.volume // cm³
  const boundingBox = stl.boundingBox // [x, y, z] dimensions in mm

  console.log('[STL Parser] Volume (cm³):', volumeCm3)
  console.log('[STL Parser] Bounding box (mm):', boundingBox)

  // Parse bounding box dimensions
  let boxDimensions = { x: 0, y: 0, z: 0 }

  if (Array.isArray(boundingBox) && boundingBox.length === 3) {
    // Bounding box is already dimensions [x, y, z] in mm
    boxDimensions = {
      x: boundingBox[0],
      y: boundingBox[1],
      z: boundingBox[2],
    }
  } else {
    console.warn('[STL Parser] Invalid bounding box format, using volume to estimate dimensions')
    // Estimate dimensions from volume assuming a cube (volume is in cm³, convert to mm)
    const volumeMm3 = volumeCm3 * 1000
    const sideLength = Math.cbrt(volumeMm3)
    boxDimensions = { x: sideLength, y: sideLength, z: sideLength }
  }

  console.log('[STL Parser] Dimensions (mm):', boxDimensions)

  // Calculate surface area from faces
  let surfaceArea = 0
  let triangleCount = 0

  // Access facets if available
  if (stl.facets && Array.isArray(stl.facets)) {
    triangleCount = stl.facets.length
    for (let i = 0; i < stl.facets.length; i++) {
      const facet = stl.facets[i]
      // Calculate triangle area using cross product
      const v1 = facet.verts[0]
      const v2 = facet.verts[1]
      const v3 = facet.verts[2]

      const a = [v2[0] - v1[0], v2[1] - v1[1], v2[2] - v1[2]]
      const b = [v3[0] - v1[0], v3[1] - v1[1], v3[2] - v1[2]]

      const cross = [
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0],
      ]

      const area = 0.5 * Math.sqrt(cross[0] ** 2 + cross[1] ** 2 + cross[2] ** 2)
      surfaceArea += area
    }
  } else {
    // Estimate surface area from volume if facets not available
    // Using rough approximation for surface area (volume in cm³)
    surfaceArea = Math.pow(volumeCm3, 2/3) * 6 * 100 // Convert to mm²
  }

  // Estimate print time (pass volume in cm³)
  const estimatedPrintTime = estimatePrintTime(
    volumeCm3,
    settings.defaultLayerHeight,
    settings.printSpeed,
    settings.defaultInfill,
  )

  return {
    volume: volumeCm3, // Return volume in cm³
    surfaceArea,
    boundingBox: boxDimensions,
    estimatedPrintTime,
    triangleCount,
  }
}

/**
 * Analyze a 3MF file (basic support)
 * TODO: Implement full 3MF parsing with lib3mf or similar
 */
async function analyze3MF(_filePath: string, _settings: any): Promise<AnalysisResult> {
  // For now, 3MF files need proper parsing library
  // Return basic placeholder data
  throw new Error('3MF file analysis coming soon. Please use STL format for now.')
}

/**
 * Analyze an OBJ file
 * TODO: Implement OBJ parsing
 */
async function analyzeOBJ(_filePath: string, _settings: any): Promise<AnalysisResult> {
  // OBJ format is text-based and easier to parse
  // TODO: Implement OBJ parser
  throw new Error('OBJ file analysis coming soon. Please use STL format for now.')
}
