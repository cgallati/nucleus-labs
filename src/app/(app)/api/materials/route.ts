import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export const runtime = 'nodejs'

/**
 * GET /api/materials
 * Returns available materials and colors from PrintSettings
 */
export async function GET() {
  try {
    const payload = await getPayload({ config: configPromise })

    // Fetch print settings
    const settings = await payload.findGlobal({
      slug: 'print-settings',
    })

    // Filter to only enabled materials and in-stock colors
    const materials = (settings.materials || [])
      .filter((material: any) => material.enabled)
      .map((material: any) => ({
        name: material.name,
        type: material.type,
        density: material.density,
        costPerKg: material.costPerKg,
        colors: (material.colors || [])
          .filter((color: any) => color.inStock)
          .map((color: any) => ({
            name: color.name,
            sku: color.sku,
            hexCode: color.hexCode,
          })),
      }))
      .filter((material: any) => material.colors.length > 0) // Only return materials with available colors

    return NextResponse.json({ materials })
  } catch (error) {
    console.error('[Materials API] Error fetching materials:', error)
    return NextResponse.json({ error: 'Failed to fetch materials' }, { status: 500 })
  }
}
