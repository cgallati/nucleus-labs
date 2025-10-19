import type { CollectionConfig } from 'payload'
import path from 'path'
import { fileURLToPath } from 'url'
import { checkRole } from '@/access/utilities'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const PrintFiles: CollectionConfig = {
  admin: {
    group: '3D Printing',
    useAsTitle: 'filename',
  },
  slug: 'print-files',
  access: {
    // Customers can read their own files, admins can read all
    read: ({ req: { user } }) => {
      if (checkRole(['admin'], user)) return true
      if (user) {
        return {
          user: {
            equals: user.id,
          },
        }
      }
      return false
    },
    // Allow anyone to create files (for guest checkout flow)
    create: () => true,
    // Users can only update their own files, admins can update all
    update: ({ req: { user } }) => {
      if (checkRole(['admin'], user)) return true
      if (user) {
        return {
          user: {
            equals: user.id,
          },
        }
      }
      return false
    },
    // Users can only delete their own files, admins can delete all
    delete: ({ req: { user } }) => {
      if (checkRole(['admin'], user)) return true
      if (user) {
        return {
          user: {
            equals: user.id,
          },
        }
      }
      return false
    },
  },
  fields: [
    {
      name: 'filename',
      type: 'text',
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: false,
      admin: {
        readOnly: true,
        description: 'User who uploaded this file (empty for guest uploads)',
      },
    },
    {
      name: 'fileSize',
      type: 'number',
      required: true,
      admin: {
        readOnly: true,
        description: 'File size in bytes',
      },
    },
    {
      name: 'fileType',
      type: 'select',
      required: true,
      options: [
        { label: 'STL', value: 'stl' },
        { label: '3MF', value: '3mf' },
        { label: 'OBJ', value: 'obj' },
      ],
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'material',
      type: 'text',
      admin: {
        description: 'Selected material (e.g., "PLA Basic")',
      },
    },
    {
      name: 'color',
      type: 'text',
      admin: {
        description: 'Selected color name (e.g., "Red")',
      },
    },
    {
      name: 'scanStatus',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Scanning', value: 'scanning' },
        { label: 'Clean', value: 'clean' },
        { label: 'Threat Detected', value: 'threat' },
      ],
      admin: {
        description: 'Security scan status',
      },
    },
    {
      name: 'analysisStatus',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Analyzing', value: 'analyzing' },
        { label: 'Complete', value: 'complete' },
        { label: 'Failed', value: 'failed' },
      ],
      admin: {
        description: '3D file analysis status',
      },
    },
    {
      name: 'estimatedCost',
      type: 'number',
      admin: {
        description: 'Estimated cost in USD',
        condition: (data) => data.analysisStatus === 'complete',
        readOnly: true,
      },
    },
    {
      name: 'analysis',
      type: 'group',
      admin: {
        condition: (data) => data.analysisStatus === 'complete',
      },
      fields: [
        {
          name: 'volume',
          type: 'number',
          admin: {
            description: 'Volume in cubic millimeters',
          },
        },
        {
          name: 'surfaceArea',
          type: 'number',
          admin: {
            description: 'Surface area in square millimeters',
          },
        },
        {
          name: 'boundingBox',
          type: 'group',
          fields: [
            {
              name: 'x',
              type: 'number',
              admin: {
                description: 'Width in mm',
              },
            },
            {
              name: 'y',
              type: 'number',
              admin: {
                description: 'Depth in mm',
              },
            },
            {
              name: 'z',
              type: 'number',
              admin: {
                description: 'Height in mm',
              },
            },
          ],
        },
        {
          name: 'estimatedPrintTime',
          type: 'number',
          admin: {
            description: 'Estimated print time in minutes',
          },
        },
        {
          name: 'triangleCount',
          type: 'number',
          admin: {
            description: 'Number of triangles in mesh',
          },
        },
      ],
    },
    {
      name: 'order',
      type: 'relationship',
      relationTo: 'orders',
      admin: {
        description: 'Associated order (if any)',
      },
    },
  ],
  upload: {
    staticDir: path.resolve(dirname, '../../uploads/print-files'),
    mimeTypes: [
      'application/sla',
      'model/stl',
      'application/vnd.ms-pki.stl',
      'model/x.stl-binary',
      'model/x.stl-ascii',
      'model/3mf',
      'application/vnd.ms-package.3dmanufacturing-3dmodel+xml',
      'model/obj',
      'application/octet-stream',
    ],
    imageSizes: [],
  },
  timestamps: true,
}
