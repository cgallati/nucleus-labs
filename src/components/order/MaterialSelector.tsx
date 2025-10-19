'use client'

import React, { useEffect, useState } from 'react'
import { CheckIcon } from '@heroicons/react/24/solid'

interface Color {
  name: string
  sku: string
  hexCode: string
}

interface Material {
  name: string
  type: string
  density: number
  costPerKg: number
  colors: Color[]
}

interface MaterialSelectorProps {
  fileId: string
  onSelectionComplete?: (material: string, color: string) => void
}

export const MaterialSelector: React.FC<MaterialSelectorProps> = ({
  fileId,
  onSelectionComplete,
}) => {
  const [materials, setMaterials] = useState<Material[]>([])
  const [selectedMaterial, setSelectedMaterial] = useState<string>('')
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string>('')

  // Fetch available materials
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const response = await fetch('/api/materials')
        if (!response.ok) throw new Error('Failed to fetch materials')

        const data = await response.json()
        setMaterials(data.materials || [])

        // Auto-select first material if only one available
        if (data.materials?.length === 1) {
          setSelectedMaterial(data.materials[0].name)
        }
      } catch (err) {
        console.error('[MaterialSelector] Error fetching materials:', err)
        setError('Failed to load materials')
      } finally {
        setLoading(false)
      }
    }

    fetchMaterials()
  }, [])

  // Handle color selection and save to backend
  const handleColorSelect = async (colorName: string) => {
    if (!selectedMaterial) return

    setSelectedColor(colorName)
    setSaving(true)

    try {
      const response = await fetch(`/api/print-files/${fileId}/update-material`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          material: selectedMaterial,
          color: colorName,
        }),
      })

      if (!response.ok) throw new Error('Failed to save selection')

      const data = await response.json()
      console.log('[MaterialSelector] Selection saved:', data)

      if (onSelectionComplete) {
        onSelectionComplete(selectedMaterial, colorName)
      }
    } catch (err) {
      console.error('[MaterialSelector] Error saving selection:', err)
      setError('Failed to save selection')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading materials...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 p-6">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    )
  }

  if (materials.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">No materials available</p>
      </div>
    )
  }

  const currentMaterial = materials.find((m) => m.name === selectedMaterial)

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Select Material & Color</h3>
        <p className="text-sm text-muted-foreground">Choose your preferred filament color</p>
      </div>

      {/* Material Selection (hidden if only one material) */}
      {materials.length > 1 && (
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium">Material</label>
          <div className="grid gap-2">
            {materials.map((material) => (
              <button
                key={material.name}
                onClick={() => {
                  setSelectedMaterial(material.name)
                  setSelectedColor('') // Reset color when material changes
                }}
                className={`rounded-lg border-2 p-4 text-left transition-colors ${
                  selectedMaterial === material.name
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="font-medium">{material.name}</div>
                <div className="text-sm text-muted-foreground">
                  {material.colors.length} colors available
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Color Selection */}
      {currentMaterial && (
        <div>
          <label className="mb-3 block text-sm font-medium">
            Color ({currentMaterial.colors.length} available)
          </label>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {currentMaterial.colors.map((color) => (
              <button
                key={color.name}
                onClick={() => handleColorSelect(color.name)}
                disabled={saving}
                className={`group relative flex flex-col items-center gap-2 rounded-lg border-2 p-3 transition-all ${
                  selectedColor === color.name
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                } ${saving ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                {/* Color Swatch */}
                <div
                  className="h-12 w-12 rounded-full border-2 border-border shadow-sm"
                  style={{ backgroundColor: color.hexCode || '#888888' }}
                />

                {/* Selected Indicator */}
                {selectedColor === color.name && (
                  <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                    <CheckIcon className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}

                {/* Color Name */}
                <div className="text-center">
                  <div className="text-sm font-medium">{color.name}</div>
                  {color.sku && (
                    <div className="text-xs text-muted-foreground">{color.sku}</div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {saving && (
        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Saving selection...
        </div>
      )}
    </div>
  )
}
