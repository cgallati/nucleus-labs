import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

/**
 * Seed script to create the "3D Print Service" product
 * This is a generic product used for all 3D print orders
 * Run with: pnpm seed:print-product
 */

async function seedPrintProduct() {
  console.log('Starting 3D Print Service product seed...')

  try {
    const payload = await getPayload({ config: configPromise })
    console.log('✓ Payload initialized')

    // Check if product already exists
    const existing = await payload.find({
      collection: 'products',
      where: {
        slug: {
          equals: '3d-print-service',
        },
      },
    })

    if (existing.docs.length > 0) {
      console.log('✓ 3D Print Service product already exists')
      console.log('  Product ID:', existing.docs[0].id)
      process.exit(0)
    }

    // Create the product
    const product = await payload.create({
      collection: 'products',
      data: {
        title: '3D Print Service',
        slug: '3d-print-service',
        description: {
          root: {
            type: 'root',
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'text',
                    text: 'Custom 3D printing service - pricing calculated per file',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1,
          },
        },
        _status: 'published',
        pricing: [
          {
            currency: 'USD',
            price: 1000, // Base price $10 - will be overridden per cart item
            salePrice: 0,
          },
        ],
        enableInventoryTracking: false, // No inventory tracking for services
      } as any,
    })

    console.log('✓ 3D Print Service product created successfully!')
    console.log('  Product ID:', product.id)
    console.log('  Slug:', product.slug)

    process.exit(0)
  } catch (error) {
    console.error('✗ Error seeding product:', error)
    process.exit(1)
  }
}

seedPrintProduct()
