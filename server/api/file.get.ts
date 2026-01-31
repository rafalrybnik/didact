import { createReadStream, statSync, existsSync } from 'fs'
import { join, extname } from 'path'
import { sendStream, setHeader, getQuery } from 'h3'

// MIME type mapping
const mimeTypes: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const filename = query.name as string | undefined

  if (!filename) {
    throw createError({
      statusCode: 400,
      message: 'Filename is required',
    })
  }

  // Security: only allow simple filenames (no path traversal)
  if (filename.includes('/') || filename.includes('\\') || filename.includes('..')) {
    throw createError({
      statusCode: 400,
      message: 'Invalid filename',
    })
  }

  const uploadDir = join(process.cwd(), 'public', 'uploads')
  const filepath = join(uploadDir, filename)

  // Check if file exists
  if (!existsSync(filepath)) {
    throw createError({
      statusCode: 404,
      message: 'File not found',
    })
  }

  // Get file stats
  const stat = statSync(filepath)

  // Determine content type
  const ext = extname(filepath).toLowerCase()
  const contentType = mimeTypes[ext] || 'application/octet-stream'

  // Set headers
  setHeader(event, 'Content-Type', contentType)
  setHeader(event, 'Content-Length', stat.size)
  setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')

  // Stream the file
  const stream = createReadStream(filepath)
  return sendStream(event, stream)
})
