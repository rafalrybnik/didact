import { prisma } from '~~/server/utils/prisma'
import { getStorageAdapter } from '~~/server/utils/storage'

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
  const indexStr = getRouterParam(event, 'index')
  const index = parseInt(indexStr || '', 10)

  if (isNaN(index) || index < 0) {
    throw createError({
      statusCode: 400,
      message: 'Nieprawidłowy indeks załącznika',
    })
  }

  // Get lesson
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
  })

  if (!lesson) {
    throw createError({
      statusCode: 404,
      message: 'Lekcja nie istnieje',
    })
  }

  const attachments = (lesson.attachments as Attachment[] | null) || []

  if (index >= attachments.length) {
    throw createError({
      statusCode: 404,
      message: 'Załącznik nie istnieje',
    })
  }

  // Get attachment to delete
  const attachmentToDelete = attachments[index]

  // Extract filename from URL for storage deletion
  const urlParts = attachmentToDelete.url.split('=')
  const filename = urlParts.length > 1 ? decodeURIComponent(urlParts[1]) : null

  // Delete from storage if we can extract filename
  if (filename) {
    const storage = getStorageAdapter()
    try {
      await storage.delete(filename)
    } catch (e) {
      console.error('Failed to delete file from storage:', e)
      // Continue anyway - file might already be gone
    }
  }

  // Remove attachment from array
  const updatedAttachments = attachments.filter((_, i) => i !== index)

  // Update lesson
  await prisma.lesson.update({
    where: { id: lessonId },
    data: { attachments: updatedAttachments.length > 0 ? updatedAttachments : null },
  })

  return { attachments: updatedAttachments }
})
