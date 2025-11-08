import 'dotenv/config'
import Stripe from 'stripe'

/**
 * Manually create a Stripe Product for 3D Print Service
 * Run with: pnpm tsx src/scripts/createStripeProduct.ts
 *
 * Copy the Product ID output and add to .env as: STRIPE_PRINT_SERVICE_PRODUCT_ID
 */

async function createStripeProduct() {
  console.log('Creating Stripe Product for 3D Print Service...')

  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('✗ STRIPE_SECRET_KEY not found in environment')
      process.exit(1)
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-08-27.basil',
    })
    console.log('✓ Stripe initialized')

    // Check if product already exists
    const products = await stripe.products.list({
      limit: 100,
    })

    const existing = products.data.find(p => p.name === '3D Print Service')

    if (existing) {
      console.log('✓ Product already exists!')
      console.log('  Product ID:', existing.id)
      console.log('\nAdd this to your .env file:')
      console.log(`STRIPE_PRINT_SERVICE_PRODUCT_ID=${existing.id}`)
      process.exit(0)
    }

    // Create Stripe Product
    const stripeProduct = await stripe.products.create({
      name: '3D Print Service',
      description: 'Custom 3D printing service - pricing calculated per file',
      metadata: {
        service: '3d-print',
      },
    })

    console.log('✓ Stripe Product created:', stripeProduct.id)
    console.log('\nAdd this to your .env file:')
    console.log(`STRIPE_PRINT_SERVICE_PRODUCT_ID=${stripeProduct.id}`)

    process.exit(0)
  } catch (error) {
    console.error('✗ Error:', error)
    process.exit(1)
  }
}

createStripeProduct()
