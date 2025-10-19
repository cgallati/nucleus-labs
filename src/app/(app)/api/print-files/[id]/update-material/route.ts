import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { calculatePrintCost } from '@/utilities/calculatePrintCost'

export const runtime = 'nodejs'

/**
 * PATCH /api/print-files/[id]/update-material
 * Updates the material and color selection for a print file and recalculates cost
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const { material, color } = await req.json()

    if (!material || !color) {
      return NextResponse.json(
        { error: 'Material and color are required' },
        { status: 400 },
      )
    }

    const payload = await getPayload({ config: configPromise })

    // Fetch the print file
    const printFile = await payload.findByID({
      collection: 'print-files',
      id,
    })

    if (!printFile) {
      return NextResponse.json({ error: 'Print file not found' }, { status: 404 })
    }

    // Fetch print settings to get material properties
    const settings = await payload.findGlobal({
      slug: 'print-settings',
    })

    // Find the selected material
    const selectedMaterial = (settings.materials || []).find(
      (m: any) => m.name === material && m.enabled,
    )

    if (!selectedMaterial) {
      return NextResponse.json({ error: 'Material not found or not available' }, { status: 400 })
    }

    // Verify the color exists and is in stock
    const selectedColor = (selectedMaterial.colors || []).find(
      (c: any) => c.name === color && c.inStock,
    )

    if (!selectedColor) {
      return NextResponse.json({ error: 'Color not found or out of stock' }, { status: 400 })
    }

    // Recalculate cost with material-specific density
    let estimatedCost = printFile.estimatedCost

    if (printFile.analysis?.volume && printFile.analysis?.estimatedPrintTime) {
      // Calculate cost per gram from cost per kg
      const pricePerGram = selectedMaterial.costPerKg / 1000

      const costBreakdown = calculatePrintCost(
        {
          volume: printFile.analysis.volume,
          estimatedPrintTime: printFile.analysis.estimatedPrintTime,
        },
        {
          baseOrderFee: settings.baseOrderFee,
          pricePerGram,
          hourlyMachineRate: settings.hourlyMachineRate,
          minimumCharge: settings.minimumCharge,
          materialDensity: selectedMaterial.density,
        },
      )

      estimatedCost = costBreakdown.total
    }

    // Update the print file with material selection and recalculated cost
    const updatedFile = await payload.update({
      collection: 'print-files',
      id,
      data: {
        material,
        color,
        estimatedCost,
      },
    })

    console.log('[Update Material API] Updated file:', {
      id,
      material,
      color,
      estimatedCost,
    })

    return NextResponse.json({
      success: true,
      material: updatedFile.material,
      color: updatedFile.color,
      estimatedCost: updatedFile.estimatedCost,
    })
  } catch (error) {
    console.error('[Update Material API] Error:', error)
    return NextResponse.json({ error: 'Failed to update material selection' }, { status: 500 })
  }
}
