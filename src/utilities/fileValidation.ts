// File validation utilities for 3D print files

export interface FileValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  fileInfo?: {
    size: number
    type: string
    extension: string
  }
}

export interface SecurityScanResult {
  passed: boolean
  threats: string[]
  scanDate: string
}

// Allowed 3D file extensions
const ALLOWED_3D_EXTENSIONS = [
  '.stl', '.STL',
  '.obj', '.OBJ',
  '.3mf', '.3MF',
  '.ply', '.PLY',
  '.gcode', '.GCODE',
  '.gltf', '.GLTF',
  '.glb', '.GLB',
  '.dae', '.DAE',
  '.fbx', '.FBX',
  '.x3d', '.X3D',
]

// File size limits (in bytes)
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
const MIN_FILE_SIZE = 1024 // 1KB

/**
 * Validate a 3D print file for basic requirements
 */
export function validatePrintFile(file: {
  name: string
  size: number
  type: string
}): FileValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  
  // Extract file extension
  const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
  
  // Check file extension
  if (!ALLOWED_3D_EXTENSIONS.some(ext => ext.toLowerCase() === extension)) {
    errors.push(`File type "${extension}" is not supported. Please upload a valid 3D model file.`)
  }
  
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    errors.push(`File size (${Math.round(file.size / 1024 / 1024)}MB) exceeds maximum limit of ${Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB.`)
  }
  
  if (file.size < MIN_FILE_SIZE) {
    errors.push(`File size is too small. Minimum file size is ${MIN_FILE_SIZE} bytes.`)
  }
  
  // Check filename for potential issues
  if (file.name.length > 255) {
    errors.push('Filename is too long. Maximum length is 255 characters.')
  }
  
  // Check for suspicious characters in filename
  const suspiciousChars = /[<>:"/\\|?*\x00-\x1f]/
  if (suspiciousChars.test(file.name)) {
    warnings.push('Filename contains special characters that may be modified during upload.')
  }
  
  // Additional warnings for specific file types
  if (extension === '.gcode') {
    warnings.push('G-code files will be analyzed but may require specific printer compatibility.')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    fileInfo: {
      size: file.size,
      type: file.type,
      extension,
    }
  }
}

/**
 * Perform basic security scanning on file content
 * This is a placeholder for more sophisticated virus/malware scanning
 */
export async function performSecurityScan(
  fileBuffer: Buffer,
  filename: string
): Promise<SecurityScanResult> {
  const threats: string[] = []
  const scanDate = new Date().toISOString()
  
  // Basic checks for suspicious content
  const fileContent = fileBuffer.toString('utf8', 0, Math.min(fileBuffer.length, 1024))
  
  // Check for executable signatures
  const executableSignatures = [
    'MZ', // DOS/Windows executable
    '\x7fELF', // Linux executable
    '\xfeedface', // macOS executable
    '#!/bin/', // Shell script
    '<?php', // PHP script
    '<script', // JavaScript
  ]
  
  for (const signature of executableSignatures) {
    if (fileBuffer.indexOf(signature) === 0 || fileContent.includes(signature)) {
      threats.push(`Potential executable content detected: ${signature}`)
    }
  }
  
  // Check for suspicious file headers that don't match extension
  const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'))
  
  if (extension === '.stl') {
    // STL files should start with "solid" (ASCII) or have binary header
    const isAsciiSTL = fileBuffer.toString('ascii', 0, 5) === 'solid'
    const isBinarySTL = fileBuffer.length >= 80 // Binary STL has 80-byte header
    
    if (!isAsciiSTL && !isBinarySTL) {
      threats.push('File extension .stl but content doesn\'t match STL format')
    }
  }
  
  // Check file size consistency
  if (fileBuffer.length === 0) {
    threats.push('Empty file detected')
  }
  
  return {
    passed: threats.length === 0,
    threats,
    scanDate,
  }
}

/**
 * Get file metadata and basic analysis
 */
export async function analyzeFileMetadata(
  fileBuffer: Buffer,
  filename: string
): Promise<{
  format: string
  isAscii: boolean
  estimatedVertices?: number
  estimatedTriangles?: number
}> {
  const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'))
  
  if (extension === '.stl') {
    return analyzeSTLFile(fileBuffer)
  }
  
  // Default analysis for unknown formats
  return {
    format: extension.substring(1).toUpperCase(),
    isAscii: isTextFile(fileBuffer),
  }
}

/**
 * Analyze STL file structure
 */
function analyzeSTLFile(buffer: Buffer): {
  format: string
  isAscii: boolean
  estimatedVertices?: number
  estimatedTriangles?: number
} {
  // Check if ASCII STL
  const header = buffer.toString('ascii', 0, 5)
  const isAscii = header === 'solid'
  
  if (isAscii) {
    // ASCII STL analysis
    const content = buffer.toString('utf8')
    const triangleMatches = content.match(/facet normal/g)
    const vertexMatches = content.match(/vertex/g)
    
    return {
      format: 'STL',
      isAscii: true,
      estimatedTriangles: triangleMatches?.length || 0,
      estimatedVertices: vertexMatches?.length || 0,
    }
  } else {
    // Binary STL analysis
    if (buffer.length >= 84) {
      // Read triangle count from bytes 80-83 (little endian)
      const triangleCount = buffer.readUInt32LE(80)
      
      return {
        format: 'STL',
        isAscii: false,
        estimatedTriangles: triangleCount,
        estimatedVertices: triangleCount * 3, // Each triangle has 3 vertices
      }
    }
    
    return {
      format: 'STL',
      isAscii: false,
    }
  }
}

/**
 * Check if file appears to be text-based
 */
function isTextFile(buffer: Buffer): boolean {
  const sample = buffer.slice(0, 512)
  let nullBytes = 0
  let textChars = 0
  
  for (let i = 0; i < sample.length; i++) {
    const byte = sample[i]
    if (byte === 0) {
      nullBytes++
    } else if ((byte >= 32 && byte <= 126) || byte === 9 || byte === 10 || byte === 13) {
      textChars++
    }
  }
  
  // If more than 95% are text characters and less than 1% null bytes, likely text
  return textChars / sample.length > 0.95 && nullBytes / sample.length < 0.01
}