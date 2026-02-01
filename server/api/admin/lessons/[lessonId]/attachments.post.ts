import { z } from 'zod'
import { prisma } from '~~/server/utils/prisma'
import { getStorageAdapter } from '~~/server/utils/storage'

const ALLOWED_ATTACHMENT_TYPES = [
  'application/pdf',
  'application/zip',
  'application/x-zip-compressed',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]
const MAX_ATTACHMENT_SIZE = 20 * 1024 * 1024 // 20MB

interface Attachment {
  name: string
  url: string
  size: number
  type: string
}

export default defineEventHandler(async (event) => {
  const auth = event.context.auth

  if (!auth?.userId || auth.role !== 'ADMIN') {
    throw createError({
      statusCode: 403,
      message: 'Brak uprawnień',
    })
  }

  const lessonId = getRouterParam(event, 'lessonId')

  // Verify lesson exists
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
  })

  if (!lesson) {
    throw createError({
      statusCode: 404,
      message: 'Lekcja nie istnieje',
    })
  }

  // Parse multipart form data
  const formData = await readMultipartFormData(event)

  if (!formData || formData.length === 0) {
    throw createError({
      statusCode: 400,
      message: 'Brak pliku do przesłania',
    })
  }

  const storage = getStorageAdapter()
  const newAttachments: Attachment[] = []

  for (const file of formData) {
    if (!file.data || !file.filename) continue

    const contentType = file.type || 'application/octet-stream'

    // Validate file type
    if (!ALLOWED_ATTACHMENT_TYPES.includes(contentType)) {
      throw createError({
        statusCode: 400,
        message: `Niedozwolony typ pliku: ${contentType}. Dozwolone: PDF, ZIP, Word, Excel, TXT`,
      })
    }

    // Validate file size
    if (file.data.length > MAX_ATTACHMENT_SIZE) {
      throw createError({
        statusCode: 400,
        message: `Plik ${file.filename} jest za duży. Maksymalny rozmiar: 20MB`,
      })
    }

    // Upload file
    const key = await storage.upload(file.data, file.filename, contentType)
    const url = storage.getPublicUrl(key)

    newAttachments.push({
      name: file.filename,
      url,
      size: file.data.length,
      type: contentType,
    })
  }

  // Update lesson with new attachments
  const existingAttachments = (lesson.attachments as Attachment[] | null) || []
  const updatedAttachments = [...existingAttachments, ...newAttachments]

  await prisma.lesson.update({
    where: { id: lessonId },
    data: { attachments: updatedAttachments },
  })

  return { attachments: updatedAttachments }
})
