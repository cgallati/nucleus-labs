import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Stripe from 'stripe'

/**
 * Manually sync the 3D Print Service product to Stripe
 * Run with: pnpm tsx src/scripts/syncProductToStripe.ts
 */

async function syncProductToStripe() {
  console.log('Syncing 3D Print Service product to Stripe...')

  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('✗ STRIPE_SECRET_KEY not found in environment')
      process.exit(1)
    }

    const payload = await getPayload({ config: configPromise })
    console.log('✓ Payload initialized')

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-08-27.basil',
    })
    console.log('✓ Stripe initialized')

    // Find the product
    const products = await payload.find({
      collection: 'products',
      where: {
        slug: {
          equals: '3d-print-service',
        },
      },
    })

    if (products.docs.length === 0) {
      console.error('✗ 3D Print Service product not found')
      process.exit(1)
    }

    const product = products.docs[0]
    console.log('✓ Found product:', product.id)

    // Check if already has Stripe Product ID
    const productWithStripe = product as { stripe?: { productID?: string } }
    if (productWithStripe.stripe?.productID) {
      console.log('✓ Product already synced to Stripe')
      console.log('  Stripe Product ID:', productWithStripe.stripe.productID)
      process.exit(0)
    }

    // Get description text
    let descriptionText = 'Custom 3D printing service'
    if (product.description && typeof product.description === 'object') {
      const desc = product.description as { root?: { children?: Array<{ children?: Array<{ text?: string }> }> } }
      const firstParagraph = desc.root?.children?.[0]
      const firstText = firstParagraph?.children?.[0]?.text
      if (firstText) {
        descriptionText = firstText
      }
    }

    // Create Stripe Product
    const stripeProduct = await stripe.products.create({
      name: product.title || '3D Print Service',
      description: descriptionText,
      metadata: {
        payloadID: product.id,
        slug: product.slug || '',
      },
    })

    console.log('✓ Stripe Product created:', stripeProduct.id)

    // Update Payload product with Stripe ID
    await payload.update({
      collection: 'products',
      id: product.id,
      data: {
        stripe: {
          productID: stripeProduct.id,
        },
      } as any,
    })

    console.log('✓ Product synced successfully!')
    console.log('  Payload Product ID:', product.id)
    console.log('  Stripe Product ID:', stripeProduct.id)

    process.exit(0)
  } catch (error) {
    console.error('✗ Error syncing product:', error)
    process.exit(1)
  }
}

syncProductToStripe()
