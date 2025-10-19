'use client'

import React, { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/utilities/cn'
import { Button } from '@/components/ui/button'

const ACCEPTED_FILE_TYPES = {
  'model/stl': ['.stl'],
  'application/sla': ['.3mf'],
  'model/obj': ['.obj'],
  'application/vnd.ms-pki.stl': ['.stl'],
}

const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB

interface UploadedFile {
  file: File
  id: string
  status: 'uploading' | 'analyzing' | 'success' | 'error'
  error?: string
  analysisStatus?: 'pending' | 'analyzing' | 'complete' | 'failed'
  estimatedCost?: number
}

export function FileUpload() {
  const router = useRouter()
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return `File size exceeds 100MB limit`
    }

    // Check file type
    const fileExt = file.name.toLowerCase().split('.').pop()
    const validExtensions = ['.stl', '.3mf', '.obj']
    if (!fileExt || !validExtensions.some((ext) => ext.includes(fileExt))) {
      return `Invalid file type. Please upload STL, 3MF, or OBJ files`
    }

    return null
  }

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    console.log('[FileUpload] Handling', fileArray.length, 'file(s)')

    const newFiles: UploadedFile[] = fileArray.map((file) => {
      const localId = `${file.name}-${Date.now()}-${Math.random()}`
      console.log('[FileUpload] Creating local file entry:', { name: file.name, localId })
      return {
        file,
        id: localId,
        status: 'uploading' as const,
      }
    })

    setUploadedFiles((prev) => {
      console.log('[FileUpload] Current file count:', prev.length, 'Adding:', newFiles.length)
      return [...prev, ...newFiles]
    })
    setIsUploading(true)

    // Process each file
    for (const uploadedFile of newFiles) {
      console.log('[FileUpload] Processing file:', uploadedFile.file.name, 'with local ID:', uploadedFile.id)
      const validationError = validateFile(uploadedFile.file)

      if (validationError) {
        console.error('[FileUpload] Validation failed:', validationError)
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === uploadedFile.id
              ? { ...f, status: 'error' as const, error: validationError }
              : f,
          ),
        )
        continue
      }

      try {
        // Upload file to server
        console.log('[FileUpload] Uploading file to server:', uploadedFile.file.name)
        const formData = new FormData()
        formData.append('file', uploadedFile.file)

        const response = await fetch('/api/upload-print-file', {
          method: 'POST',
          body: formData,
          credentials: 'include',
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error('[FileUpload] Upload failed:', errorData)
          throw new Error(errorData.error || 'Upload failed')
        }

        const result = await response.json()
        console.log('[FileUpload] Upload successful. Server ID:', result.id, 'Local ID:', uploadedFile.id)

        setUploadedFiles((prev) =>
          prev.map((f) => {
            if (f.id === uploadedFile.id) {
              console.log('[FileUpload] Updating file status to analyzing for:', uploadedFile.file.name)
              return {
                ...f,
                status: 'analyzing' as const,
                id: result.id, // Update to server ID
                analysisStatus: result.analysisStatus,
              }
            }
            return f
          }),
        )

        // Poll for analysis completion - use server ID for polling
        console.log('[FileUpload] Starting polling for file:', result.id)
        pollFileAnalysis(result.id)
      } catch (error) {
        console.error('[FileUpload] Error uploading file:', error)
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === uploadedFile.id
              ? {
                  ...f,
                  status: 'error' as const,
                  error: error instanceof Error ? error.message : 'Upload failed. Please try again.'
                }
              : f,
          ),
        )
      }
    }

    setIsUploading(false)
    console.log('[FileUpload] Finished processing all files')
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const files = e.dataTransfer.files
      if (files.length > 0) {
        handleFiles(files)
      }
    },
    [handleFiles],
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        handleFiles(files)
      }
    },
    [handleFiles],
  )

  const handleRemoveFile = useCallback((id: string) => {
    console.log('[FileUpload] Removing file with ID:', id)
    setUploadedFiles((prev) => {
      const filtered = prev.filter((f) => f.id !== id)
      console.log('[FileUpload] Files remaining after removal:', filtered.length)
      return filtered
    })
  }, [])

  const pollFileAnalysis = useCallback(async (fileId: string) => {
    const maxAttempts = 60 // 60 seconds max (increased from 30)
    let attempts = 0

    console.log('[FileUpload] Starting poll for file ID:', fileId)

    const poll = async () => {
      try {
        console.log('[FileUpload] Polling attempt', attempts + 1, 'for file:', fileId)
        const response = await fetch(`/api/print-files/${fileId}`, {
          credentials: 'include',
        })

        if (!response.ok) {
          console.error('[FileUpload] Polling request failed with status:', response.status)
          throw new Error('Failed to fetch file status')
        }

        const fileData = await response.json()
        console.log('[FileUpload] Poll response for', fileId, ':', {
          analysisStatus: fileData.analysisStatus,
          scanStatus: fileData.scanStatus,
          estimatedCost: fileData.estimatedCost,
        })

        setUploadedFiles((prev) =>
          prev.map((f) => {
            if (f.id === fileId) {
              console.log('[FileUpload] Updating file status for:', fileId, 'Status:', fileData.analysisStatus)
              return {
                ...f,
                analysisStatus: fileData.analysisStatus,
                estimatedCost: fileData.estimatedCost,
                status:
                  fileData.analysisStatus === 'complete'
                    ? ('success' as const)
                    : fileData.analysisStatus === 'failed'
                      ? ('error' as const)
                      : ('analyzing' as const),
                error:
                  fileData.analysisStatus === 'failed' && fileData.scanStatus === 'threat'
                    ? 'File exceeds build volume (256×256×256mm)'
                    : fileData.analysisStatus === 'failed'
                      ? 'Analysis failed'
                      : undefined,
              }
            }
            return f
          }),
        )

        // Continue polling if still analyzing
        if (
          fileData.analysisStatus === 'analyzing' ||
          fileData.analysisStatus === 'pending'
        ) {
          attempts++
          if (attempts < maxAttempts) {
            console.log('[FileUpload] Still analyzing, will poll again in 1 second')
            setTimeout(poll, 1000) // Poll every second
          } else {
            // Timeout - mark as error
            console.error('[FileUpload] Polling timeout after', maxAttempts, 'attempts for file:', fileId)
            setUploadedFiles((prev) =>
              prev.map((f) =>
                f.id === fileId
                  ? { ...f, status: 'error' as const, error: 'Analysis timeout' }
                  : f,
              ),
            )
          }
        } else {
          console.log('[FileUpload] Analysis complete for file:', fileId, 'Final status:', fileData.analysisStatus)
        }
      } catch (error) {
        console.error('[FileUpload] Polling error for file:', fileId, error)
      }
    }

    // Start polling after a short delay to allow job to start
    console.log('[FileUpload] Scheduling first poll in 2 seconds')
    setTimeout(poll, 2000) // Increased from 1s to 2s to give job more time to start
  }, [])

  const hasSuccessfulUploads = uploadedFiles.some((f) => f.status === 'success')

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-[#505050] text-[22px] font-normal mb-8">Upload Your 3D Print Files</h2>

      {/* Drag and Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'border-[1.9px] border-dashed rounded-[14px] transition-all',
          'min-h-[400px] flex flex-col items-center justify-center p-12',
          {
            'border-[#3a3a3a] bg-[#f5f5f5]': isDragging,
            'border-[#e7e7e7] bg-white': !isDragging,
          },
        )}
      >
        <div className="text-center space-y-6">
          {/* Upload Icon */}
          <div className="flex justify-center">
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#a0a0a0"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>

          <div className="space-y-3">
            <p className="text-[#505050] text-[18px]">
              Drag and drop your 3D files here, or click to browse
            </p>
            <p className="text-[#a0a0a0] text-[15px]">
              Supports STL, 3MF, and OBJ files up to 100MB
            </p>
          </div>

          {/* Hidden File Input */}
          <input
            type="file"
            id="file-upload"
            multiple
            accept=".stl,.3mf,.obj"
            onChange={handleFileInput}
            className="hidden"
          />

          <Button
            onClick={() => document.getElementById('file-upload')?.click()}
            className="bg-[#3a3a3a] hover:bg-[#505050] text-white rounded-[9px] px-8 h-[42px] text-[16px] font-normal"
          >
            Choose Files
          </Button>
        </div>
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="mt-8 space-y-4">
          <h3 className="text-[#505050] text-[19px] font-normal">Uploaded Files</h3>
          <div className="space-y-3">
            {uploadedFiles.map((uploadedFile) => (
              <div
                key={uploadedFile.id}
                className="border-[1.9px] border-[#e7e7e7] rounded-[14px] p-6 flex items-center justify-between"
              >
                <div className="flex items-center gap-4 flex-1">
                  {/* File Icon */}
                  <div className="w-10 h-10 rounded-lg bg-[#f5f5f5] flex items-center justify-center">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#505050"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>

                  <div className="flex-1">
                    <p className="text-[#505050] text-[16px] font-normal">
                      {uploadedFile.file.name}
                    </p>
                    <p className="text-[#a0a0a0] text-[14px]">
                      {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    {uploadedFile.status === 'analyzing' && (
                      <p className="text-[#505050] text-[14px] mt-1">Analyzing file...</p>
                    )}
                    {uploadedFile.status === 'success' && uploadedFile.estimatedCost && (
                      <p className="text-green-600 text-[14px] mt-1 font-medium">
                        Estimated cost: ${uploadedFile.estimatedCost.toFixed(2)}
                      </p>
                    )}
                    {uploadedFile.error && (
                      <p className="text-red-500 text-[14px] mt-1">{uploadedFile.error}</p>
                    )}
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="flex items-center gap-3">
                  {(uploadedFile.status === 'uploading' || uploadedFile.status === 'analyzing') && (
                    <div className="w-5 h-5 border-2 border-[#3a3a3a] border-t-transparent rounded-full animate-spin" />
                  )}
                  {uploadedFile.status === 'success' && (
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  )}
                  {uploadedFile.status === 'error' && (
                    <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </div>
                  )}

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveFile(uploadedFile.id)}
                    className="text-[#a0a0a0] hover:text-[#505050] transition-colors"
                    aria-label="Remove file"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-end gap-4 mt-12">
        <Button
          onClick={() => router.push('/')}
          variant="outline"
          className="border-[#3a3a3a] border-[1.6px] text-[#3a3a3a] hover:bg-[#f5f5f5] rounded-[9px] px-8 h-[42px] text-[16px] font-normal"
        >
          Back
        </Button>
        <Button
          disabled={!hasSuccessfulUploads || isUploading}
          onClick={() => router.push('/new-order/material')}
          className="bg-[#3a3a3a] hover:bg-[#505050] text-white rounded-[9px] px-8 h-[42px] text-[16px] font-normal disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </Button>
      </div>
    </div>
  )
}
