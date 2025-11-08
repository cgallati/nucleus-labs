import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

/**
 * Seed script to populate PrintSettings with initial materials and colors
 * Run with: pnpm seed:materials
 */

const materialsData = [
  {
    name: 'PLA Basic',
    type: 'pla' as const,
    density: 1.24, // g/cm³
    costPerKg: 16.99, // Cost per kilogram
    enabled: true,
    colors: [
      {
        name: 'Red',
        sku: '10200',
        hexCode: '#E63946',
        inStock: true,
      },
      {
        name: 'Pumpkin Orange',
        sku: '10301',
        hexCode: '#FF8C00',
        inStock: true,
      },
      {
        name: 'Black',
        sku: '10101',
        hexCode: '#1D1D1D',
        inStock: true,
      },
      {
        name: 'Gray',
        sku: '10103',
        hexCode: '#6C757D',
        inStock: true,
      },
      {
        name: 'Jade White',
        sku: '10100',
        hexCode: '#F8F9FA',
        inStock: true,
      },
    ],
  },
]

async function seedMaterials() {
  console.log('Starting materials seed...')

  try {
    const payload = await getPayload({ config: configPromise })
    console.log('✓ Payload initialized')

    // Get current print settings
    const currentSettings = await payload.findGlobal({
      slug: 'print-settings',
    })

    console.log('✓ Current settings loaded')

    // Update with materials data
    await payload.updateGlobal({
      slug: 'print-settings',
      data: {
        materials: materialsData,
      },
    })

    console.log('✓ Materials seeded successfully!')
    console.log(`  - Added ${materialsData.length} material(s)`)
    materialsData.forEach((material) => {
      console.log(`    • ${material.name}: ${material.colors.length} colors`)
    })

    process.exit(0)
  } catch (error) {
    console.error('✗ Error seeding materials:', error)
    process.exit(1)
  }
}

seedMaterials()
