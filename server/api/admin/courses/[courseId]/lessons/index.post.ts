import { z } from 'zod'
import { prisma } from '~~/server/utils/prisma'

const createLessonSchema = z.object({
  title: z.string().min(1, 'Tytuł jest wymagany'),
  moduleId: z.string().optional().nullable(),
  contentHtml: z.string().optional().nullable(),
  videoUrl: z.string().url().optional().nullable(),
  videoIframe: z.string().optional().nullable(),
  order: z.number().int().min(0).optional(),
})

export default defineEventHandler(async (event) => {
  const courseId = getRouterParam(event, 'courseId')

  if (!courseId) {
    throw createError({
      statusCode: 400,
      message: 'ID kursu jest wymagane',
    })
  }

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

  const body = await readBody(event)

  const result = createLessonSchema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: result.error.errors[0].message,
    })
  }

  // If moduleId is provided, verify it exists and belongs to this course
  if (result.data.moduleId) {
    const module = await prisma.module.findFirst({
      where: { id: result.data.moduleId, courseId },
    })

    if (!module) {
      throw createError({
        statusCode: 400,
        message: 'Moduł nie został znaleziony',
      })
    }
  }

  // If order not provided, get the next order
  let order = result.data.order
  if (order === undefined) {
    const lastLesson = await prisma.lesson.findFirst({
      where: {
        courseId,
        moduleId: result.data.moduleId || null,
      },
      orderBy: { order: 'desc' },
    })
    order = lastLesson ? lastLesson.order + 1 : 0
  }

  const lesson = await prisma.lesson.create({
    data: {
      courseId,
      moduleId: result.data.moduleId || null,
      title: result.data.title,
      contentHtml: result.data.contentHtml,
      videoUrl: result.data.videoUrl,
      videoIframe: result.data.videoIframe,
      order,
    },
  })

  return { lesson }
})
