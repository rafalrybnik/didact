import { z } from 'zod'
import { prisma } from '~~/server/utils/prisma'
import { sanitizeHtml, sanitizeVideoIframe } from '~~/server/utils/sanitize'
import { optionalUrl } from '~~/server/utils/validation'

const updateLessonSchema = z.object({
  title: z.string().min(1, 'Tytuł jest wymagany').optional(),
  moduleId: z.string().optional().nullable(),
  contentHtml: z.string().optional().nullable(),
  videoUrl: optionalUrl,
  videoIframe: z.string().optional().nullable(),
  order: z.number().int().min(0).optional(),
  dripDays: z.number().int().min(0).optional().nullable(),
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'ID lekcji jest wymagane',
    })
  }

  const body = await readBody(event)

  const result = updateLessonSchema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: result.error.errors[0].message,
    })
  }

  // Check if lesson exists
  const existingLesson = await prisma.lesson.findUnique({
    where: { id },
  })

  if (!existingLesson) {
    throw createError({
      statusCode: 404,
      message: 'Lekcja nie została znaleziona',
    })
  }

  // If moduleId is being updated, verify it exists and belongs to the same course
  if (result.data.moduleId !== undefined && result.data.moduleId !== null) {
    const module = await prisma.module.findFirst({
      where: { id: result.data.moduleId, courseId: existingLesson.courseId },
    })

    if (!module) {
      throw createError({
        statusCode: 400,
        message: 'Moduł nie został znaleziony',
      })
    }
  }

  // Sanitize HTML content
  const data = {
    ...result.data,
    ...(result.data.contentHtml !== undefined && {
      contentHtml: result.data.contentHtml ? sanitizeHtml(result.data.contentHtml) : null,
    }),
    ...(result.data.videoIframe !== undefined && {
      videoIframe: result.data.videoIframe ? sanitizeVideoIframe(result.data.videoIframe) : null,
    }),
  }

  const lesson = await prisma.lesson.update({
    where: { id },
    data,
  })

  return { lesson }
})
