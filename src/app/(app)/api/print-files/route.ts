import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export const runtime = 'nodejs'

/**
 * GET /api/print-files
 * Returns list of print files (for dev shortcut)
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '10')
    const sort = searchParams.get('sort') || '-createdAt'

    const payload = await getPayload({ config: configPromise })

    const files = await payload.find({
      collection: 'print-files',
      limit,
      sort,
      where: {
        analysisStatus: {
          equals: 'complete',
        },
      },
    })

    return NextResponse.json(files)
  } catch (error) {
    console.error('[Print Files API] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch print files' }, { status: 500 })
  }
}
