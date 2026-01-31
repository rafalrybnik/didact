import { promises as fs } from 'fs'
import { join, extname } from 'path'
import { randomUUID } from 'crypto'

// Storage adapter interface
export interface StorageAdapter {
  upload(file: Buffer, filename: string, contentType: string): Promise<string>
  delete(key: string): Promise<void>
  getPublicUrl(key: string): string
}

// Local filesystem storage (for development)
class LocalStorageAdapter implements StorageAdapter {
  private uploadDir: string
  private publicPath: string

  constructor() {
    this.uploadDir = join(process.cwd(), 'public', 'uploads')
    this.publicPath = '/api/files'
  }

  async upload(file: Buffer, filename: string, contentType: string): Promise<string> {
    // Ensure upload directory exists
    await fs.mkdir(this.uploadDir, { recursive: true })

    // Generate unique filename
    const ext = extname(filename) || this.getExtensionFromContentType(contentType)
    const uniqueFilename = `${randomUUID()}${ext}`
    const filepath = join(this.uploadDir, uniqueFilename)

    // Write file
    await fs.writeFile(filepath, file)

    return uniqueFilename
  }

  async delete(key: string): Promise<void> {
    const filepath = join(this.uploadDir, key)
    try {
      await fs.unlink(filepath)
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        throw error
      }
      // File doesn't exist - ignore
    }
  }

  getPublicUrl(key: string): string {
    return `/api/file?name=${encodeURIComponent(key)}`
  }

  private getExtensionFromContentType(contentType: string): string {
    const map: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
      'image/svg+xml': '.svg',
      'application/pdf': '.pdf',
    }
    return map[contentType] || ''
  }
}

// S3-compatible storage (for production - Cloudflare R2, AWS S3, etc.)
class S3StorageAdapter implements StorageAdapter {
  private endpoint: string
  private accessKey: string
  private secretKey: string
  private bucket: string
  private publicUrl: string

  constructor() {
    this.endpoint = process.env.STORAGE_ENDPOINT || ''
    this.accessKey = process.env.STORAGE_ACCESS_KEY || ''
    this.secretKey = process.env.STORAGE_SECRET_KEY || ''
    this.bucket = process.env.STORAGE_BUCKET || ''
    this.publicUrl = process.env.STORAGE_PUBLIC_URL || ''
  }

  async upload(file: Buffer, filename: string, contentType: string): Promise<string> {
    // Generate unique key
    const ext = extname(filename) || ''
    const key = `${randomUUID()}${ext}`

    // Create S3-compatible request
    const url = `${this.endpoint}/${this.bucket}/${key}`

    const response = await fetch(url, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': contentType,
        'x-amz-acl': 'public-read',
        // Note: For production, implement proper AWS Signature v4
        // This is simplified - use @aws-sdk/client-s3 for full implementation
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to upload file: ${response.statusText}`)
    }

    return key
  }

  async delete(key: string): Promise<void> {
    const url = `${this.endpoint}/${this.bucket}/${key}`

    const response = await fetch(url, {
      method: 'DELETE',
      // Note: Add proper authentication headers
    })

    if (!response.ok && response.status !== 404) {
      throw new Error(`Failed to delete file: ${response.statusText}`)
    }
  }

  getPublicUrl(key: string): string {
    return `${this.publicUrl}/${key}`
  }
}

// Factory function to get appropriate storage adapter
function createStorageAdapter(): StorageAdapter {
  const useS3 = Boolean(
    process.env.STORAGE_ENDPOINT &&
    process.env.STORAGE_ACCESS_KEY &&
    process.env.STORAGE_SECRET_KEY &&
    process.env.STORAGE_BUCKET
  )

  if (useS3) {
    return new S3StorageAdapter()
  }

  return new LocalStorageAdapter()
}

// Singleton instance
let storageInstance: StorageAdapter | null = null

export function getStorageAdapter(): StorageAdapter {
  if (!storageInstance) {
    storageInstance = createStorageAdapter()
  }
  return storageInstance
}

// Validation helpers
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB

export function validateImage(file: Buffer, contentType: string): { valid: boolean; error?: string } {
  if (!ALLOWED_IMAGE_TYPES.includes(contentType)) {
    return { valid: false, error: 'Invalid image type. Allowed: JPEG, PNG, GIF, WebP' }
  }

  if (file.length > MAX_IMAGE_SIZE) {
    return { valid: false, error: 'Image too large. Maximum size: 5MB' }
  }

  return { valid: true }
}

const ALLOWED_FILE_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export function validateFile(file: Buffer, contentType: string): { valid: boolean; error?: string } {
  if (!ALLOWED_FILE_TYPES.includes(contentType)) {
    return { valid: false, error: 'Invalid file type' }
  }

  if (file.length > MAX_FILE_SIZE) {
    return { valid: false, error: 'File too large. Maximum size: 10MB' }
  }

  return { valid: true }
}
