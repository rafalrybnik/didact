import { promises as fs } from 'fs'
import { join, extname } from 'path'
import { randomUUID } from 'crypto'
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

// Storage adapter interface
export interface StorageAdapter {
  upload(file: Buffer, filename: string, contentType: string): Promise<string>
  delete(key: string): Promise<void>
  getPublicUrl(key: string): string
}

// Local filesystem storage (for development without MinIO)
class LocalStorageAdapter implements StorageAdapter {
  private uploadDir: string

  constructor() {
    this.uploadDir = join(process.cwd(), 'public', 'uploads')
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
      'application/zip': '.zip',
    }
    return map[contentType] || ''
  }
}

// S3-compatible storage (MinIO for dev, Cloudflare R2 for production)
class S3StorageAdapter implements StorageAdapter {
  private client: S3Client
  private bucket: string
  private publicUrl: string

  constructor() {
    const endpoint = process.env.STORAGE_ENDPOINT || 'http://localhost:9000'
    const region = process.env.STORAGE_REGION || 'auto'
    const accessKeyId = process.env.STORAGE_ACCESS_KEY || 'minioadmin'
    const secretAccessKey = process.env.STORAGE_SECRET_KEY || 'minioadmin'

    this.bucket = process.env.STORAGE_BUCKET || 'didact-uploads'
    this.publicUrl = process.env.STORAGE_PUBLIC_URL || `${endpoint}/${this.bucket}`

    this.client = new S3Client({
      endpoint,
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true, // Required for MinIO and R2
    })
  }

  async upload(file: Buffer, filename: string, contentType: string): Promise<string> {
    // Generate unique key with folder structure
    const ext = extname(filename) || this.getExtensionFromContentType(contentType)
    const folder = this.getFolderFromContentType(contentType)
    const key = `${folder}/${randomUUID()}${ext}`

    await this.client.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file,
      ContentType: contentType,
    }))

    return key
  }

  async delete(key: string): Promise<void> {
    try {
      await this.client.send(new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }))
    } catch (error: any) {
      // Ignore if file doesn't exist
      if (error.name !== 'NoSuchKey') {
        throw error
      }
    }
  }

  getPublicUrl(key: string): string {
    return `${this.publicUrl}/${key}`
  }

  private getExtensionFromContentType(contentType: string): string {
    const map: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
      'image/svg+xml': '.svg',
      'application/pdf': '.pdf',
      'application/zip': '.zip',
    }
    return map[contentType] || ''
  }

  private getFolderFromContentType(contentType: string): string {
    if (contentType.startsWith('image/')) return 'images'
    if (contentType === 'application/pdf') return 'documents'
    return 'files'
  }
}

// Factory function to get appropriate storage adapter
function createStorageAdapter(): StorageAdapter {
  const useS3 = Boolean(process.env.STORAGE_ENDPOINT)

  if (useS3) {
    console.log('[Storage] Using S3-compatible storage')
    return new S3StorageAdapter()
  }

  console.log('[Storage] Using local filesystem storage')
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
    return { valid: false, error: 'Nieprawidłowy format obrazu. Dozwolone: JPEG, PNG, GIF, WebP' }
  }

  if (file.length > MAX_IMAGE_SIZE) {
    return { valid: false, error: 'Obraz jest za duży. Maksymalny rozmiar: 5MB' }
  }

  return { valid: true }
}

const ALLOWED_ATTACHMENT_TYPES = [
  'application/pdf',
  'application/zip',
  'application/x-zip-compressed',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
]
const MAX_ATTACHMENT_SIZE = 20 * 1024 * 1024 // 20MB

export function validateAttachment(file: Buffer, contentType: string): { valid: boolean; error?: string } {
  if (!ALLOWED_ATTACHMENT_TYPES.includes(contentType)) {
    return { valid: false, error: 'Nieprawidłowy typ pliku. Dozwolone: PDF, ZIP, Word, Excel, TXT' }
  }

  if (file.length > MAX_ATTACHMENT_SIZE) {
    return { valid: false, error: 'Plik jest za duży. Maksymalny rozmiar: 20MB' }
  }

  return { valid: true }
}
