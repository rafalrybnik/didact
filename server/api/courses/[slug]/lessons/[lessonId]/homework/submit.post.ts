import { z } from 'zod'
import { prisma } from '~~/server/utils/prisma'
import { getStorageAdapter, validateImage } from '~~/server/utils/storage'

const submitHomeworkSchema = z.object({
  contentText: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  const auth = event.context.auth

  if (!auth?.userId) {
    throw createError({
      statusCode: 401,
      message: 'Musisz być zalogowany',
    })
  }

  const slug = getRouterParam(event, 'slug')
  const lessonId = getRouterParam(event, 'lessonId')

  if (!slug || !lessonId) {
    throw createError({
      statusCode: 400,
      message: 'Brak wymaganych parametrów',
    })
  }

  // Check course and enrollment
  const course = await prisma.course.findUnique({
    where: { slug },
  })

  if (!course) {
    throw createError({
      statusCode: 404,
      message: 'Kurs nie istnieje',
    })
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: auth.userId,
        courseId: course.id,
      },
    },
  })

  if (!enrollment) {
    throw createError({
      statusCode: 403,
      message: 'Nie masz dostępu do tego kursu',
    })
  }

  // Get homework
  const homework = await prisma.homework.findFirst({
    where: {
      lessonId,
      lesson: {
        courseId: course.id,
      },
    },
  })

  if (!homework) {
    throw createError({
      statusCode: 404,
      message: 'Zadanie domowe nie istnieje',
    })
  }

  // Check if already submitted with PENDING status
  const existingSubmission = await prisma.submission.findFirst({
    where: {
      userId: auth.userId,
      homeworkId: homework.id,
      status: 'PENDING',
    },
  })

  if (existingSubmission) {
    throw createError({
      statusCode: 400,
      message: 'Masz już oczekujące zgłoszenie',
    })
  }

  // Handle multipart form data for file uploads
  let contentText: string | null = null
  let fileUrl: string | null = null

  const contentType = getHeader(event, 'content-type') || ''

  if (contentType.includes('multipart/form-data')) {
    const formData = await readMultipartFormData(event)

    if (formData) {
      for (const field of formData) {
        if (field.name === 'contentText' && field.data) {
          contentText = field.data.toString('utf-8')
        } else if (field.name === 'file' && field.data && field.data.length > 0) {
          if (!homework.allowFile) {
            throw createError({
              statusCode: 400,
              message: 'Przesyłanie plików jest wyłączone dla tego zadania',
            })
          }

          const mimeType = field.type || 'application/octet-stream'

          // Validate file size (max 10MB)
          if (field.data.length > 10 * 1024 * 1024) {
            throw createError({
              statusCode: 400,
              message: 'Plik jest za duży (max 10MB)',
            })
          }

          // Generate filename
          const ext = field.filename?.split('.').pop() || 'bin'
          const filename = `homework/${auth.userId}/${Date.now()}.${ext}`

          const storage = getStorageAdapter()
          fileUrl = await storage.upload(field.data, filename, mimeType)
        }
      }
    }
  } else {
    const body = await readBody(event)
    const result = submitHomeworkSchema.safeParse(body)

    if (result.success) {
      contentText = result.data.contentText || null
    }
  }

  // Validate submission
  if (!homework.allowText && contentText) {
    throw createError({
      statusCode: 400,
      message: 'Odpowiedź tekstowa jest wyłączona dla tego zadania',
    })
  }

  if (!contentText && !fileUrl) {
    throw createError({
      statusCode: 400,
      message: 'Musisz przesłać tekst lub plik',
    })
  }

  // Create submission
  const submission = await prisma.submission.create({
    data: {
      userId: auth.userId,
      homeworkId: homework.id,
      contentText,
      fileUrl,
    },
  })

  return {
    submission: {
      id: submission.id,
      contentText: submission.contentText,
      fileUrl: submission.fileUrl,
      status: submission.status,
      createdAt: submission.createdAt,
    },
  }
})
