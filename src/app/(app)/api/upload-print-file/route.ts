import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const uploadStartTime = Date.now()
  console.log('[Upload API] Starting file upload at', new Date().toISOString())

  try {
    const payload = await getPayload({ config: configPromise })
    console.log('[Upload API] Payload instance obtained')

    // Get user from session if logged in (optional for guests)
    let user = null
    try {
      const authResult = await payload.auth({ headers: req.headers })
      user = authResult.user
      console.log('[Upload API] Authenticated user:', user?.id)
    } catch (_error) {
      // User not authenticated - that's okay, we'll allow guest uploads
      console.log('[Upload API] Guest upload detected')
    }

    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      console.error('[Upload API] No file provided in request')
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 },
      )
    }

    console.log('[Upload API] File received:', {
      name: file.name,
      size: file.size,
      type: file.type,
    })

    // Validate file type
    const fileExt = file.name.toLowerCase().split('.').pop()
    const validExtensions = ['stl', '3mf', 'obj']

    if (!fileExt || !validExtensions.includes(fileExt)) {
      console.error('[Upload API] Invalid file type:', fileExt)
      return NextResponse.json(
        { error: 'Invalid file type. Only STL, 3MF, and OBJ files are supported.' },
        { status: 400 },
      )
    }

    console.log('[Upload API] File type validated:', fileExt)

    // Validate file size (100MB max)
    const maxSize = 100 * 1024 * 1024
    if (file.size > maxSize) {
      console.error('[Upload API] File size exceeds limit:', file.size)
      return NextResponse.json(
        { error: 'File size exceeds 100MB limit' },
        { status: 400 },
      )
    }

    console.log('[Upload API] File size validated:', (file.size / 1024 / 1024).toFixed(2), 'MB')

    // Convert File to Buffer
    console.log('[Upload API] Converting file to buffer...')
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    console.log('[Upload API] Buffer created, size:', buffer.length)

    // Determine MIME type based on file extension if browser doesn't provide it
    let mimetype = file.type || 'application/octet-stream'

    if (!file.type || file.type === 'application/octet-stream') {
      const mimeMap: Record<string, string> = {
        stl: 'model/stl',
        '3mf': 'model/3mf',
        obj: 'model/obj',
      }
      mimetype = mimeMap[fileExt] || 'application/octet-stream'
    }

    console.log('[Upload API] MIME type determined:', mimetype)

    // Create the print file record
    console.log('[Upload API] Creating print file record in database...')
    const printFile = await payload.create({
      collection: 'print-files',
      data: {
        filename: file.name,
        user: user?.id || undefined,
        fileSize: file.size,
        fileType: fileExt as 'stl' | '3mf' | 'obj',
        scanStatus: 'pending',
        analysisStatus: 'pending',
      },
      file: {
        data: buffer,
        mimetype,
        name: file.name,
        size: file.size,
      },
      overrideAccess: true, // Allow guest uploads
    })

    console.log('[Upload API] Print file created:', {
      id: printFile.id,
      filename: printFile.filename,
      url: printFile.url,
    })

    // Get print settings to check if automatic analysis is enabled
    console.log('[Upload API] Fetching print settings...')
    const settings = await payload.findGlobal({
      slug: 'print-settings',
    })

    console.log('[Upload API] Print settings loaded:', {
      enableAutomaticAnalysis: settings.enableAutomaticAnalysis,
    })

    // Queue analysis job if enabled
    if (settings.enableAutomaticAnalysis && printFile.filename) {
      try {
        console.log('[Upload API] Queueing analysis job...')
        // Construct absolute file path
        const filePath = `${process.cwd()}/uploads/print-files/${printFile.filename}`
        console.log('[Upload API] File path for analysis:', filePath)

        const job = await payload.jobs.queue({
          task: 'analyzeFile',
          input: {
            fileId: printFile.id,
            filePath: filePath,
            fileType: printFile.fileType,
          },
          queue: 'default',
        })

        console.log('[Upload API] Analysis job queued successfully:', job.id)
      } catch (jobError) {
        console.error('[Upload API] Failed to queue analysis job:', jobError)
        // Don't fail the upload if job queueing fails
      }
    } else {
      console.log('[Upload API] Automatic analysis disabled or no filename')
    }

    const uploadDuration = Date.now() - uploadStartTime
    console.log('[Upload API] Upload completed successfully in', uploadDuration, 'ms')

    return NextResponse.json({
      id: printFile.id,
      filename: printFile.filename,
      fileSize: printFile.fileSize,
      fileType: printFile.fileType,
      scanStatus: printFile.scanStatus,
      analysisStatus: printFile.analysisStatus,
    })
  } catch (error) {
    console.error('[Upload API] File upload error:', error)
    console.error('[Upload API] Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 },
    )
  }
}
