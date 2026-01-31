import { z } from 'zod'
import { prisma } from '~~/server/utils/prisma'
import { sanitizeHtml, sanitizeVideoIframe } from '~~/server/utils/sanitize'

const createLessonSchema = z.object({
  courseId: z.string().min(1, 'ID kursu jest wymagane'),
  moduleId: z.string().optional().nullable(),
  title: z.string().min(1, 'Tytuł jest wymagany'),
  contentHtml: z.string().optional().nullable(),
  videoUrl: z.string().url().optional().nullable(),
  videoIframe: z.string().optional().nullable(),
  order: z.number().int().min(0).optional(),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const result = createLessonSchema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: result.error.errors[0].message,
    })
  }

  const { courseId, moduleId, title, order: providedOrder } = result.data
  // Sanitize HTML content
  const contentHtml = result.data.contentHtml ? sanitizeHtml(result.data.contentHtml) : null
  const videoUrl = result.data.videoUrl || null
  const videoIframe = result.data.videoIframe ? sanitizeVideoIframe(result.data.videoIframe) : null

  // Check if course exists
  const course = await prisma.course.findUnique({
    where: { id: courseId },
  })

  if (!course) {
    throw createError({
      statusCode: 404,
      message: 'Kurs nie został znaleziony',
    })
  }

  // If moduleId is provided, verify it exists and belongs to this course
  if (moduleId) {
    const module = await prisma.module.findFirst({
      where: { id: moduleId, courseId },
    })

    if (!module) {
      throw createError({
        statusCode: 400,
        message: 'Moduł nie został znaleziony',
      })
    }
  }

  // If order not provided, get the next order
  let order = providedOrder
  if (order === undefined) {
    const lastLesson = await prisma.lesson.findFirst({
      where: {
        courseId,
        moduleId: moduleId || null,
      },
      orderBy: { order: 'desc' },
    })
    order = lastLesson ? lastLesson.order + 1 : 0
  }

  const lesson = await prisma.lesson.create({
    data: {
      courseId,
      moduleId: moduleId || null,
      title,
      contentHtml,
      videoUrl,
      videoIframe,
      order,
    },
  })

  return { lesson }
})
