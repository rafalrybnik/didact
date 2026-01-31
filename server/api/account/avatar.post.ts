import { getStorageAdapter, validateImage } from '../../utils/storage'

export default defineEventHandler(async (event) => {
  // Check authentication - any logged in user can upload avatar
  const auth = event.context.auth
  if (!auth?.userId) {
    throw createError({
      statusCode: 401,
      message: 'Musisz być zalogowany',
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

  // Find the file field
  const fileField = formData.find(f => f.name === 'file' || f.name === 'image')

  if (!fileField || !fileField.data) {
    throw createError({
      statusCode: 400,
      message: 'Brak pliku w żądaniu',
    })
  }

  const contentType = fileField.type || 'application/octet-stream'
  const filename = fileField.filename || 'avatar'

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
