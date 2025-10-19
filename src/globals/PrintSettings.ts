import type { GlobalConfig } from 'payload'

export const PrintSettings: GlobalConfig = {
  slug: 'print-settings',
  admin: {
    group: '3D Printing',
  },
  access: {
    read: () => true, // Public read for cost calculation
    update: ({ req: { user } }) => user?.roles?.includes('admin') ?? false,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Printer Specifications',
          fields: [
            {
              name: 'printerModel',
              type: 'text',
              defaultValue: 'Bambu Labs X1C',
              admin: {
                description: 'Current 3D printer model',
              },
            },
            {
              name: 'buildVolume',
              type: 'group',
              label: 'Build Volume (mm)',
              fields: [
                {
                  name: 'x',
                  type: 'number',
                  required: true,
                  defaultValue: 256,
                  admin: {
                    description: 'Maximum width in millimeters',
                  },
                },
                {
                  name: 'y',
                  type: 'number',
                  required: true,
                  defaultValue: 256,
                  admin: {
                    description: 'Maximum depth in millimeters',
                  },
                },
                {
                  name: 'z',
                  type: 'number',
                  required: true,
                  defaultValue: 256,
                  admin: {
                    description: 'Maximum height in millimeters',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Print Settings',
          fields: [
            {
              name: 'defaultLayerHeight',
              type: 'number',
              required: true,
              defaultValue: 0.2,
              admin: {
                description: 'Default layer height in mm (0.1, 0.2, 0.3)',
                step: 0.05,
              },
            },
            {
              name: 'defaultInfill',
              type: 'number',
              required: true,
              defaultValue: 20,
              min: 0,
              max: 100,
              admin: {
                description: 'Default infill percentage (0-100%)',
              },
            },
            {
              name: 'printSpeed',
              type: 'number',
              required: true,
              defaultValue: 150,
              admin: {
                description: 'Print speed in mm/s',
              },
            },
            {
              name: 'materialDensity',
              type: 'number',
              required: true,
              defaultValue: 1.24,
              admin: {
                description: 'PLA density in g/cm³ (1.24 for PLA)',
                step: 0.01,
              },
            },
          ],
        },
        {
          label: 'Pricing',
          fields: [
            {
              name: 'baseOrderFee',
              type: 'number',
              required: true,
              defaultValue: 5.0,
              admin: {
                description: 'Base fee per order in USD',
                step: 0.5,
              },
            },
            {
              name: 'pricePerGram',
              type: 'number',
              required: true,
              defaultValue: 0.03,
              admin: {
                description: 'Price per gram of filament in USD',
                step: 0.01,
              },
            },
            {
              name: 'hourlyMachineRate',
              type: 'number',
              required: true,
              defaultValue: 8.0,
              admin: {
                description: 'Machine operation cost per hour in USD',
                step: 0.5,
              },
            },
            {
              name: 'minimumCharge',
              type: 'number',
              required: true,
              defaultValue: 10.0,
              admin: {
                description: 'Minimum total charge per print in USD',
                step: 1.0,
              },
            },
          ],
        },
        {
          label: 'Materials & Colors',
          fields: [
            {
              name: 'materials',
              type: 'array',
              label: 'Available Materials',
              admin: {
                description: 'Filament materials available for printing',
              },
              fields: [
                {
                  name: 'name',
                  type: 'text',
                  required: true,
                  admin: {
                    description: 'Material name (e.g., "PLA Basic")',
                  },
                },
                {
                  name: 'type',
                  type: 'select',
                  required: true,
                  options: [
                    { label: 'PLA', value: 'pla' },
                    { label: 'ABS', value: 'abs' },
                    { label: 'PETG', value: 'petg' },
                    { label: 'TPU', value: 'tpu' },
                    { label: 'ASA', value: 'asa' },
                    { label: 'Nylon', value: 'nylon' },
                  ],
                  admin: {
                    description: 'Material type',
                  },
                },
                {
                  name: 'density',
                  type: 'number',
                  required: true,
                  defaultValue: 1.24,
                  admin: {
                    description: 'Material density in g/cm³',
                    step: 0.01,
                  },
                },
                {
                  name: 'costPerKg',
                  type: 'number',
                  required: true,
                  admin: {
                    description: 'Cost per kilogram in USD (for cost calculation)',
                    step: 0.01,
                  },
                },
                {
                  name: 'colors',
                  type: 'array',
                  label: 'Available Colors',
                  required: true,
                  fields: [
                    {
                      name: 'name',
                      type: 'text',
                      required: true,
                      admin: {
                        description: 'Color name (e.g., "Red", "Black")',
                      },
                    },
                    {
                      name: 'sku',
                      type: 'text',
                      admin: {
                        description: 'Manufacturer SKU (e.g., "10200")',
                      },
                    },
                    {
                      name: 'hexCode',
                      type: 'text',
                      admin: {
                        description: 'Hex color code for display (e.g., "#FF0000")',
                        placeholder: '#000000',
                      },
                    },
                    {
                      name: 'inStock',
                      type: 'checkbox',
                      defaultValue: true,
                      admin: {
                        description: 'Is this color currently in stock?',
                      },
                    },
                  ],
                },
                {
                  name: 'enabled',
                  type: 'checkbox',
                  defaultValue: true,
                  admin: {
                    description: 'Enable this material for customer selection',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Analysis Settings',
          fields: [
            {
              name: 'enableAutomaticAnalysis',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description: 'Automatically analyze files on upload',
              },
            },
            {
              name: 'rejectOversizedFiles',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description: 'Reject files that exceed build volume',
              },
            },
            {
              name: 'maxFileSize',
              type: 'number',
              required: true,
              defaultValue: 100,
              admin: {
                description: 'Maximum file size in MB',
              },
            },
          ],
        },
      ],
    },
  ],
}
