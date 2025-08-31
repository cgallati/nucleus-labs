'use client'

import React, { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface UploadedFileData {
  id: string
  filename: string
  filesize: number
  status: string
  title: string
  customerEmail: string
  description?: string
  createdAt: string
  analysisData?: Record<string, unknown>
  securityScanResults?: Record<string, unknown>
}

interface FileUploadProps {
  onUploadComplete?: (fileId: string, fileData: UploadedFileData) => void
  onUploadError?: (error: string) => void
}

interface UploadProgress {
  isUploading: boolean
  progress: number
  fileName: string
}

export const PrintFileUpload: React.FC<FileUploadProps> = ({
  onUploadComplete,
  onUploadError
}) => {
  const [dragActive, setDragActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [customerEmail, setCustomerEmail] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  // Handle dropped files
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      setSelectedFile(file)
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, '')) // Remove extension
      }
    }
  }, [title])

  // Handle file input change
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''))
      }
    }
  }, [title])

  // Upload file
  const handleUpload = async () => {
    if (!selectedFile || !customerEmail || !title) {
      onUploadError?.('Please provide all required fields')
      return
    }

    setUploadProgress({
      isUploading: true,
      progress: 0,
      fileName: selectedFile.name
    })

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('_payload', JSON.stringify({
        title,
        description,
        customerEmail,
        isGuest: true,
        status: 'uploaded'
      }))

      const response = await fetch('/api/print-files', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Upload failed')
      }

      const result = await response.json()

      setUploadProgress({
        isUploading: false,
        progress: 100,
        fileName: selectedFile.name
      })

      // Reset form
      setSelectedFile(null)
      setTitle('')
      setDescription('')
      setCustomerEmail('')

      onUploadComplete?.(result.doc.id, result.doc)

    } catch (error) {
      console.error('Upload error:', error)
      setUploadProgress(null)
      onUploadError?.(error instanceof Error ? error.message : 'Upload failed')
    }
  }

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Upload Your 3D Print File</CardTitle>
          <CardDescription>
            Upload your 3D model file (.STL, .OBJ, .3MF, etc.) to get a quote and place your order.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Drop Zone */}
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                : selectedFile
                ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="file-upload"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept=".stl,.obj,.3mf,.ply,.gcode,.gltf,.glb,.dae,.fbx,.x3d"
              onChange={handleFileSelect}
            />
            
            {selectedFile ? (
              <div className="space-y-2">
                <div className="w-12 h-12 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                >
                  Change File
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-medium">Drop your 3D file here</p>
                  <p className="text-gray-500">or click to browse</p>
                  <p className="text-xs text-gray-400 mt-2">
                    Supports: STL, OBJ, 3MF, PLY, G-code, GLTF, GLB, DAE, FBX, X3D
                  </p>
                  <p className="text-xs text-gray-400">Maximum file size: 50MB</p>
                </div>
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Project Title *</Label>
              <Input
                id="title"
                type="text"
                placeholder="Enter a name for your print job"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                We&apos;ll send your quote and updates to this email
              </p>
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                type="text"
                placeholder="Any special requirements or notes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          {/* Upload Progress */}
          {uploadProgress && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading {uploadProgress.fileName}</span>
                <span>{uploadProgress.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Upload Button */}
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || !customerEmail || !title || uploadProgress?.isUploading}
            className="w-full"
            size="lg"
          >
            {uploadProgress?.isUploading ? 'Uploading...' : 'Upload & Get Quote'}
          </Button>

          {/* File Requirements */}
          <div className="text-xs text-gray-500 space-y-1">
            <p><strong>Supported formats:</strong> STL, OBJ, 3MF, PLY, G-code, GLTF, GLB, DAE, FBX, X3D</p>
            <p><strong>Maximum size:</strong> 50MB per file</p>
            <p><strong>What happens next:</strong> Your file will be analyzed for printability and you&apos;ll receive a quote within minutes</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}