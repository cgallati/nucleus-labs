import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

async function updateProductPrice() {
  console.log('Updating 3D Print Service product price...')

  try {
    const payload = await getPayload({ config: configPromise })
    console.log('✓ Payload initialized')

    const products = await payload.find({
      collection: 'products',
      where: {
        slug: {
          equals: '3d-print-service',
        },
      },
    })

    if (products.docs.length === 0) {
      console.log('✗ Product not found. Please run: pnpm seed:print-product')
      process.exit(1)
    }

    const product = products.docs[0]

    await payload.update({
      collection: 'products',
      id: product.id,
      data: {
        pricing: [
          {
            currency: 'USD',
            price: 1000, // $10 base price
            salePrice: 0,
          },
        ],
      } as any,
    })

    console.log('✓ Product price updated to $10 base price')
    console.log('  Product ID:', product.id)

    process.exit(0)
  } catch (error) {
    console.error('✗ Error updating product:', error)
    process.exit(1)
  }
}

updateProductPrice()
