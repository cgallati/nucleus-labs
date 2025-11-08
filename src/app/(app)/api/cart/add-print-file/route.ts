import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { cookies } from 'next/headers'

export const runtime = 'nodejs'

/**
 * POST /api/cart/add-print-file
 * Adds a PrintFile to the cart as a line item
 */
export async function POST(req: NextRequest) {
  try {
    const { printFileId } = await req.json()

    if (!printFileId) {
      return NextResponse.json({ error: 'printFileId is required' }, { status: 400 })
    }

    const payload = await getPayload({ config: configPromise })

    // Get or create user session
    let user = null
    try {
      const authResult = await payload.auth({ headers: req.headers })
      user = authResult.user
    } catch (_error) {
      // Guest user - that's ok
    }

    // Fetch the PrintFile
    const printFile = await payload.findByID({
      collection: 'print-files',
      id: printFileId,
    })

    if (!printFile) {
      return NextResponse.json({ error: 'Print file not found' }, { status: 404 })
    }

    if (!printFile.material || !printFile.color) {
      return NextResponse.json(
        { error: 'Please select material and color before adding to cart' },
        { status: 400 },
      )
    }

    if (!printFile.estimatedCost) {
      return NextResponse.json(
        { error: 'Print file has not been analyzed yet' },
        { status: 400 },
      )
    }

    if (!printFile.stripePriceId) {
      return NextResponse.json(
        { error: 'Print file does not have a Stripe Price ID. Please re-analyze the file.' },
        { status: 400 },
      )
    }

    // Find the 3D Print Service product
    const products = await payload.find({
      collection: 'products',
      where: {
        slug: {
          equals: '3d-print-service',
        },
      },
    })

    if (products.docs.length === 0) {
      return NextResponse.json(
        { error: 'Product configuration error. Please contact support.' },
        { status: 500 },
      )
    }

    const product = products.docs[0]

    // Get existing cart or create new one
    const cookieStore = await cookies()
    const cartId = cookieStore.get('cart-id')?.value

    let cart
    if (cartId) {
      // Try to find existing cart
      try {
        cart = await payload.findByID({
          collection: 'carts',
          id: cartId,
        })
      } catch (_error) {
        // Cart not found, will create new one
        cart = null
      }
    }

    // Check if this PrintFile is already in the cart
    if (cart) {
      const existingItem = (cart.items || []).find(
        (item) => (item as { metadata?: { printFileId?: string } }).metadata?.printFileId === printFileId,
      )

      if (existingItem) {
        return NextResponse.json(
          { error: 'This file is already in your cart' },
          { status: 400 },
        )
      }
    }

    // Prepare cart item with PrintFile metadata
    // Each print file has its own Stripe Price ID created during analysis
    const cartItem = {
      product: product.id,
      quantity: 1,
      metadata: {
        printFileId: printFile.id,
        filename: printFile.filename,
        material: printFile.material,
        color: printFile.color,
        volume: printFile.analysis?.volume,
        dimensions: printFile.analysis?.boundingBox
          ? `${Math.ceil(printFile.analysis.boundingBox.x || 0)}×${Math.ceil(printFile.analysis.boundingBox.y || 0)}×${Math.ceil(printFile.analysis.boundingBox.z || 0)}mm`
          : null,
        // Store Stripe Price ID for checkout
        stripePriceId: printFile.stripePriceId,
        customPrice: printFile.estimatedCost,
      },
    }

    // Calculate subtotal manually (in cents)
    const itemPrice = Math.round(printFile.estimatedCost * 100)

    if (cart) {
      // Calculate new subtotal
      const currentSubtotal = cart.subtotal || 0
      const newSubtotal = currentSubtotal + itemPrice

      // Update existing cart
      cart = await payload.update({
        collection: 'carts',
        id: cart.id,
        data: {
          items: [...(cart.items || []), cartItem],
          subtotal: newSubtotal,
        },
      })
    } else {
      // Create new cart with calculated subtotal
      cart = await payload.create({
        collection: 'carts',
        data: {
          customer: user?.id || undefined,
          currency: 'USD',
          items: [cartItem],
          subtotal: itemPrice,
        },
      })

      // Set cart cookie
      const response = NextResponse.json({
        success: true,
        cartId: cart.id,
        itemsCount: cart.items?.length || 0,
      })

      response.cookies.set('cart-id', cart.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      })

      return response
    }

    return NextResponse.json({
      success: true,
      cartId: cart.id,
      itemsCount: cart.items?.length || 0,
    })
  } catch (error) {
    console.error('[Add to Cart API] Error:', error)
    return NextResponse.json({ error: 'Failed to add to cart' }, { status: 500 })
  }
}
