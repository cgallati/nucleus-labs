import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

async function checkProductSync() {
  try {
    const payload = await getPayload({ config: configPromise })

    const products = await payload.find({
      collection: 'products',
      where: {
        slug: {
          equals: '3d-print-service',
        },
      },
    })

    if (products.docs.length === 0) {
      console.log('❌ Product not found')
      process.exit(1)
    }

    const product = products.docs[0]
    console.log('Product ID:', product.id)
    console.log('Stripe Product ID:', (product as { stripe?: { productID?: string } }).stripe?.productID || '❌ NOT SYNCED')

    process.exit(0)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

checkProductSync()
