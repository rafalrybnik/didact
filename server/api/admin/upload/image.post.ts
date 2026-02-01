import { getStorageAdapter, validateImage } from '~~/server/utils/storage'

export default defineEventHandler(async (event) => {
  // Check admin auth
  const auth = event.context.auth
  if (!auth || auth.role !== 'ADMIN') {
    throw createError({
      statusCode: 403,
      message: 'Brak uprawnień',
    })
  }

  // Parse multipart form data
  const formData = await readMultipartFormData(event)
  if (!formData) {
    throw createError({
      statusCode: 400,
      message: 'Brak pliku',
    })
  }

  const file = formData.find(f => f.name === 'image')
  if (!file || !file.data) {
    throw createError({
      statusCode: 400,
      message: 'Brak obrazu w żądaniu',
    })
  }

  const contentType = file.type || 'application/octet-stream'
  const filename = file.filename || 'image'

  // Validate image
  const validation = validateImage(file.data, contentType)
  if (!validation.valid) {
    throw createError({
      statusCode: 400,
      message: validation.error,
    })
  }

  // Upload to storage
  const storage = getStorageAdapter()
  const key = await storage.upload(file.data, filename, contentType)
  const url = storage.getPublicUrl(key)

  return {
    success: true,
    url,
    key,
  }
})
