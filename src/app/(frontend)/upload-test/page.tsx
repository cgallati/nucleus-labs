'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { PrintFileUpload } from '@/components/PrintFileUpload'

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

export default function UploadTestPage() {
  const [uploadStatus, setUploadStatus] = useState<string>('')
  const [lastUploadedFile, setLastUploadedFile] = useState<UploadedFileData | null>(null)

  const handleUploadComplete = (fileId: string, fileData: UploadedFileData) => {
    setUploadStatus('Upload successful!')
    setLastUploadedFile(fileData)
    console.log('Upload completed:', { fileId, fileData })
  }

  const handleUploadError = (error: string) => {
    setUploadStatus(`Upload error: ${error}`)
    console.error('Upload error:', error)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            3D Print File Upload Test
          </h1>
          <p className="text-gray-600">
            Test the file upload functionality for Nucleus Labs 3D printing service
          </p>
        </div>

        {/* Upload Component */}
        <PrintFileUpload
          onUploadComplete={handleUploadComplete}
          onUploadError={handleUploadError}
        />

        {/* Status Display */}
        {uploadStatus && (
          <div className={`mt-6 p-4 rounded-lg ${
            uploadStatus.includes('error') 
              ? 'bg-red-100 border border-red-200 text-red-800'
              : 'bg-green-100 border border-green-200 text-green-800'
          }`}>
            <p className="font-medium">{uploadStatus}</p>
          </div>
        )}

        {/* Last Uploaded File Info */}
        {lastUploadedFile && (
          <div className="mt-6 bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">Last Uploaded File</h3>
            <div className="space-y-2 text-sm">
              <div><strong>ID:</strong> {lastUploadedFile.id}</div>
              <div><strong>Title:</strong> {lastUploadedFile.title}</div>
              <div><strong>Filename:</strong> {lastUploadedFile.filename}</div>
              <div><strong>Size:</strong> {Math.round(lastUploadedFile.filesize / 1024)} KB</div>
              <div><strong>Status:</strong> {lastUploadedFile.status}</div>
              <div><strong>Customer Email:</strong> {lastUploadedFile.customerEmail}</div>
              {lastUploadedFile.description && (
                <div><strong>Description:</strong> {lastUploadedFile.description}</div>
              )}
              <div><strong>Upload Time:</strong> {new Date(lastUploadedFile.createdAt).toLocaleString()}</div>
              
              {lastUploadedFile.analysisData && (
                <div className="mt-4 p-3 bg-gray-50 rounded">
                  <strong>Analysis Data:</strong>
                  <pre className="text-xs mt-1 overflow-x-auto">
                    {JSON.stringify(lastUploadedFile.analysisData, null, 2)}
                  </pre>
                </div>
              )}
              
              {lastUploadedFile.securityScanResults && (
                <div className="mt-4 p-3 bg-gray-50 rounded">
                  <strong>Security Scan:</strong>
                  <pre className="text-xs mt-1 overflow-x-auto">
                    {JSON.stringify(lastUploadedFile.securityScanResults, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Testing Instructions</h3>
          <ul className="text-blue-800 space-y-2 text-sm">
            <li>• Upload a valid 3D file (STL, OBJ, etc.) to test the validation</li>
            <li>• Try uploading invalid file types to test rejection</li>
            <li>• Check the browser console for detailed logs</li>
            <li>• Uploaded files are stored in the `/print-files` directory</li>
            <li>• File analysis and security scanning happen automatically after upload</li>
            <li>• Admin panel: <Link href="/admin" className="underline">/admin</Link> to view uploaded files</li>
          </ul>
        </div>
      </div>
    </div>
  )
}