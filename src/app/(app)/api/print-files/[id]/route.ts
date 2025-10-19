import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export const runtime = 'nodejs'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    console.log('[Print Files API] Polling request for file ID:', id)

    const payload = await getPayload({ config: configPromise })

    // Get the file
    const file = await payload.findByID({
      collection: 'print-files',
      id,
      overrideAccess: true, // Allow guest access for polling
    })

    if (!file) {
      console.error('[Print Files API] File not found:', id)
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 },
      )
    }

    console.log('[Print Files API] Returning file status:', {
      id: file.id,
      filename: file.filename,
      analysisStatus: file.analysisStatus,
      scanStatus: file.scanStatus,
      estimatedCost: file.estimatedCost,
    })

    return NextResponse.json({
      id: file.id,
      filename: file.filename,
      fileSize: file.fileSize,
      fileType: file.fileType,
      scanStatus: file.scanStatus,
      analysisStatus: file.analysisStatus,
      estimatedCost: file.estimatedCost,
      analysis: file.analysis,
    })
  } catch (error) {
    console.error('[Print Files API] Error fetching print file:', error)
    console.error('[Print Files API] Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { error: 'Failed to fetch file' },
      { status: 500 },
    )
  }
}
