import { getStorageAdapter, validateImage } from '../../utils/storage'

export default defineEventHandler(async (event) => {
  // Check authentication
  const auth = event.context.auth
  if (!auth || auth.role !== 'ADMIN') {
    throw createError({
      statusCode: 403,
      message: 'Dostęp zabroniony',
    })
  }

  // Parse multipart form data
  const formData = await readMultipartFormData(event)

  if (!formData || formData.length === 0) {
    throw createError({
      statusCode: 400,
      message: 'Brak pliku',
    })
  }

  // Find the file field (expected name: "file" or "image")
  const fileField = formData.find(f => f.name === 'file' || f.name === 'image')

  if (!fileField || !fileField.data) {
    throw createError({
      statusCode: 400,
      message: 'Brak pliku w żądaniu',
    })
  }

  const contentType = fileField.type || 'application/octet-stream'
  const filename = fileField.filename || 'upload'

  // Validate image
  const validation = validateImage(fileField.data, contentType)
  if (!validation.valid) {
    throw createError({
      statusCode: 400,
      message: validation.error,
    })
  }

  // Upload to storage
  const storage = getStorageAdapter()
  const key = await storage.upload(fileField.data, filename, contentType)
  const url = storage.getPublicUrl(key)

  return {
    success: true,
    key,
    url,
  }
})
