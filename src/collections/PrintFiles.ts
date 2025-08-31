import type { CollectionConfig } from 'payload'
import path from 'path'
import { fileURLToPath } from 'url'
import { readFile } from 'fs/promises'

import { authenticated } from '../access/authenticated'
import { anyone } from '../access/anyone'
import { validatePrintFile, performSecurityScan, analyzeFileMetadata } from '../utilities/fileValidation'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const PrintFiles: CollectionConfig = {
  slug: 'print-files',
  labels: {
    singular: '3D Print File',
    plural: '3D Print Files',
  },
  access: {
    create: anyone, // Allow anyone to upload 3D print files
    delete: authenticated, // Only authenticated users can delete
    read: authenticated, // Only authenticated users can read (for admin access)
    update: authenticated, // Only authenticated users can update
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'A descriptive name for this print file',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Optional description or notes about this print file',
      },
    },
    {
      name: 'customerEmail',
      type: 'email',
      admin: {
        description: 'Customer email for order communication',
      },
    },
    {
      name: 'isGuest',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether this was uploaded by a guest or registered user',
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Uploaded', value: 'uploaded' },
        { label: 'Processing', value: 'processing' },
        { label: 'Analyzed', value: 'analyzed' },
        { label: 'Quote Ready', value: 'quote-ready' },
        { label: 'Approved', value: 'approved' },
        { label: 'In Queue', value: 'in-queue' },
        { label: 'Printing', value: 'printing' },
        { label: 'Completed', value: 'completed' },
        { label: 'Rejected', value: 'rejected' },
      ],
      defaultValue: 'uploaded',
      admin: {
        description: 'Current status of this print job',
      },
    },
    {
      name: 'analysisData',
      type: 'json',
      admin: {
        description: 'File analysis results (dimensions, volume, etc.)',
      },
    },
    {
      name: 'estimatedCost',
      type: 'number',
      admin: {
        description: 'Estimated cost in cents',
      },
    },
    {
      name: 'estimatedPrintTime',
      type: 'number',
      admin: {
        description: 'Estimated print time in minutes',
      },
    },
    {
      name: 'securityScanResults',
      type: 'json',
      admin: {
        description: 'Security scan results and virus check status',
      },
    },
  ],
  upload: {
    staticDir: path.resolve(dirname, '../../print-files'),
    mimeTypes: [
      'application/sla', // STL files
      'model/stl', // STL files (alternative MIME type)
      'application/octet-stream', // Generic binary (covers many 3D formats)
      'model/3mf', // 3MF files
      'application/vnd.ms-3mfdocument', // 3MF files (Microsoft)
      'model/gltf+json', // GLTF
      'model/gltf-binary', // GLB
      'application/json', // For JSON-based 3D formats
    ],
    adminThumbnail: () => {
      // Since these are 3D files, we'll show a generic 3D file icon
      // Later we can implement 3D thumbnails or previews
      return '/api/print-files/thumbnail/3d-file-icon.png'
    },
    filesRequiredOnCreate: true,
    // Security settings
    disableLocalStorage: false, // Keep local storage for development
    // File size limits for 3D print files (larger than typical images)
  },
  hooks: {
    beforeChange: [
      async ({ req, data, operation }) => {
        // Auto-populate timestamps and metadata
        const now = new Date().toISOString()
        
        if (operation === 'create') {
          data.uploadedAt = now
          
          // Validate file if present
          if (req.file) {
            req.payload.logger.info(`File object keys: ${Object.keys(req.file).join(', ')}`)
            
            const validation = validatePrintFile({
              name: req.file.name,
              size: req.file.size,
              type: req.file.mimetype,
            })
            
            if (!validation.isValid) {
              throw new Error(`File validation failed: ${validation.errors.join(', ')}`)
            }
            
            // Store validation warnings
            if (validation.warnings.length > 0) {
              data.validationWarnings = validation.warnings
            }
            
            // Try to get file buffer from different sources
            let fileBuffer: Buffer | null = null
            
            try {
              if (req.file.data && Buffer.isBuffer(req.file.data) && req.file.data.length > 0) {
                // Direct buffer access (only if it has content)
                fileBuffer = req.file.data
                req.payload.logger.info(`Using direct buffer, size: ${fileBuffer.length} bytes`)
              } else if (req.file.tempFilePath) {
                // Read from temporary file
                fileBuffer = await readFile(req.file.tempFilePath)
                req.payload.logger.info(`Read from tempFilePath: ${req.file.tempFilePath}, size: ${fileBuffer.length} bytes`)
              } else {
                req.payload.logger.warn(`No accessible file data. req.file.data type: ${typeof req.file.data}, size: ${req.file.data?.length || 'N/A'}, tempFilePath: ${req.file.tempFilePath}`)
              }
            } catch (readError) {
              const errorMessage = readError instanceof Error ? readError.message : 'Unknown error'
              req.payload.logger.error(`Failed to read file data: ${errorMessage}`)
            }
            
            if (fileBuffer && fileBuffer.length > 0) {
              try {
                req.payload.logger.info(`Analyzing file: ${req.file.name}, Buffer size: ${fileBuffer.length} bytes`)
                
                // Security scan
                const securityScan = await performSecurityScan(fileBuffer, req.file.name)
                
                // File analysis
                const metadata = await analyzeFileMetadata(fileBuffer, req.file.name)
                
                // Store analysis results
                data.securityScanResults = securityScan
                data.analysisData = metadata
                data.status = securityScan.passed ? 'analyzed' : 'rejected'
                
                req.payload.logger.info(`File analysis completed for: ${req.file.name}`)
                
                if (!securityScan.passed) {
                  req.payload.logger.warn(`Security scan failed for file ${req.file.name}: ${securityScan.threats.join(', ')}`)
                }
                
              } catch (error) {
                req.payload.logger.error(`Failed to analyze file ${req.file.name}:`, error)
                const errorMessage = error instanceof Error ? error.message : 'Unknown error'
                data.analysisData = { error: 'Analysis failed', message: errorMessage }
                data.status = 'processing'
              }
            } else {
              req.payload.logger.warn(`No file buffer available for analysis`)
              data.status = 'processing'
              data.analysisData = { error: 'No file buffer available for analysis' }
            }
          }
        }
        
        data.updatedAt = now
        return data
      },
    ],
    afterChange: [
      async ({ req, doc, operation }) => {
        if (operation === 'create' && doc.filename) {
          req.payload.logger.info(`New 3D print file uploaded: ${doc.filename}, Status: ${doc.status}`)
        }
      },
    ],
  },
}