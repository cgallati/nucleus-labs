import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Stripe from 'stripe'

/**
 * Backfill Stripe Prices for existing print files that don't have one
 * Run with: pnpm tsx src/scripts/backfillStripePrices.ts
 */

async function backfillStripePrices() {
  console.log('Backfilling Stripe Prices for existing print files...')

  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('✗ STRIPE_SECRET_KEY not found in environment')
      process.exit(1)
    }

    if (!process.env.STRIPE_PRINT_SERVICE_PRODUCT_ID) {
      console.error('✗ STRIPE_PRINT_SERVICE_PRODUCT_ID not found in environment')
      console.error('  Run: pnpm tsx src/scripts/createStripeProduct.ts')
      process.exit(1)
    }

    const payload = await getPayload({ config: configPromise })
    console.log('✓ Payload initialized')

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-08-27.basil',
    })
    console.log('✓ Stripe initialized')

    const stripeProductId = process.env.STRIPE_PRINT_SERVICE_PRODUCT_ID
    console.log('✓ Using Stripe Product ID:', stripeProductId)

    // Find all analyzed files without Stripe Price IDs
    const files = await payload.find({
      collection: 'print-files',
      where: {
        and: [
          {
            analysisStatus: {
              equals: 'complete',
            },
          },
          {
            stripePriceId: {
              exists: false,
            },
          },
          {
            estimatedCost: {
              exists: true,
            },
          },
        ],
      },
      limit: 100,
    })

    console.log(`Found ${files.docs.length} files without Stripe Prices`)

    let successCount = 0
    let errorCount = 0

    for (const file of files.docs) {
      try {
        console.log(`\nProcessing: ${file.filename} (${file.id})`)
        console.log(`  Cost: $${file.estimatedCost}`)

        // Create Stripe Price
        const price = await stripe.prices.create({
          currency: 'usd',
          unit_amount: Math.round((file.estimatedCost || 0) * 100), // Convert to cents
          product: stripeProductId,
          metadata: {
            printFileId: file.id,
            filename: file.filename || 'unknown',
          },
        })

        console.log(`  ✓ Stripe Price created: ${price.id}`)

        // Update file with Stripe Price ID
        await payload.update({
          collection: 'print-files',
          id: file.id,
          data: {
            stripePriceId: price.id,
          },
        })

        console.log(`  ✓ File updated with Stripe Price ID`)
        successCount++
      } catch (error) {
        console.error(`  ✗ Error processing file ${file.id}:`, error)
        errorCount++
      }
    }

    console.log('\n========================================')
    console.log(`✓ Backfill complete!`)
    console.log(`  Success: ${successCount}`)
    console.log(`  Errors: ${errorCount}`)
    console.log('========================================')

    process.exit(0)
  } catch (error) {
    console.error('✗ Error:', error)
    process.exit(1)
  }
}

backfillStripePrices()
